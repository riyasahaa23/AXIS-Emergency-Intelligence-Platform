import json
from pathlib import Path

import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.gdacs import GDACSAdapter


def test_gdacs_normalization():
    payload = json.loads((Path(__file__).parent / "fixtures/gdacs_events.json").read_text())
    events = GDACSAdapter.normalize(payload)
    assert len(events) == 1
    assert events[0].event_type == "EQ"
    assert events[0].event_id == "1567000"
    assert events[0].alert_level == "orange"
    assert events[0].geometry["coordinates"] == [78.123, 17.456]


@pytest.mark.asyncio
async def test_gdacs_fetch_with_fixture():
    payload = json.loads((Path(__file__).parent / "fixtures/gdacs_events.json").read_text())

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["eventlist"] == "EQ;TC;FL;VO;WF"
        return httpx.Response(200, json=payload)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await GDACSAdapter("https://example.invalid/gdacs", client=client).fetch(IngestionRequest())
    finally:
        await client.aclose()
    assert result.stored_count == 0
    assert len(result.payload["features"]) == 1
