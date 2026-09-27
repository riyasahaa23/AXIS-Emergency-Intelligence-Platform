from fastapi import APIRouter, Depends, HTTPException, Request

from app.auth.dependencies import require_scope
from app.incident.state import IncidentNotFoundError
from app.models.incident import Incident

router = APIRouter(prefix="/api/incidents", tags=["analysis"])


@router.post("/{incident_id}/analysis", dependencies=[Depends(require_scope("analyse"))])
async def analyse_incident(incident_id: str, request: Request) -> dict:
    try:
        result = request.app.state.incident_manager.store.get(incident_id)
        incident: Incident = await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    risk = request.app.state.risk_engine.assess(incident)
    impact = request.app.state.impact_engine.assess(incident)
    verification = request.app.state.validator(risk.score)
    return {"incident": incident, "risk": risk, "impact": impact, "verification": verification}
