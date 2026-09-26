from pydantic import BaseModel, Field

from app.models.incident import Incident


class ImpactAssessment(BaseModel):
    incident_id: str
    affected_population: int = Field(ge=0)
    affected_infrastructure: int = Field(ge=0)
    severity: str


class ImpactEngine:
    def assess(self, incident: Incident) -> ImpactAssessment:
        affected_population = round(incident.population * incident.exposure / 100)
        affected_infrastructure = max(1, round(incident.exposure / 20)) if incident.exposure else 0
        severity = "severe" if incident.severity >= 75 else "elevated" if incident.severity >= 50 else "contained"
        return ImpactAssessment(
            incident_id=incident.id,
            affected_population=affected_population,
            affected_infrastructure=affected_infrastructure,
            severity=severity,
        )
