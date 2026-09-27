from datetime import UTC, datetime

import httpx
import pytest

from app.tools.satellite.copernicus import CopernicusProvider
from app.tools.satellite.models import SatelliteSearchRequest


@pytest.mark.asyncio
async def test_copernicus_search_normalizes_stac_features(monkeypatch):
    class MockClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def post(self, url, json):
            response = httpx.Response(200, json={"features": [{"id": "scene-1"}]})
            response.request = httpx.Request("POST", url)
            return response

    monkeypatch.setattr("app.tools.satellite.copernicus.httpx.AsyncClient", MockClient)
    provider = CopernicusProvider("https://example.test/search")
    result = await provider.search(
        SatelliteSearchRequest(
            bbox=[77.0, 12.0, 78.0, 13.0],
            start=datetime(2026, 1, 1, tzinfo=UTC),
            end=datetime(2026, 1, 2, tzinfo=UTC),
        )
    )
    assert result.number_returned == 1
    assert result.features[0]["id"] == "scene-1"
