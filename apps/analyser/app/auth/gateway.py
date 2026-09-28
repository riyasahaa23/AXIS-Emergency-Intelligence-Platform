from __future__ import annotations

import hashlib
import secrets
import time
from dataclasses import dataclass
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.rate_limit import SlidingWindowRateLimiter


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
        self.limiter = SlidingWindowRateLimiter(settings.rate_limit_per_minute)
        self.redis = None

    async def dispatch(self, request: Request, call_next):
        settings = getattr(request.app.state, "settings", self.settings)
        request_id = request.headers.get("x-request-id") or str(uuid4())
        request.state.request_id = request_id

        # Preserve the documented versioned API contract while the internal
        # routers continue to use the stable canonical path.
        if request.url.path.startswith("/api/v1/"):
            request.scope["path"] = "/api/" + request.url.path.removeprefix("/api/v1/")

        if request.scope["path"].startswith("/api/"):
            identity = request.client.host if request.client else "unknown"
            try:
                allowed, retry_after = await self._allow(identity)
            except RuntimeError:
                return self._denied(request_id, "RATE_LIMIT_UNAVAILABLE", "Rate limiting is temporarily unavailable", 503)
            if not allowed:
                response = self._denied(request_id, "RATE_LIMITED", "Request rate limit exceeded", 429)
                response.headers["retry-after"] = str(retry_after)
                return response

        public = request.url.path in {"/health", "/health/live", "/health/ready", "/metrics", "/docs", "/openapi.json"} or request.url.path.startswith("/redoc")
        credential = _credential(request)
        context: AuthContext | None = None
        if _match(credential or "", settings.api_key_admin):
            context = AuthContext("admin", frozenset({"*", "admin"}), "api_key")
        elif _match(credential or "", settings.api_key_readonly):
            context = AuthContext("readonly", frozenset({"read"}), "api_key")
        elif _match(credential or "", settings.api_key_operator):
            context = AuthContext("operator", frozenset({"read", "analyse", "simulate", "recommend", "ingest", "schedule", "approve"}), "api_key")
        elif credential:
            from app.audit.service import record_audit
            request.state.auth = AuthContext("unknown", frozenset(), "invalid")
            response = self._denied(request_id, "AUTH_DENIED", "Invalid API credential")
            await record_audit(request, "AUTHENTICATION", "denied", metadata={"reason": "invalid_credential"})
            return response
        elif settings.environment == "production" and not public:
            from app.audit.service import record_audit
            request.state.auth = None
            response = self._denied(request_id, "AUTH_DENIED", "Authentication is required")
            await record_audit(request, "AUTHENTICATION", "denied", metadata={"reason": "missing_credential"})
            return response
        elif not public and settings.environment == "development" and settings.allow_anonymous_demo:
            context = AuthContext("anonymous-development", frozenset({"read", "analyse", "simulate", "ingest", "schedule", "recommend"}), "anonymous")
        elif not public:
            from app.audit.service import record_audit
            request.state.auth = None
            response = self._denied(request_id, "AUTH_DENIED", "Authentication is required")
            await record_audit(request, "AUTHENTICATION", "denied", metadata={"reason": "missing_credential"})
            return response

        request.state.auth = context
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        return response

    async def _allow(self, identity: str) -> tuple[bool, int]:
        if self.settings.redis_url:
            try:
                if self.redis is None:
                    from redis.asyncio import Redis

                    self.redis = Redis.from_url(self.settings.redis_url, decode_responses=True)
                bucket = int(time.time() // 60)
                key = f"axis:rate:{hashlib.sha256(identity.encode()).hexdigest()}:{bucket}"
                count = await self.redis.incr(key)
                if count == 1:
                    await self.redis.expire(key, 60)
                if count > self.settings.rate_limit_per_minute:
                    return False, 60 - (int(time.time()) % 60)
                return True, 0
            except Exception:  # noqa: BLE001 - local fallback is explicitly opt-in
                if self.settings.environment == "production" or not self.settings.allow_in_memory_fallback:
                    raise RuntimeError("Redis is required for API rate limiting in this runtime") from None
                return self.limiter.allow(identity)
        return self.limiter.allow(identity)

    @staticmethod
    def _denied(request_id: str, code: str, message: str, status_code: int = 401) -> JSONResponse:
        return JSONResponse(
            status_code=status_code,
            content={"error": {"code": code, "message": message, "request_id": request_id}},
            headers={"x-request-id": request_id},
        )


def install_gateway(app: FastAPI, settings) -> None:
    app.add_middleware(GatewayMiddleware, settings=settings)
