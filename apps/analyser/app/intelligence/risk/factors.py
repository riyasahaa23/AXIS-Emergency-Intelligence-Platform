from app.models.incident import Incident
from app.models.risk import RiskFactor


def factors_for(incident: Incident) -> list[RiskFactor]:
    definitions = [
        ("severity", incident.severity, 0.35),
        ("exposure", incident.exposure, 0.30),
        ("population", min(incident.population / 1000, 100), 0.20),
        ("vulnerability", incident.vulnerability, 0.15),
    ]
    return [RiskFactor(name=name, value=value, weight=weight, contribution=value * weight) for name, value, weight in definitions]
