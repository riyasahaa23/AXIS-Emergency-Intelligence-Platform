from typing import Any

from app.core.events import DomainEvent, EventPublisher, publish_event
from app.models.incident import Incident, IncidentCreate, IncidentUpdate


async def _await_if_needed(value):
    import inspect

    return await value if inspect.isawaitable(value) else value


class IncidentManager:
    def __init__(self, store: Any, events: EventPublisher) -> None:
        self.store = store
        self.events = events

    async def create(self, data: IncidentCreate) -> Incident:
        incident = await _await_if_needed(self.store.create(data))
        event = DomainEvent(
            event_type="INCIDENT_CREATED",
            aggregate_id=incident.id,
            version=incident.version,
            payload=incident.model_dump(mode="json"),
        )
        await self._record(event)
        await publish_event(self.events, event)
        return incident

    async def update(self, incident_id: str, data: IncidentUpdate) -> Incident:
        incident = await _await_if_needed(self.store.update(incident_id, data))
        event = DomainEvent(
            event_type="INCIDENT_UPDATED",
            aggregate_id=incident.id,
            version=incident.version,
            payload={"changes": data.model_dump(exclude_unset=True, exclude={"expected_version"})},
        )
        await self._record(event)
        await publish_event(self.events, event)
        return incident

    async def _record(self, event: DomainEvent) -> None:
        recorder = getattr(self.store, "record_event", None)
        if recorder is not None:
            await _await_if_needed(recorder(event))
