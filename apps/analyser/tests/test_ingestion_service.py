from datetime import UTC, datetime

import pytest

from app.ingestion.models import IngestionRequest, IngestionResult
from app.ingestion.service import IngestionService


class FakeSourceClient:
    async def fetch(self, source_id: str, request: IngestionRequest) -> IngestionResult:
        return IngestionResult(source=source_id, fetched_at=datetime.now(UTC), stored_count=2, payload={"source_result": True})


@pytest.mark.asyncio
async def test_ingestion_service_adds_run_id_to_result():
    service = IngestionService(FakeSourceClient())
    result = await service.fetch("usgs_earthquakes", IngestionRequest())
    assert result.payload["source_result"] is True
    assert result.payload["ingestion_run_id"].startswith("ing_")
