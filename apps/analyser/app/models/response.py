from uuid import uuid4

from pydantic import BaseModel, Field

from .resource import ResourceAllocation


class ResponsePlan(BaseModel):
    plan_id: str = Field(default_factory=lambda: f"plan_{uuid4().hex}")
    incident_id: str
    priority: str
    actions: list[str]
    rationale: list[str]
    allocations: list[ResourceAllocation] = Field(default_factory=list)
    approval_required: bool = True
    execution_status: str = "recommendation_only"
    constraints: list[str] = Field(default_factory=list)
