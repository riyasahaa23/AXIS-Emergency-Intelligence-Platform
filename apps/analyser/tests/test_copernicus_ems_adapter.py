import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.copernicus_ems import CopernicusEMSAdapter

PAYLOAD = {
    "count": 1,
    "results": [{
        "code": "EMSR999",
        "countries": ["India"],
        "eventTime": "2026-09-27T10:00:00",
        "name": "Flood in India",
        "centroid": "POINT (77.2090 28.6139)",
        "activationTime": "2026-09-27T12:00:00",
        "category": "Flood",
        "lastUpdate": "2026-09-27T13:00:00",
        "closed": False,
        "gdacsId": "FL000001",
        "n_aois": 2,
        "n_products": 3,
    }],
}


def test_copernicus_ems_normalizes_activation():
    activations = CopernicusEMSAdapter.normalize(PAYLOAD)
    assert len(activations) == 1
    assert activations[0].code == "EMSR999"
    assert activations[0].centroid_latitude == 28.6139
    assert activations[0].centroid_longitude == 77.209
    assert activations[0].product_count == 3


@pytest.mark.asyncio
async def test_copernicus_ems_fetches_public_paginated_api():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["limit"] == "25"
        assert request.url.params["offset"] == "0"
        return httpx.Response(200, json=PAYLOAD)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await CopernicusEMSAdapter(client=client).fetch(IngestionRequest())
    finally:
        await client.aclose()
    assert result.payload["count"] == 1
    assert result.payload["total"] == 1
