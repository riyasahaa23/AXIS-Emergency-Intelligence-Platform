from app.models.incident import Incident
from app.models.response import ResponsePlan
from app.models.risk import RiskAssessment


class ResponsePlanner:
    def plan(self, incident: Incident, risk: RiskAssessment) -> ResponsePlan:
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
        return ResponsePlan(
            incident_id=incident.id,
            priority=priority,
            actions=actions,
            rationale=[risk.explanation, f"Incident location: {incident.location}"],
        )
