from fastapi import APIRouter, HTTPException, Request

from app.incident.state import IncidentNotFoundError
from app.models.response import ResponsePlan

router = APIRouter(prefix="/api/incidents", tags=["responses"])


@router.post("/{incident_id}/responses", response_model=ResponsePlan)
async def plan_response(incident_id: str, request: Request) -> ResponsePlan:
    try:
        result = request.app.state.incident_manager.store.get(incident_id)
        incident = await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    risk = request.app.state.risk_engine.assess(incident)
    return request.app.state.response_planner.plan(incident, risk)
