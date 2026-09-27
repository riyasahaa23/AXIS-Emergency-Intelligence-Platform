from fastapi import HTTPException, Request


def require_scope(scope: str):
    async def dependency(request: Request) -> None:
        context = getattr(request.state, "auth", None)
        if context is None or (scope not in context.scopes and "*" not in context.scopes):
            raise HTTPException(
                status_code=403,
                detail={"code": "INSUFFICIENT_SCOPE", "message": f"Scope '{scope}' is required"},
            )

    return dependency
