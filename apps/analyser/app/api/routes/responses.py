from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
import json

from app.audit.service import record_audit
from app.auth.dependencies import require_scope
from app.incident.state import IncidentNotFoundError
from app.models.resource import ResourceRequest
from app.models.response import ResponsePlan
from app.safety.approvals import ApprovalCreate, record_approval

router = APIRouter(prefix="/api/incidents", tags=["responses"])


class ResponsePlanStatusUpdate(BaseModel):
    status: str = Field(pattern="^(recommendation_only|approved|executing|completed|cancelled)$")


@router.post("/{incident_id}/responses", response_model=ResponsePlan, dependencies=[Depends(require_scope("recommend"))])
async def plan_response(incident_id: str, request: Request, payload: ResourceRequest | None = None) -> ResponsePlan:
    try:
        result = request.app.state.incident_manager.store.get(incident_id)
        incident = await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    risk = request.app.state.risk_engine.assess(incident)
    result = request.app.state.response_planner.plan(incident, risk, requests=(payload.requests if payload else None))
    request.app.state.response_plans.append(result)
    engine = getattr(request.app.state, "database_engine", None)
    if engine is not None:
        from sqlalchemy import text

        async with engine.begin() as connection:
            await connection.execute(text("""INSERT INTO response_plans
                (plan_id, incident_id, status, plan, created_at, updated_at)
                VALUES (:plan_id, :incident_id, :status, CAST(:plan AS JSONB), now(), now())
                ON CONFLICT (plan_id) DO UPDATE SET plan=EXCLUDED.plan, status=EXCLUDED.status, updated_at=now()"""), {
                    "plan_id": result.plan_id,
                    "incident_id": incident_id,
                    "status": result.execution_status,
                    "plan": json.dumps(result.model_dump(mode="json")),
                })
    await record_audit(request, "RESPONSE_PLAN_CREATE", "success", "incident", incident_id, {"approval_required": result.approval_required})
    return result


@router.get("/{incident_id}/response-plans", response_model=list[ResponsePlan], dependencies=[Depends(require_scope("read"))])
async def list_response_plans(incident_id: str, request: Request):
    try:
        result = request.app.state.incident_manager.store.get(incident_id)
        await result if hasattr(result, "__await__") else result
    except IncidentNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Incident not found") from exc
    engine = getattr(request.app.state, "database_engine", None)
    if engine is None:
        return [item for item in request.app.state.response_plans if item.incident_id == incident_id]
    from sqlalchemy import text

    async with engine.connect() as connection:
        rows = (await connection.execute(text("SELECT plan FROM response_plans WHERE incident_id=:incident_id ORDER BY created_at DESC"), {"incident_id": incident_id})).scalars().all()
    return [ResponsePlan.model_validate(item) for item in rows]


@router.patch("/{incident_id}/response-plans/{plan_id}", response_model=ResponsePlan, dependencies=[Depends(require_scope("approve"))])
async def update_response_plan_status(incident_id: str, plan_id: str, payload: ResponsePlanStatusUpdate, request: Request):
    plans = request.app.state.response_plans
    plan = next((item for item in plans if item.plan_id == plan_id and item.incident_id == incident_id), None)
    if plan is None:
        engine = getattr(request.app.state, "database_engine", None)
        if engine is not None:
            from sqlalchemy import text

            async with engine.connect() as connection:
                row = (await connection.execute(text("SELECT plan FROM response_plans WHERE plan_id=:plan_id AND incident_id=:incident_id"), {"plan_id": plan_id, "incident_id": incident_id})).scalar_one_or_none()
            plan = ResponsePlan.model_validate(row) if row else None
    if plan is None:
        raise HTTPException(status_code=404, detail="Response plan not found")
    updated = plan.model_copy(update={"execution_status": payload.status})
    request.app.state.response_plans[:] = [item for item in plans if item.plan_id != plan_id] + [updated]
    engine = getattr(request.app.state, "database_engine", None)
    if engine is not None:
        from sqlalchemy import text

        async with engine.begin() as connection:
            await connection.execute(text("UPDATE response_plans SET status=:status, plan=CAST(:plan AS JSONB), updated_at=now() WHERE plan_id=:plan_id"), {"status": payload.status, "plan": json.dumps(updated.model_dump(mode="json")), "plan_id": plan_id})
    await record_audit(request, "RESPONSE_PLAN_STATUS", "success", "response_plan", plan_id, {"status": payload.status})
    return updated


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


@router.get("/{incident_id}/approvals", dependencies=[Depends(require_scope("read"))])
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
