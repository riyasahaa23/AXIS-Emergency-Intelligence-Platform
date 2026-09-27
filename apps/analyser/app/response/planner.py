from app.models.incident import Incident
from app.models.resource import Resource, ResourceAllocation
from app.models.response import ResponsePlan
from app.models.risk import RiskAssessment
from app.optimization.allocation import allocate


class ResponsePlanner:
    def plan(self, incident: Incident, risk: RiskAssessment, resources: list[Resource] | None = None, requests: dict[str, int] | None = None) -> ResponsePlan:
        if risk.level == "critical":
            actions = ["activate emergency coordination", "begin evacuation assessment", "request additional resources"]
            priority = "immediate"
        elif risk.level == "high":
            actions = ["establish incident command", "prepare evacuation resources", "increase monitoring"]
            priority = "urgent"
        elif risk.level == "moderate":
            actions = ["continue monitoring", "prepare contingency resources"]
            priority = "elevated"
        else:
            actions = ["monitor conditions"]
            priority = "routine"
        allocations: list[ResourceAllocation] = []
        if resources is not None:
            allocations = allocate(resources, requests or {})
        constraints = ["recommendation requires explicit human approval", "no execution capability is exposed by this API"]
        if any(allocation.unmet for allocation in allocations):
            constraints.append("requested resources exceed available capacity")
        return ResponsePlan(
            incident_id=incident.id,
            priority=priority,
            actions=actions,
            rationale=[risk.explanation, f"Incident location: {incident.location}"],
            allocations=allocations,
            constraints=constraints,
        )
