import csv
import io
import json

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status

from app.auth.dependencies import require_scope
from app.core.events import DomainEvent
from app.incident.state import IncidentNotFoundError, IncidentVersionConflictError
from app.models.incident import Incident, IncidentCreate, IncidentUpdate
from app.models.incident_actions import IncidentAction, IncidentActionCreate, Notification
from app.safety.approvals import ApprovalRecord
from app.notifications.service import create_notification
from app.core.events import DomainEvent, publish_event
from app.audit.service import record_audit

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


async def _incident_list(request: Request, limit: int = 200):
    result = manager(request).store.list(limit=limit, offset=0)
    return await result if hasattr(result, "__await__") else result


@router.get("/geojson", dependencies=[Depends(require_scope("read"))])
async def incident_geojson(
    request: Request,
    min_lat: float | None = Query(default=None, ge=-90, le=90),
    min_lng: float | None = Query(default=None, ge=-180, le=180),
    max_lat: float | None = Query(default=None, ge=-90, le=90),
    max_lng: float | None = Query(default=None, ge=-180, le=180),
    limit: int = Query(default=200, ge=1, le=1000),
):
    incidents = await _incident_list(request, limit)
    if None not in {min_lat, min_lng, max_lat, max_lng}:
        incidents = [item for item in incidents if min_lat <= item.latitude <= max_lat and min_lng <= item.longitude <= max_lng]
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": incident.id,
                "geometry": {"type": "Point", "coordinates": [incident.longitude, incident.latitude]},
                "properties": {
                    "id": incident.id,
                    "title": incident.title,
                    "hazard_type": incident.hazard_type,
                    "severity": incident.severity,
                    "status": incident.status,
                    "data_status": incident.data_status,
                    "source_id": incident.source_id,
                    "external_id": incident.external_id,
                    "confidence": incident.confidence,
                    "observed_at": incident.observed_at.isoformat() if incident.observed_at else None,
                    "last_seen_at": incident.last_seen_at.isoformat() if incident.last_seen_at else None,
                },
            }
            for incident in incidents
            if incident.latitude is not None and incident.longitude is not None
        ],
    }


@router.get("/export", dependencies=[Depends(require_scope("read"))])
async def export_incidents(request: Request, format: str = Query(default="geojson", pattern="^(geojson|csv)$")):
    incidents = await _incident_list(request, 1000)
    if format == "geojson":
        payload = await incident_geojson(request, limit=1000)
        return Response(content=json.dumps(payload, default=str), media_type="application/geo+json", headers={"content-disposition": "attachment; filename=axis-incidents.geojson"})
    output = io.StringIO()
    fields = ["id", "title", "hazard_type", "location", "severity", "status", "latitude", "longitude", "source_id", "external_id", "data_status", "confidence", "observed_at", "last_seen_at"]
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for incident in incidents:
        row = incident.model_dump(mode="json")
        writer.writerow({field: row.get(field, "") for field in fields})
    return Response(content=output.getvalue(), media_type="text/csv", headers={"content-disposition": "attachment; filename=axis-incidents.csv"})


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


@router.get("/{incident_id}/actions", response_model=list[IncidentAction], dependencies=[Depends(require_scope("read"))])
async def list_incident_actions(incident_id: str, request: Request) -> list[IncidentAction]:
    try:
        result = manager(request).store.get(incident_id)
        await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    engine = getattr(request.app.state, "database_engine", None)
    if engine is None:
        return [item for item in request.app.state.incident_actions if item.incident_id == incident_id]
    from sqlalchemy import text

    async with engine.connect() as connection:
        rows = (await connection.execute(text("SELECT * FROM incident_actions WHERE incident_id=:incident_id ORDER BY created_at"), {"incident_id": incident_id})).mappings().all()
    return [IncidentAction.model_validate(dict(row)) for row in rows]


@router.post("/{incident_id}/actions", response_model=IncidentAction, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("analyse"))])
async def create_incident_action(incident_id: str, payload: IncidentActionCreate, request: Request) -> IncidentAction:
    try:
        result = manager(request).store.get(incident_id)
        await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    context = getattr(request.state, "auth", None)
    action = IncidentAction(
        incident_id=incident_id,
        actor=context.subject if context else "anonymous",
        **payload.model_dump(),
    )
    request.app.state.incident_actions.append(action)
    engine = getattr(request.app.state, "database_engine", None)
    if engine is not None:
        from sqlalchemy import text
        import json

        async with engine.begin() as connection:
            await connection.execute(text("""INSERT INTO incident_actions
                (id, incident_id, actor, action_type, message, assignee, metadata, created_at)
                VALUES (:id, :incident_id, :actor, :action_type, :message, :assignee, CAST(:metadata AS JSONB), :created_at)"""), {**action.model_dump(mode="python"), "metadata": json.dumps(action.metadata)})
    await record_audit(request, "INCIDENT_ACTION", "success", "incident", incident_id, {"action_type": action.action_type, "assignee": action.assignee})
    await publish_event(request.app.state.events, DomainEvent(event_type="INCIDENT_ACTION_RECORDED", aggregate_id=incident_id, payload=action.model_dump(mode="json")))
    if action.assignee:
        severity = "critical" if action.action_type == "escalate" else "info"
        await create_notification(request, Notification(recipient=action.assignee, title=f"Incident {action.action_type}", message=action.message or f"You were assigned to incident {incident_id}", severity=severity, incident_id=incident_id))
    return action


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
