from datetime import UTC, datetime

from app.models.incident import Incident, IncidentCreate, IncidentUpdate


class IncidentNotFoundError(KeyError):
    pass


class InMemoryIncidentStore:
    def __init__(self) -> None:
        self._incidents: dict[str, Incident] = {}

    def create(self, data: IncidentCreate) -> Incident:
        incident = Incident(**data.model_dump())
        self._incidents[incident.id] = incident
        return incident

    def get(self, incident_id: str) -> Incident:
        try:
            return self._incidents[incident_id]
        except KeyError as exc:
            raise IncidentNotFoundError(incident_id) from exc

    def list(self) -> list[Incident]:
        return list(self._incidents.values())

    def update(self, incident_id: str, data: IncidentUpdate) -> Incident:
        incident = self.get(incident_id)
        updated = incident.model_copy(
            update={
                **data.model_dump(exclude_unset=True),
                "updated_at": datetime.now(UTC),
            }
        )
        self._incidents[incident_id] = updated
        return updated
