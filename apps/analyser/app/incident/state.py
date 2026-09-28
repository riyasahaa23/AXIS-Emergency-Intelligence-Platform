from datetime import UTC, datetime

from app.models.incident import Incident, IncidentCreate, IncidentUpdate


class IncidentNotFoundError(KeyError):
    pass


class IncidentVersionConflictError(ValueError):
    def __init__(self, incident_id: str, expected: int, actual: int) -> None:
        super().__init__(f"Incident {incident_id} is version {actual}; expected {expected}")
        self.incident_id = incident_id
        self.expected = expected
        self.actual = actual


class InMemoryIncidentStore:
    def __init__(self) -> None:
        self._incidents: dict[str, Incident] = {}
        self._events: dict[str, list] = {}

    def create(self, data: IncidentCreate) -> Incident:
        incident = Incident(**data.model_dump())
        self._incidents[incident.id] = incident
        self._events[incident.id] = []
        return incident

    def get(self, incident_id: str) -> Incident:
        try:
            return self._incidents[incident_id]
        except KeyError as exc:
            raise IncidentNotFoundError(incident_id) from exc

    def list(self, limit: int = 100, offset: int = 0) -> list[Incident]:
        return list(self._incidents.values())[offset : offset + limit]

    def update(self, incident_id: str, data: IncidentUpdate) -> Incident:
        incident = self.get(incident_id)
        if data.expected_version is not None and data.expected_version != incident.version:
            raise IncidentVersionConflictError(incident_id, data.expected_version, incident.version)
        updated = incident.model_copy(
            update={
                **data.model_dump(exclude_unset=True, exclude={"expected_version"}),
                "version": incident.version + 1,
                "updated_at": datetime.now(UTC),
            }
        )
        self._incidents[incident_id] = updated
        return updated

    def record_event(self, event) -> None:
        self._events.setdefault(event.aggregate_id, []).append(event)

    def timeline(self, incident_id: str) -> list:
        self.get(incident_id)
        return list(self._events.get(incident_id, []))

    def evidence(self, incident_id: str) -> list[dict]:
        evidence: list[dict] = []
        for event in self.timeline(incident_id):
            items = event.payload.get("evidence", [])
            if isinstance(items, list):
                evidence.extend(item for item in items if isinstance(item, dict))
        return evidence

    def replay(self, incident_id: str) -> Incident:
        events = self.timeline(incident_id)
        if not events:
            raise IncidentNotFoundError(incident_id)
        state: Incident | None = None
        for event in events:
            if event.event_type == "INCIDENT_CREATED":
                state = Incident.model_validate(event.payload)
            elif event.event_type == "INCIDENT_UPDATED" and state is not None:
                state = state.model_copy(
                    update={
                        **event.payload.get("changes", {}),
                        "version": event.version or state.version + 1,
                        "updated_at": event.occurred_at,
                    }
                )
        if state is None:
            raise IncidentNotFoundError(incident_id)
        return state
