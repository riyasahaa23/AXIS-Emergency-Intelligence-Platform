from fastapi import APIRouter, HTTPException, Request, status

from app.incident.state import IncidentNotFoundError
from app.models.incident import Incident, IncidentCreate, IncidentUpdate

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def manager(request: Request):
    return request.app.state.incident_manager


@router.post("", response_model=Incident, status_code=status.HTTP_201_CREATED)
async def create_incident(payload: IncidentCreate, request: Request) -> Incident:
    return await manager(request).create(payload)


@router.get("", response_model=list[Incident])
async def list_incidents(request: Request) -> list[Incident]:
    result = manager(request).store.list()
    return await result if hasattr(result, "__await__") else result


@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str, request: Request) -> Incident:
    try:
        result = manager(request).store.get(incident_id)
        return await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc


@router.patch("/{incident_id}", response_model=Incident)
async def update_incident(incident_id: str, payload: IncidentUpdate, request: Request) -> Incident:
    try:
        return await manager(request).update(incident_id, payload)
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
