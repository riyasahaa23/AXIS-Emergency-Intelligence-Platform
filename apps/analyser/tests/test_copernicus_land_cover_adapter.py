import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.copernicus_land_cover import CopernicusLandCoverAdapter

STAC_PAYLOAD = {
    "context": {"matched": 1},
    "features": [{
        "type": "Feature",
        "id": "lcm-item-2020",
        "collection": "clms_lcm_global_10m_yearly_v1",
        "bbox": [70.0, 8.0, 90.0, 35.0],
        "properties": {"datetime": "2020-01-01T00:00:00Z"},
        "assets": {"thumbnail": {"href": "https://example.invalid/preview.tif"}},
    }],
}


def test_land_cover_catalog_contains_official_global_products():
    products = CopernicusLandCoverAdapter().catalog()
    product_ids = {product.product_id for product in products}
    assert "lc_global_100m_yearly_v3" in product_ids
    assert "lcm_global_10m_yearly_v1" in product_ids
    assert all("STAC" in product.access_methods for product in products)


def test_land_cover_normalizes_stac_assets():
    assets = CopernicusLandCoverAdapter.normalize_stac(STAC_PAYLOAD)
    assert len(assets) == 1
    assert assets[0].item_id == "lcm-item-2020"
    assert assets[0].bbox == [70.0, 8.0, 90.0, 35.0]


@pytest.mark.asyncio
async def test_land_cover_fetches_stac_search():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/search")
        assert request.url.params["limit"] == "25"
        return httpx.Response(200, json=STAC_PAYLOAD)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await CopernicusLandCoverAdapter(client=client).fetch(
            IngestionRequest(params={"operation": "stac", "collections": "clms_lcm_global_10m_yearly_v1"})
        )
    finally:
        await client.aclose()
    assert result.payload["count"] == 1
