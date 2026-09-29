from datetime import UTC, datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field


ActionType = Literal["note", "assign", "escalate", "acknowledge", "status_change"]


class IncidentActionCreate(BaseModel):
    action_type: ActionType
    message: str = Field(default="", max_length=4000)
    assignee: str | None = Field(default=None, max_length=200)
    metadata: dict[str, str] = Field(default_factory=dict)


class IncidentAction(BaseModel):
    id: str = Field(default_factory=lambda: f"ACT-{uuid4().hex[:12].upper()}")
    incident_id: str
    actor: str
    action_type: ActionType
    message: str = ""
    assignee: str | None = None
    metadata: dict[str, str] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class Notification(BaseModel):
    id: str = Field(default_factory=lambda: f"NTF-{uuid4().hex[:12].upper()}")
    recipient: str
    title: str
    message: str
    severity: Literal["info", "warning", "critical"] = "info"
    incident_id: str | None = None
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
