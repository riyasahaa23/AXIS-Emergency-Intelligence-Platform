import json
from pathlib import Path

import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.usgs import USGSAdapter


def test_usgs_normalization():
    payload = json.loads((Path(__file__).parent / "fixtures/usgs_earthquakes.json").read_text())
    observations = USGSAdapter.normalize(payload)
    assert len(observations) == 1
    event = observations[0]
    assert event.external_id == "test-001"
    assert event.magnitude == 5.4
    assert event.longitude == 78.123
    assert event.latitude == 17.456
    assert event.depth_km == 12.5


@pytest.mark.asyncio
async def test_usgs_fetch_with_fixture():
    payload = json.loads((Path(__file__).parent / "fixtures/usgs_earthquakes.json").read_text())

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["format"] == "geojson"
        return httpx.Response(200, json=payload)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await USGSAdapter("https://example.invalid/usgs", client=client).fetch(IngestionRequest(limit=10))
    finally:
        await client.aclose()
    assert result.stored_count == 0
    assert len(result.payload["features"]) == 1
