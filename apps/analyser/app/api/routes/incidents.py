from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.auth.dependencies import require_scope
from app.core.events import DomainEvent
from app.incident.state import IncidentNotFoundError, IncidentVersionConflictError
from app.models.incident import Incident, IncidentCreate, IncidentUpdate
from app.safety.approvals import ApprovalRecord

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def manager(request: Request):
    return request.app.state.incident_manager


@router.post("", response_model=Incident, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("analyse"))])
async def create_incident(payload: IncidentCreate, request: Request) -> Incident:
    return await manager(request).create(payload)


@router.get("", response_model=list[Incident], dependencies=[Depends(require_scope("read"))])
async def list_incidents(
    request: Request,
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[Incident]:
    result = manager(request).store.list(limit=limit, offset=offset)
    return await result if hasattr(result, "__await__") else result


@router.get("/{incident_id}", response_model=Incident, dependencies=[Depends(require_scope("read"))])
async def get_incident(incident_id: str, request: Request) -> Incident:
    try:
        result = manager(request).store.get(incident_id)
        return await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc


@router.patch("/{incident_id}", response_model=Incident, dependencies=[Depends(require_scope("analyse"))])
async def update_incident(incident_id: str, payload: IncidentUpdate, request: Request) -> Incident:
    try:
        return await manager(request).update(incident_id, payload)
    except IncidentVersionConflictError as exc:
        raise HTTPException(status_code=409, detail={"code": "INCIDENT_VERSION_CONFLICT", "expected": exc.expected, "actual": exc.actual}) from exc
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc


@router.get("/{incident_id}/timeline", response_model=list[DomainEvent], dependencies=[Depends(require_scope("read"))])
async def incident_timeline(incident_id: str, request: Request) -> list[DomainEvent]:
    try:
        result = manager(request).store.timeline(incident_id)
        return await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc


@router.get("/{incident_id}/evidence", response_model=list[dict], dependencies=[Depends(require_scope("read"))])
async def incident_evidence(incident_id: str, request: Request) -> list[dict]:
    try:
        result = manager(request).store.evidence(incident_id)
        return await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc


@router.get("/{incident_id}/decision-timeline", dependencies=[Depends(require_scope("read"))])
async def decision_timeline(incident_id: str, request: Request) -> list[dict]:
    try:
        result = manager(request).store.timeline(incident_id)
        events = await result if hasattr(result, "__await__") else result
        incident = manager(request).store.get(incident_id)
        await incident if hasattr(incident, "__await__") else None
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc

    if request.app.state.database_engine is None:
        approvals = [item for item in request.app.state.approvals if item.incident_id == incident_id]
    else:
        from sqlalchemy import text

        async with request.app.state.database_engine.connect() as connection:
            rows = (await connection.execute(text("SELECT * FROM approvals WHERE incident_id=:incident_id ORDER BY created_at"), {"incident_id": incident_id})).mappings().all()
        approvals = []
        for row in rows:
            values = dict(row)
            values["id"] = f"approval_{values['id']}"
            approvals.append(ApprovalRecord.model_validate(values))

    timeline = [
        {"type": event.event_type, "occurred_at": event.occurred_at, "payload": event.payload}
        for event in events
    ]
    timeline.extend({"type": "APPROVAL_RECORDED", "occurred_at": approval.created_at, "payload": approval.model_dump(mode="json")} for approval in approvals)
    return sorted(timeline, key=lambda item: item["occurred_at"])
