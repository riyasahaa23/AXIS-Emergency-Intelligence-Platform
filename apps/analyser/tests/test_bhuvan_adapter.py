import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.bhuvan import BhuvanAdapter


def test_bhuvan_catalog_contains_official_lulc_products():
    products = BhuvanAdapter("https://bhuvan-app1.nrsc.gov.in/api/").catalog()
    ids = {product.product_id for product in products}
    assert "lulc-50k-2015-16" in ids
    assert "lulc-250k-2022-23" in ids
    assert "lulc-sisdp-10k" in ids
    assert all(product.endpoint.startswith("https://") for product in products)


@pytest.mark.asyncio
async def test_bhuvan_catalog_is_available_without_api_token():
    result = await BhuvanAdapter("https://example.invalid/api").fetch(IngestionRequest())
    assert result.payload["operation"] == "catalog"
    assert result.payload["products"]


@pytest.mark.asyncio
async def test_bhuvan_statistics_requires_blank_token_to_be_configured():
    with pytest.raises(RuntimeError, match="BHUVAN_API_TOKEN"):
        await BhuvanAdapter("https://example.invalid/api").fetch(
            IngestionRequest(params={"operation": "statistics", "endpoint": "https://example.invalid/stats"})
        )


@pytest.mark.asyncio
async def test_bhuvan_capabilities_uses_wms_get_capabilities():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["service"] == "WMS"
        assert request.url.params["request"] == "GetCapabilities"
        return httpx.Response(200, text="<WMS_Capabilities version='1.3.0'/>", headers={"content-type": "application/xml"})

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await BhuvanAdapter("https://example.invalid/api", client=client).fetch(
            IngestionRequest(params={"operation": "capabilities"})
        )
    finally:
        await client.aclose()
    assert result.payload["content_type"] == "application/xml"
