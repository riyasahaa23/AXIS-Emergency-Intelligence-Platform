from asyncio import Queue
from datetime import UTC, datetime
from inspect import isawaitable
from typing import Any, Protocol
from uuid import uuid4

from pydantic import BaseModel, Field


class DomainEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    event_type: str
    aggregate_id: str
    payload: dict[str, Any] = Field(default_factory=dict)
    version: int | None = Field(default=None, ge=1)
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class EventPublisher(Protocol):
    def publish(self, event: DomainEvent) -> Any:
        ...


async def publish_event(publisher: EventPublisher, event: DomainEvent) -> DomainEvent:
    result = publisher.publish(event)
    if isawaitable(result):
        await result
    return event


class InMemoryEventPublisher:
    def __init__(self) -> None:
        self.events: list[DomainEvent] = []
        self.subscribers: list[Queue[DomainEvent]] = []

    def publish(self, event: DomainEvent) -> DomainEvent:
        self.events.append(event)
        for subscriber in list(self.subscribers):
            subscriber.put_nowait(event)
        return event

    def subscribe(self) -> Queue[DomainEvent]:
        subscriber: Queue[DomainEvent] = Queue()
        self.subscribers.append(subscriber)
        return subscriber

    def unsubscribe(self, subscriber: Queue[DomainEvent]) -> None:
        if subscriber in self.subscribers:
            self.subscribers.remove(subscriber)


class RedisStreamPublisher:
    """Optional Redis Streams adapter; import Redis only when this adapter is used."""

    def __init__(self, redis_url: str, stream: str = "axis.events") -> None:
        try:
            from redis.asyncio import Redis
        except ImportError as exc:
            raise RuntimeError("Install the 'events' extra to use Redis Streams") from exc
        self.client = Redis.from_url(redis_url, decode_responses=True)
        self.stream = stream
        self.subscribers: list[Queue[DomainEvent]] = []

    async def publish(self, event: DomainEvent) -> DomainEvent:
        for subscriber in list(self.subscribers):
            subscriber.put_nowait(event)
        await self.client.xadd(self.stream, {"event": event.model_dump_json()})
        return event

    def subscribe(self) -> Queue[DomainEvent]:
        subscriber: Queue[DomainEvent] = Queue()
        self.subscribers.append(subscriber)
        return subscriber

    def unsubscribe(self, subscriber: Queue[DomainEvent]) -> None:
        if subscriber in self.subscribers:
            self.subscribers.remove(subscriber)

    async def close(self) -> None:
        await self.client.aclose()
