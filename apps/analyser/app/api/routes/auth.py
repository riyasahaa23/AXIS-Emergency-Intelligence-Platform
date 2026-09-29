from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from app.auth.service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])
SESSION_COOKIE = "axis_session"


class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=8, max_length=128)


def auth_service(request: Request) -> AuthService:
    return request.app.state.auth_service


def set_session_cookie(response: Response, request: Request, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=AuthService.session_days * 24 * 60 * 60,
        httponly=True,
        secure=request.app.state.settings.environment == "production",
        samesite="lax",
        path="/",
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: Credentials, request: Request, response: Response):
    try:
        user = await auth_service(request).register(str(payload.email), payload.password)
        _, token = await auth_service(request).login(str(payload.email), payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    set_session_cookie(response, request, token)
    return {"user": user}


@router.post("/login")
async def login(payload: Credentials, request: Request, response: Response):
    try:
        user, token = await auth_service(request).login(str(payload.email), payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    set_session_cookie(response, request, token)
    return {"user": user}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    try:
        user, token = await auth_service(request).refresh(request.cookies.get(SESSION_COOKIE))
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    set_session_cookie(response, request, token)
    return {"user": user}


@router.post("/logout")
async def logout(request: Request, response: Response):
    await auth_service(request).logout(request.cookies.get(SESSION_COOKIE))
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"ok": True}


@router.get("/me")
async def me(request: Request):
    user = await auth_service(request).user_for_context(getattr(request.state, "auth", None))
    if not user:
        raise HTTPException(status_code=401, detail="Authentication is required")
    return {"user": user}
