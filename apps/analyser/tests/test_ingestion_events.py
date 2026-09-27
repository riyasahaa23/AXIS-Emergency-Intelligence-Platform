import pytest

from app.core.events import InMemoryEventPublisher
from app.ingestion.models import IngestionRequest, IngestionResult
from app.ingestion.service import IngestionService


class EventClient:
    async def fetch(self, source_id, request):
        from datetime import UTC, datetime
        return IngestionResult(source=source_id, fetched_at=datetime.now(UTC), stored_count=4, payload={"ok": True})


@pytest.mark.asyncio
async def test_ingestion_run_emits_queued_running_and_completed_events():
    events = InMemoryEventPublisher()
    subscriber = events.subscribe()
    result = await IngestionService(EventClient(), events=events).fetch("usgs_earthquakes", IngestionRequest())
    emitted = [await subscriber.get(), await subscriber.get(), await subscriber.get()]
    assert result.payload["ingestion_run_id"]
    assert [event.event_type for event in emitted] == ["INGESTION_RUN_UPDATED"] * 3
    assert [event.payload["status"] for event in emitted] == ["queued", "running", "completed"]
    assert emitted[-1].payload["stored_count"] == 4
    events.unsubscribe(subscriber)
