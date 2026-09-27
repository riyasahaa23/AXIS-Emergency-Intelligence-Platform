from __future__ import annotations

import secrets
from dataclasses import dataclass
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


@dataclass(frozen=True)
class AuthContext:
    subject: str
    scopes: frozenset[str]
    method: str


def _credential(request: Request) -> str | None:
    value = request.headers.get("x-api-key")
    if value:
        return value.strip()
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


def _match(value: str, configured: str | None) -> bool:
    return bool(value and configured and secrets.compare_digest(value, configured))


class GatewayMiddleware(BaseHTTPMiddleware):
    """Request identity, request IDs and optional production authentication.

    Development remains usable with blank keys. Production requires a configured
    key and denies API requests when no credential is supplied.
    """

    def __init__(self, app, settings) -> None:
        super().__init__(app)
        self.settings = settings

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id") or str(uuid4())
        request.state.request_id = request_id

        public = request.url.path in {"/health", "/health/live", "/docs", "/openapi.json"} or request.url.path.startswith("/redoc")
        credential = _credential(request)
        context: AuthContext | None = None
        if _match(credential or "", self.settings.api_key_admin):
            context = AuthContext("admin", frozenset({"*", "admin"}), "api_key")
        elif _match(credential or "", self.settings.api_key_readonly):
            context = AuthContext("readonly", frozenset({"read"}), "api_key")
        elif _match(credential or "", self.settings.api_key_operator):
            context = AuthContext("operator", frozenset({"read", "analyse", "simulate", "recommend"}), "api_key")
        elif credential:
            return self._denied(request_id, "AUTH_DENIED", "Invalid API credential")
        elif self.settings.environment == "production" and not public:
            return self._denied(request_id, "AUTH_DENIED", "Authentication is required")
        elif not public:
            context = AuthContext("anonymous-development", frozenset({"read", "analyse", "simulate"}), "anonymous")

        request.state.auth = context
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        return response

    @staticmethod
    def _denied(request_id: str, code: str, message: str) -> JSONResponse:
        return JSONResponse(
            status_code=401,
            content={"error": {"code": code, "message": message, "request_id": request_id}},
            headers={"x-request-id": request_id},
        )


def install_gateway(app: FastAPI, settings) -> None:
    app.add_middleware(GatewayMiddleware, settings=settings)
