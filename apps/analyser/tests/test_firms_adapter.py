from pathlib import Path

import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.firms import FIRMSAdapter


def test_firms_normalization():
    payload = (Path(__file__).parent / "fixtures/firms_active_fire.csv").read_text()
    detections = FIRMSAdapter.normalize(payload)
    assert len(detections) == 2
    assert detections[0].frp == 45.7
    assert detections[0].satellite == "NOAA-20"
    assert detections[0].latitude == 17.456


@pytest.mark.asyncio
async def test_firms_requires_key():
    with pytest.raises(RuntimeError, match="MAP_KEY"):
        await FIRMSAdapter("").fetch(IngestionRequest())


@pytest.mark.asyncio
async def test_firms_fetch_with_fixture():
    payload = (Path(__file__).parent / "fixtures/firms_active_fire.csv").read_text()

    def handler(request: httpx.Request) -> httpx.Response:
        assert "/area/csv/test-key/VIIRS_NOAA20_NRT/world/1" in str(request.url)
        return httpx.Response(200, text=payload)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await FIRMSAdapter("test-key", client=client).fetch(IngestionRequest())
    finally:
        await client.aclose()
    assert result.stored_count == 0
    assert result.payload["count"] == 2
