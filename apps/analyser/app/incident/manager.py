from app.core.events import DomainEvent, InMemoryEventPublisher
from app.incident.state import InMemoryIncidentStore
from app.models.incident import Incident, IncidentCreate, IncidentUpdate


class IncidentManager:
    def __init__(self, store: InMemoryIncidentStore, events: InMemoryEventPublisher) -> None:
        self.store = store
        self.events = events

    def create(self, data: IncidentCreate) -> Incident:
        incident = self.store.create(data)
        self.events.publish(DomainEvent(event_type="INCIDENT_CREATED", aggregate_id=incident.id, payload=incident.model_dump(mode="json")))
        return incident

    def update(self, incident_id: str, data: IncidentUpdate) -> Incident:
        incident = self.store.update(incident_id, data)
        self.events.publish(DomainEvent(event_type="INCIDENT_UPDATED", aggregate_id=incident.id, payload=data.model_dump(exclude_unset=True)))
        return incident
