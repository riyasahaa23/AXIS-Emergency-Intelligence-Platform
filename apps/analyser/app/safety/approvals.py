from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field

from app.core.events import DomainEvent


class ApprovalCreate(BaseModel):
    plan_id: str = Field(min_length=1, max_length=200)
    status: Literal["approved", "rejected"]
    rationale: str = Field(min_length=5, max_length=4000)


class ApprovalRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"approval_{uuid4().hex}")
    incident_id: str
    plan_id: str
    actor: str
    status: Literal["approved", "rejected"]
    rationale: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


async def record_approval(request, incident_id: str, payload: ApprovalCreate) -> ApprovalRecord:
    context = getattr(request.state, "auth", None)
    actor = context.subject if context else "anonymous"
    record = ApprovalRecord(incident_id=incident_id, plan_id=payload.plan_id, actor=actor, status=payload.status, rationale=payload.rationale)
    request.app.state.approvals.append(record)
    engine = getattr(request.app.state, "database_engine", None)
    if engine is not None:
        from sqlalchemy import text

        async with engine.begin() as connection:
            await connection.execute(text("""INSERT INTO approvals
                (incident_id, plan_id, actor, status, rationale, created_at)
                VALUES (:incident_id, :plan_id, :actor, :status, :rationale, :created_at)"""), record.model_dump(mode="python"))
    events = getattr(request.app.state, "events", None)
    if events is not None:
        events.publish(DomainEvent(
            event_type="APPROVAL_RECORDED",
            aggregate_id=incident_id,
            payload=record.model_dump(mode="json"),
        ))
    return record
