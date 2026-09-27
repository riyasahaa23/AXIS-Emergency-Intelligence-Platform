from app.intelligence.risk.engine import RiskEngine
from app.models.incident import Incident
from app.models.scenario import ScenarioComparison, ScenarioRequest


class ScenarioEngine:
    def __init__(self, risk_engine: RiskEngine) -> None:
        self.risk_engine = risk_engine

    def compare(self, incident: Incident, request: ScenarioRequest) -> ScenarioComparison:
        baseline = self.risk_engine.assess(incident)
        projected_incident = incident.model_copy(
            update={
                "severity": max(0, min(100, incident.severity + request.severity_delta)),
                "exposure": max(0, min(100, incident.exposure + request.exposure_delta)),
                "population": max(0, incident.population + request.population_delta),
                "vulnerability": max(0, min(100, incident.vulnerability + request.vulnerability_delta)),
            },
            deep=True,
        )
        projected = self.risk_engine.assess(projected_incident)
        delta = round(projected.score - baseline.score, 2)
        interpretation = "risk increases" if delta > 0 else "risk decreases" if delta < 0 else "risk is unchanged"
        return ScenarioComparison(
            scenario_name=request.name,
            baseline_version=incident.version,
            baseline=baseline,
            projected=projected,
            projected_incident=projected_incident.model_dump(mode="json"),
            applied_changes={
                "severity": projected_incident.severity - incident.severity,
                "exposure": projected_incident.exposure - incident.exposure,
                "population": projected_incident.population - incident.population,
                "vulnerability": projected_incident.vulnerability - incident.vulnerability,
            },
            score_delta=delta,
            interpretation=interpretation,
        )
