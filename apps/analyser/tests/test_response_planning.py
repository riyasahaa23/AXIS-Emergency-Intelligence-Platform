from app.models.incident import Incident
from app.models.resource import Resource
from app.models.risk import RiskAssessment
from app.response.planner import ResponsePlanner


def test_response_plan_marks_unmet_resources_and_requires_approval():
    incident = Incident(title="Flood", hazard_type="flood", location="Zone", severity=90)
    risk = RiskAssessment(incident_id=incident.id, score=80, level="critical", factors=[], explanation="test")
    plan = ResponsePlanner().plan(
        incident,
        risk,
        resources=[Resource(id="ambulance-1", kind="ambulance", available=1)],
        requests={"ambulance": 3},
    )
    assert plan.approval_required is True
    assert plan.execution_status == "recommendation_only"
    assert plan.allocations[0].unmet == 2
    assert "exceed available capacity" in plan.constraints[-1]
