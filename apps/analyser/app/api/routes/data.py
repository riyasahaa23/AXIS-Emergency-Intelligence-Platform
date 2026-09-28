import asyncio

from fastapi import APIRouter, Depends, HTTPException, Request

from app.audit.service import record_audit
from app.auth.dependencies import require_scope
from app.ingestion.client import SourceNotConfigured
from app.ingestion.models import IngestionRequest
from app.ingestion.registry import SOURCE_REGISTRY
from app.ingestion.scheduler import IngestionScheduleCreate

router = APIRouter(prefix="/api/data", tags=["data-ingestion"])


@router.get("/telemetry", dependencies=[Depends(require_scope("read"))])
async def telemetry_summary(request: Request):
    """Return the operational summary from the configured incident store."""
    store = request.app.state.incident_manager.store
    incidents = store.list(limit=200, offset=0)
    incidents = await incidents if hasattr(incidents, "__await__") else incidents
    return {
        "satellitesOnline": 0,
        "weatherFeedsStatus": "Degraded" if not incidents else "Live",
        "groundSensors": 0,
        "dataSources": len(SOURCE_REGISTRY),
        "activeIncidents": sum(1 for incident in incidents if incident.status.value == "active"),
        "highRisk": sum(1 for incident in incidents if incident.severity >= 60),
        "countriesAffected": 0,
        "peopleAffected": str(sum(incident.population for incident in incidents)),
        "responseTeams": 0,
        "activeShelters": 0,
        "criticalResourcesPct": 0,
    }


@router.get("/sources", dependencies=[Depends(require_scope("read"))])
async def list_sources():
    return list(SOURCE_REGISTRY.values())


@router.get("/health", dependencies=[Depends(require_scope("read"))])
async def source_health(request: Request, source_id: str | None = None):
    source_ids = [source_id] if source_id else list(SOURCE_REGISTRY)
    semaphore = asyncio.Semaphore(8)

    async def check(item):
        async with semaphore:
            return await request.app.state.source_client.health(item)

    try:
        results = await asyncio.gather(*(check(item) for item in source_ids))
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Unknown data source: {exc.args[0]}") from exc
    return {"sources": results}


@router.get("/runs/{run_id}", dependencies=[Depends(require_scope("read"))])
async def get_ingestion_run(run_id: str, request: Request):
    try:
        return await request.app.state.ingestion_service.status(run_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Ingestion run not found") from exc


@router.get("/schedules", dependencies=[Depends(require_scope("read"))])
async def list_ingestion_schedules(request: Request):
    return await request.app.state.ingestion_scheduler.list()


@router.post("/schedules", status_code=201, dependencies=[Depends(require_scope("schedule"))])
async def create_ingestion_schedule(payload: IngestionScheduleCreate, request: Request):
    try:
        schedule = await request.app.state.ingestion_scheduler.create(payload)
        await record_audit(request, "SCHEDULE_CREATE", "success", "ingestion_schedule", schedule.id, {"source": schedule.source_id})
        return schedule
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Unknown data source: {exc.args[0]}") from exc


@router.post("/{source_id}/fetch", dependencies=[Depends(require_scope("ingest"))])
async def fetch_source(source_id: str, payload: IngestionRequest, request: Request):
    if source_id not in SOURCE_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Unknown data source: {source_id}")
    source_client = getattr(request.app.state, "source_client", None)
    if source_id == "firms" and (source_client is None or not source_client.firms_map_key):
        raise HTTPException(status_code=503, detail={"code": "SOURCE_NOT_CONFIGURED", "message": "NASA FIRMS requires AXIS_FIRMS_MAP_KEY"})
    if source_id == "india_hospitals" and (source_client is None or not source_client.india_hospitals_api_key):
        raise HTTPException(status_code=503, detail={"code": "SOURCE_NOT_CONFIGURED", "message": "India Hospital Directory requires AXIS_INDIA_HOSPITALS_API_KEY"})
    if source_id == "gpm_imerg" and (source_client is None or not source_client.imerg_access_token):
        raise HTTPException(status_code=503, detail={"code": "SOURCE_NOT_CONFIGURED", "message": "NASA IMERG data access requires AXIS_IMERG_ACCESS_TOKEN"})
    try:
        result = await request.app.state.ingestion_service.fetch(source_id, payload)
        await record_audit(request, "INGESTION_FETCH", "success", "source", source_id, {"stored_count": result.stored_count})
        return result
    except SourceNotConfigured as exc:
        raise HTTPException(status_code=503, detail={"code": "SOURCE_NOT_CONFIGURED", "message": str(exc)}) from exc
    except (ValueError, KeyError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Source request failed: {exc}") from exc


@router.post("/{source_id}/jobs", status_code=202, dependencies=[Depends(require_scope("ingest"))])
async def enqueue_source_fetch(source_id: str, payload: IngestionRequest, request: Request):
    if source_id not in SOURCE_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Unknown data source: {source_id}")
    run_id = await request.app.state.ingestion_worker.enqueue(source_id, payload)
    await record_audit(request, "INGESTION_ENQUEUE", "success", "ingestion_run", run_id, {"source": source_id})
    return {"ingestion_run_id": run_id, "source": source_id, "status": "queued"}
