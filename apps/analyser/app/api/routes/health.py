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
    settings = request.app.state.settings
    database_ready = False
    database_engine = request.app.state.database_engine
    if database_engine is not None:
        try:
            from sqlalchemy import text

            async with database_engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
            database_ready = True
        except Exception:  # noqa: BLE001 - readiness must fail closed
            database_ready = False

    events = request.app.state.events
    events_ready = True
    if settings.redis_url:
        try:
            await events.client.ping()
            events_ready = events.__class__.__name__ == "RedisStreamPublisher"
        except Exception:  # noqa: BLE001 - readiness must fail closed
            events_ready = False

    if (not database_ready or not events_ready) and settings.environment == "production":
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "database": "ready" if database_ready else "unavailable",
                "events": "redis" if events_ready else "unavailable",
            },
        )
    llm_status = "disabled"
    if settings.llm_provider == "ollama":
        llm_status = "configured" if settings.ollama_base_url and settings.ollama_model else "misconfigured"
    return {
        "status": "ok" if database_ready and events_ready else "degraded",
        "database": "ready" if database_ready else "in_memory_fallback",
        "llm": llm_status,
        "events": "redis" if events_ready and settings.redis_url else "in_memory",
        "object_storage": settings.object_storage_backend,
    }
