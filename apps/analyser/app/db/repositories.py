from typing import Protocol

from app.models.incident import Incident, IncidentCreate


class IncidentRepository(Protocol):
    def create(self, data: IncidentCreate) -> Incident:
        ...

    def get(self, incident_id: str) -> Incident:
        ...

    def list(self) -> list[Incident]:
        ...
