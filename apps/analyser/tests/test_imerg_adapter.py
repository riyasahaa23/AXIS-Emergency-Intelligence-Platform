import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.imerg import IMERGAdapter


def test_imerg_catalog_contains_early_late_and_final_products():
    products = IMERGAdapter().catalog()
    runs = {product.run for product in products}
    assert runs == {"Early", "Late", "Final"}
    assert any(product.temporal_resolution == "half-hourly" for product in products)
    assert all(product.resolution == "0.1 degree" for product in products)


def test_imerg_normalizes_point_observations():
    rows = [{
        "id": "rain-1",
        "time": "2026-09-27T12:00:00Z",
        "latitude": 19.076,
        "longitude": 72.8777,
        "precipitationCal": 12.5,
    }]
    observations = IMERGAdapter.normalize_observations(rows, "3IMERGHH")
    assert len(observations) == 1
    assert observations[0].precipitation_mm == 12.5
    assert observations[0].observed_at.tzinfo is not None


@pytest.mark.asyncio
async def test_imerg_requires_blank_token_for_remote_data():
    with pytest.raises(RuntimeError, match="IMERG_ACCESS_TOKEN"):
        await IMERGAdapter().fetch(IngestionRequest(params={"operation": "download", "url": "https://example.invalid/data"}))


@pytest.mark.asyncio
async def test_imerg_download_stores_binary_asset_metadata(tmp_path):
    content = b"IMERG-TEST-DATA"

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["authorization"] == "Bearer test-token"
        return httpx.Response(200, content=content, headers={"content-type": "application/octet-stream"})

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await IMERGAdapter("https://example.invalid/archive", "test-token", str(tmp_path), client=client).fetch(
            IngestionRequest(params={"operation": "download", "url": "https://example.invalid/data/IMERG.bin", "product_id": "3IMERGHH"})
        )
    finally:
        await client.aclose()
    assert result.payload["asset"]["byte_size"] == len(content)
    assert (tmp_path / "imerg" / "IMERG.bin").read_bytes() == content
