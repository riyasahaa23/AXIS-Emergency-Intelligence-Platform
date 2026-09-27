from datetime import UTC, datetime, timedelta

import pytest

from app.ingestion.scheduler import IngestionScheduleCreate, IngestionScheduler


class FakeWorker:
    def __init__(self):
        self.calls = []

    async def enqueue(self, source_id, request):
        self.calls.append((source_id, request))
        return f"ing_{len(self.calls)}"


@pytest.mark.asyncio
async def test_scheduler_enqueues_due_schedule_once():
    worker = FakeWorker()
    scheduler = IngestionScheduler(worker)
    schedule = await scheduler.create(IngestionScheduleCreate(source_id="usgs_earthquakes", interval_seconds=60))
    schedule.next_run_at = datetime.now(UTC) - timedelta(seconds=1)
    scheduler.schedules[schedule.id] = schedule
    queued = await scheduler.run_once()
    assert queued == ["ing_1"]
    assert len(worker.calls) == 1
    assert scheduler.schedules[schedule.id].last_run_id == "ing_1"


@pytest.mark.asyncio
async def test_scheduler_rejects_unknown_source():
    scheduler = IngestionScheduler(FakeWorker())
    with pytest.raises(KeyError):
        await scheduler.create(IngestionScheduleCreate(source_id="unknown", interval_seconds=60))
