import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.service import IngestionService
from app.ingestion.worker import IngestionWorker


class FakeClient:
    async def fetch(self, source_id, request):
        from datetime import UTC, datetime

        from app.ingestion.models import IngestionResult

        return IngestionResult(source=source_id, fetched_at=datetime.now(UTC), stored_count=1, payload={"ok": True})


@pytest.mark.asyncio
async def test_worker_executes_in_memory_ingestion_job():
    service = IngestionService(FakeClient())
    worker = IngestionWorker(service)
    await worker.start()
    try:
        run_id = await worker.enqueue("usgs_earthquakes", IngestionRequest())
        await worker.local_queue.join()
        assert run_id.startswith("ing_")
    finally:
        await worker.stop()
