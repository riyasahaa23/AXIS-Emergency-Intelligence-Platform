from fastapi import APIRouter, HTTPException, Request

from app.incident.state import IncidentNotFoundError
from app.models.scenario import ScenarioComparison, ScenarioRequest

router = APIRouter(prefix="/api/incidents", tags=["scenarios"])


@router.post("/{incident_id}/scenarios", response_model=ScenarioComparison)
async def compare_scenario(incident_id: str, payload: ScenarioRequest, request: Request) -> ScenarioComparison:
    try:
        incident = request.app.state.incident_manager.store.get(incident_id)
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    return request.app.state.scenario_engine.compare(incident, payload)
