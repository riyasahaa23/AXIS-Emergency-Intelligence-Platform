from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "axis-analyser"}


@router.get("/health/live")
async def liveness() -> dict[str, str]:
    return {"status": "ok", "service": "axis-analyser", "check": "liveness"}


@router.get("/health/ready")
async def readiness(request: Request):
    database_ready = request.app.state.database_engine is not None
    settings = request.app.state.settings
    if not database_ready and settings.environment == "production":
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "database": "unavailable"},
        )
    return {
        "status": "ok" if database_ready else "degraded",
        "database": "ready" if database_ready else "in_memory_fallback",
    }
