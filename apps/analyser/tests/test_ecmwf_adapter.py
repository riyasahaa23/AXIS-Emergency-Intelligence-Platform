
import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.ecmwf import ECMWFAdapter


def test_ecmwf_builds_official_forecast_url():
    adapter = ECMWFAdapter("https://data.ecmwf.int")
    url, values = adapter.build_url(IngestionRequest(params={"date": "20260927", "time": 0, "step": 24, "param": "2t"}))
    assert url.endswith("/forecasts/20260927/00z/ifs/0p25/oper/20260927000000-24h-oper-fc.grib2")
    assert values["params"] == ["2t"]


def test_ecmwf_validates_grib2_signature():
    content = b"GRIB\x00\x00\x00\x02AXIS-TEST-DATA7777"
    ECMWFAdapter.validate_grib2(content)
    with pytest.raises(ValueError, match="GRIB2"):
        ECMWFAdapter.validate_grib2(b"not-a-grib-file")


@pytest.mark.asyncio
async def test_ecmwf_fetch_stores_object_asset(tmp_path):
    content = b"GRIB\x00\x00\x00\x02AXIS-TEST-DATA7777"

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("20260927000000-24h-oper-fc.grib2")
        return httpx.Response(200, content=content)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await ECMWFAdapter("https://example.invalid", str(tmp_path), client=client).fetch(
            IngestionRequest(params={"date": "20260927", "time": 0, "step": 24, "param": "2t"})
        )
    finally:
        await client.aclose()
    assert result.stored_count == 0
    assert result.payload["asset"]["byte_size"] == len(content)
