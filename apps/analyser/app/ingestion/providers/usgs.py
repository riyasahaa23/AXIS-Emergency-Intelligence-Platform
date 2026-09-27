from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.models import IngestionRequest, IngestionResult


class EarthquakeObservation(BaseModel):
    external_id: str = Field(min_length=1)
    magnitude: float | None = None
    place: str | None = None
    observed_at: datetime | None = None
    updated_at: datetime | None = None
    status: str | None = None
    event_type: str | None = None
    longitude: float = Field(ge=-180, le=180)
    latitude: float = Field(ge=-90, le=90)
    depth_km: float | None = None
    url: str | None = None
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class USGSAdapter:
    source_id = "usgs_earthquakes"

    def __init__(self, endpoint: str, database_engine=None, client: httpx.AsyncClient | None = None) -> None:
        self.endpoint = endpoint
        self.database_engine = database_engine
        self.client = client

    @staticmethod
    def normalize(payload: dict[str, Any]) -> list[EarthquakeObservation]:
        if payload.get("type") != "FeatureCollection":
            raise ValueError("USGS response is not a GeoJSON FeatureCollection")
        observations: list[EarthquakeObservation] = []
        for feature in payload.get("features", []):
            properties = feature.get("properties") or {}
            coordinates = (feature.get("geometry") or {}).get("coordinates") or []
            if len(coordinates) < 2 or not feature.get("id"):
                continue
            observed_at = USGSAdapter._timestamp(properties.get("time"))
            updated_at = USGSAdapter._timestamp(properties.get("updated"))
            observations.append(EarthquakeObservation(
                external_id=str(feature["id"]),
                magnitude=properties.get("mag"),
                place=properties.get("place"),
                observed_at=observed_at,
                updated_at=updated_at,
                status=properties.get("status"),
                event_type=properties.get("type"),
                longitude=float(coordinates[0]),
                latitude=float(coordinates[1]),
                depth_km=float(coordinates[2]) if len(coordinates) > 2 and coordinates[2] is not None else None,
                url=properties.get("url"),
                raw_payload=feature,
            ))
        return observations

    @staticmethod
    def _timestamp(value: Any) -> datetime | None:
        if value is None:
            return None
        return datetime.fromtimestamp(float(value) / 1000, tz=UTC)

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        params: dict[str, Any] = {**request.params, "format": "geojson", "limit": request.limit}
        if request.start:
            params["starttime"] = request.start.isoformat()
        if request.end:
            params["endtime"] = request.end.isoformat()
        if request.query:
            params.setdefault("eventid", request.query)

        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=30, follow_redirects=True)
        try:
            response = await client.get(self.endpoint, params=params)
            response.raise_for_status()
            payload = response.json()
        finally:
            if owned_client:
                await client.aclose()

        observations = self.normalize(payload)
        stored_count = await self.store(observations)
        return IngestionResult(
            source=self.source_id,
            fetched_at=datetime.now(UTC),
            stored_count=stored_count,
            payload=payload,
        )

    async def store(self, observations: list[EarthquakeObservation]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'USGS Earthquake Catalog', 'USGS', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.endpoint})
            for observation in observations:
                values = observation.model_dump(mode="python")
                values.update({
                    "source_id": self.source_id,
                    "longitude": observation.longitude,
                    "latitude": observation.latitude,
                    "raw_payload": json.dumps(observation.raw_payload),
                })
                await connection.execute(text("""INSERT INTO earthquakes
                    (source_id, external_id, magnitude, place, observed_at, updated_at,
                     status, event_type, depth_km, url, geom, raw_payload)
                    VALUES (:source_id, :external_id, :magnitude, :place, :observed_at, :updated_at,
                            :status, :event_type, :depth_km, :url,
                            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                            CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, external_id) DO UPDATE SET
                        magnitude=EXCLUDED.magnitude, place=EXCLUDED.place,
                        observed_at=EXCLUDED.observed_at, updated_at=EXCLUDED.updated_at,
                        status=EXCLUDED.status, event_type=EXCLUDED.event_type,
                        depth_km=EXCLUDED.depth_km, url=EXCLUDED.url,
                            geom=EXCLUDED.geom, raw_payload=EXCLUDED.raw_payload"""), values)
        return len(observations)
