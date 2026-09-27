import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.ghcnh import GHCNhAdapter

PSV_FIXTURE = """STATION|DATE|LATITUDE|LONGITUDE|ELEVATION|Temperature|Dew Point Temperature|Precipitation|Wind Speed|Wind Direction|Relative Humidity
USW00003812|2026-09-27T12:00:00Z|38.20|-85.76|149|24.5|18.2|2.4|4.0|180|62
"""


def test_ghcnh_normalizes_psv_observation():
    observations = GHCNhAdapter.normalize_psv(PSV_FIXTURE)
    assert len(observations) == 1
    assert observations[0].station_id == "USW00003812"
    assert observations[0].temperature_c == 24.5
    assert observations[0].precipitation_mm == 2.4
    assert observations[0].relative_humidity_pct == 62


def test_ghcnh_catalog_has_official_access_modes():
    catalog = GHCNhAdapter().catalog()
    assert "PSV" in catalog["formats"]
    assert "by-year" in catalog["access_methods"]
    assert "GHCNh_" in catalog["station_file_template"]


@pytest.mark.asyncio
async def test_ghcnh_fetches_psv():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("GHCNh_USW00003812_2026.psv")
        return httpx.Response(200, text=PSV_FIXTURE)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await GHCNhAdapter(client=client).fetch(IngestionRequest(params={"operation": "psv", "url": "https://example.invalid/GHCNh_USW00003812_2026.psv"}))
    finally:
        await client.aclose()
    assert result.payload["observation_count"] == 1
