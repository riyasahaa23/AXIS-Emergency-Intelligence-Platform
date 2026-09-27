from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "axis-analyser"}


@router.get("/health/live")
async def liveness() -> dict[str, str]:
    return {"status": "ok", "service": "axis-analyser", "check": "liveness"}


@router.get("/metrics", response_class=PlainTextResponse)
async def metrics(request: Request) -> PlainTextResponse:
    return PlainTextResponse(request.app.state.metrics.render(), media_type="text/plain; version=0.0.4")


@router.get("/health/ready")
async def readiness(request: Request):
    database_ready = request.app.state.database_engine is not None
    settings = request.app.state.settings
    if not database_ready and settings.environment == "production":
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "database": "unavailable"},
        )
    llm_status = "disabled"
    if settings.llm_provider == "ollama":
        llm_status = "configured" if settings.ollama_base_url and settings.ollama_model else "misconfigured"
    events = request.app.state.events
    events_ready = events.__class__.__name__ == "RedisStreamPublisher" if settings.redis_url else True
    return {
        "status": "ok" if database_ready and events_ready else "degraded",
        "database": "ready" if database_ready else "in_memory_fallback",
        "llm": llm_status,
        "events": "redis" if events_ready and settings.redis_url else "in_memory",
        "object_storage": settings.object_storage_backend,
    }
