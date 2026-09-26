from app.models.incident import Incident
from app.models.risk import RiskAssessment
from app.nlp.intent import UserIntent


class Orchestrator:
    """Routes structured intent to deterministic domain services."""

    def __init__(self, risk_engine) -> None:
        self.risk_engine = risk_engine

    def analyze(self, intent: UserIntent, incident: Incident) -> RiskAssessment:
        if intent.intent not in {"analyze", "unknown"}:
            raise ValueError(f"Intent {intent.intent} is not an analysis request")
        return self.risk_engine.assess(incident)
