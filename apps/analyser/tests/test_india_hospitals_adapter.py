import httpx
import pytest

from app.ingestion.models import IngestionRequest
from app.ingestion.providers.india_hospitals import IndiaHospitalAdapter


def test_india_hospital_normalization_supports_catalog_fields():
    rows = [{
        "Sr_No": "42",
        "Hospital_Name": "AXIS District Hospital",
        "Location_Coordinates": "19.0760, 72.8777",
        "Location": "Mumbai",
        "Hospital_Category": "Government",
        "Systems_of_Medicine": "Allopathic",
        "Pin_Code": "400001",
        "Specializations": "Emergency, Trauma",
    }]
    hospitals = IndiaHospitalAdapter.normalize(rows)
    assert len(hospitals) == 1
    assert hospitals[0].external_id == "42"
    assert hospitals[0].latitude == 19.076
    assert hospitals[0].longitude == 72.8777
    assert hospitals[0].category == "Government"


@pytest.mark.asyncio
async def test_india_hospitals_requires_blank_api_configuration():
    with pytest.raises(RuntimeError, match="INDIA_HOSPITALS_API_KEY"):
        await IndiaHospitalAdapter().fetch(IngestionRequest())


@pytest.mark.asyncio
async def test_india_hospitals_fetches_and_normalizes_records():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("resource-id")
        assert request.url.params["api-key"] == "test-key"
        return httpx.Response(200, json={"records": [{"Hospital_Name": "Test Hospital", "Sr_No": "1"}]})

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    try:
        result = await IndiaHospitalAdapter("test-key", "resource-id", client=client).fetch(IngestionRequest())
    finally:
        await client.aclose()
    assert result.payload["count"] == 1
    assert result.stored_count == 0
