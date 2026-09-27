from fastapi import APIRouter, Depends, HTTPException, Request

from app.audit.service import record_audit
from app.auth.dependencies import require_scope
from app.incident.state import IncidentNotFoundError
from app.models.resource import ResourceRequest
from app.models.response import ResponsePlan
from app.safety.approvals import ApprovalCreate, record_approval

router = APIRouter(prefix="/api/incidents", tags=["responses"])


@router.post("/{incident_id}/responses", response_model=ResponsePlan)
async def plan_response(incident_id: str, request: Request, payload: ResourceRequest | None = None) -> ResponsePlan:
    try:
        result = request.app.state.incident_manager.store.get(incident_id)
        incident = await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    risk = request.app.state.risk_engine.assess(incident)
    result = request.app.state.response_planner.plan(incident, risk, requests=(payload.requests if payload else None))
    await record_audit(request, "RESPONSE_PLAN_CREATE", "success", "incident", incident_id, {"approval_required": result.approval_required})
    return result


@router.post("/{incident_id}/approvals", status_code=201, dependencies=[Depends(require_scope("approve"))])
async def approve_response(incident_id: str, payload: ApprovalCreate, request: Request):
    try:
        result = request.app.state.incident_manager.store.get(incident_id)
        incident = await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    approval = await record_approval(request, incident.id, payload)
    await record_audit(request, "RESPONSE_APPROVAL", "success", "approval", approval.id, {"status": approval.status, "plan_id": approval.plan_id})
    return approval


@router.get("/{incident_id}/approvals")
async def list_approvals(incident_id: str, request: Request):
    try:
        result = request.app.state.incident_manager.store.get(incident_id)
        incident = await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    if request.app.state.database_engine is None:
        return [item for item in request.app.state.approvals if item.incident_id == incident.id]
    from sqlalchemy import text

    async with request.app.state.database_engine.connect() as connection:
        rows = (await connection.execute(text("SELECT * FROM approvals WHERE incident_id=:incident_id ORDER BY created_at DESC"), {"incident_id": incident.id})).mappings().all()
    return [dict(row) for row in rows]
