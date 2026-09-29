from datetime import UTC, datetime

import httpx
import pytest

from app.incident.live_feeds import LiveIncidentIngestor
from app.ingestion.models import IngestionResult
from app.models.incident import Incident


class FakeSourceClient:
    def __init__(self, payload):
        self.payload = payload

    async def fetch(self, source_id, request):
        return IngestionResult(
            source=source_id,
            fetched_at=datetime.now(UTC),
            stored_count=0,
            payload=self.payload.get(source_id, {}),
        )


class FakeManager:
    def __init__(self):
        self.created = []

    async def create(self, data):
        incident = Incident(**data.model_dump())
        self.created.append(incident)
        return incident


@pytest.mark.asyncio
async def test_live_feeds_are_normalized_and_deduplicated():
    source = FakeSourceClient({
        "usgs_earthquakes": {
            "type": "FeatureCollection",
            "features": [{
                "id": "usgs-1",
                "properties": {"mag": 5.2, "place": "10 km north of Testville", "time": 0},
                "geometry": {"coordinates": [10.0, 20.0, 5.0]},
            }],
        },
        "gdacs": {
            "type": "FeatureCollection",
            "features": [{
                "id": "gdacs-1",
                "properties": {
                    "eventtype": "FL",
                    "eventid": "gdacs-1",
                    "episodeid": "1",
                    "alertlevel": "orange",
                    "name": "Test Flood",
                    "country": "Testland",
                },
            }],
        },
    })
    manager = FakeManager()
    ingestor = LiveIncidentIngestor(
        manager,
        source,
        database_engine=None,
        http_client=httpx.AsyncClient(),
        poll_seconds=30,
    )
    ingestor.sources = ("usgs_earthquakes", "gdacs")

    try:
        assert await ingestor.run_once() == 2
        assert await ingestor.run_once() == 0
    finally:
        await ingestor.http_client.aclose()

    assert {item.hazard_type for item in manager.created} == {"earthquake", "fl"}
    assert {item.source_id for item in manager.created} == {"usgs_earthquakes", "gdacs"}
    assert {item.data_status for item in manager.created} == {"live"}
    assert all(item.external_id for item in manager.created)
    assert all(item.observed_at is not None and item.last_seen_at is not None for item in manager.created)
