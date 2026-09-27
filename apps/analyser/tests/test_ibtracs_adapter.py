import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.ibtracs import IBTrACSAdapter

CSV_FIXTURE = """SID,SEASON,BASIN,NAME,ISO_TIME,LAT,LON,NATURE,USA_WIND,USA_PRES
,,,,,,,,,
2026-001,2026,NI,AXIS,2026-09-27T00:00:00Z,15.0,72.0,TS,45,990
2026-001,2026,NI,AXIS,2026-09-27T06:00:00Z,15.5,72.5,TS,50,985
"""


def test_ibtracs_normalizes_csv_tracks_and_points():
    tracks = IBTrACSAdapter.normalize_csv(CSV_FIXTURE)
    assert len(tracks) == 1
    assert tracks[0].storm_id == "2026-001"
    assert tracks[0].point_count == 2
    assert tracks[0].points[1].wind_kt == 50
    assert tracks[0].points[0].basin == "NI"


def test_ibtracs_catalog_exposes_official_subsets():
    catalog = IBTrACSAdapter().catalog()
    assert "CSV" in {item.upper() for item in catalog["formats"]}
    assert "since1980" in catalog["subsets"]
    assert "v04r01" in catalog["csv_url_template"]


@pytest.mark.asyncio
async def test_ibtracs_fetches_official_csv_shape():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("ibtracs.NI.list.v04r01.csv")
        return httpx.Response(200, text=CSV_FIXTURE)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await IBTrACSAdapter(client=client).fetch(IngestionRequest(params={"operation": "csv", "url": "https://example.invalid/ibtracs.NI.list.v04r01.csv"}))
    finally:
        await client.aclose()
    assert result.payload["storm_count"] == 1
    assert result.payload["point_count"] == 2
