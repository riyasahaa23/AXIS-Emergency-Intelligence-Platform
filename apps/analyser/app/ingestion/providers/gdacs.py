from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.models import IngestionRequest, IngestionResult


class GDACSEvent(BaseModel):
    event_type: str = Field(min_length=1)
    event_id: str = Field(min_length=1)
    episode_id: str = ""
    alert_level: str | None = None
    name: str | None = None
    country: str | None = None
    observed_at: datetime | None = None
    updated_at: datetime | None = None
    geometry: dict[str, Any] | None = None
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class GDACSAdapter:
    source_id = "gdacs"

    def __init__(self, endpoint: str, database_engine=None, client: httpx.AsyncClient | None = None) -> None:
        self.endpoint = endpoint.rstrip("/")
        self.database_engine = database_engine
        self.client = client

    @staticmethod
    def normalize(payload: dict[str, Any]) -> list[GDACSEvent]:
        features = payload.get("features", []) if payload.get("type") == "FeatureCollection" else []
        if not isinstance(features, list):
            raise ValueError("GDACS response does not contain a GeoJSON feature list")
        events: list[GDACSEvent] = []
        for feature in features:
            properties = feature.get("properties") or {}
            event_type = GDACSAdapter._value(properties, "eventtype", "event_type", "eventType", "type")
            event_id = GDACSAdapter._value(properties, "eventid", "event_id", "eventId", "id") or feature.get("id")
            if not event_type or not event_id:
                continue
            events.append(GDACSEvent(
                event_type=str(event_type),
                event_id=str(event_id),
                episode_id=GDACSAdapter._string(properties, "episodeid", "episode_id", "episodeId") or "",
                alert_level=GDACSAdapter._string(properties, "alertlevel", "alert_level", "alertLevel"),
                name=GDACSAdapter._string(properties, "name", "eventname", "event_name"),
                country=GDACSAdapter._string(properties, "country", "countryname", "country_name"),
                observed_at=GDACSAdapter._datetime(properties, "fromdate", "eventdate", "date", "observed_at"),
                updated_at=GDACSAdapter._datetime(properties, "todate", "updated", "updated_at"),
                geometry=feature.get("geometry"),
                raw_payload=feature,
            ))
        return events

    @staticmethod
    def _value(properties: dict[str, Any], *keys: str) -> Any:
        for key in keys:
            if properties.get(key) is not None:
                return properties[key]
        return None

    @classmethod
    def _string(cls, properties: dict[str, Any], *keys: str) -> str | None:
        value = cls._value(properties, *keys)
        return str(value) if value is not None else None

    @classmethod
    def _datetime(cls, properties: dict[str, Any], *keys: str) -> datetime | None:
        value = cls._value(properties, *keys)
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(float(value) / 1000, tz=UTC)
        parsed = str(value).replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(parsed)
        except ValueError:
            return None

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        end = request.end or datetime.now(UTC)
        start = request.start or end - timedelta(days=4)
        params: dict[str, Any] = {
            "eventlist": request.params.get("eventlist", "EQ;TC;FL;VO;WF"),
            "fromdate": start.date().isoformat(),
            "todate": end.date().isoformat(),
            "alertlevel": request.params.get("alertlevel", "red;orange;green;reg"),
        }
        params.update({key: value for key, value in request.params.items() if key not in {"eventlist", "alertlevel"}})
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=30, follow_redirects=True)
        try:
            response = await client.get(self.endpoint, params=params)
            response.raise_for_status()
            payload = response.json()
        finally:
            if owned_client:
                await client.aclose()
        events = self.normalize(payload)
        stored_count = await self.store(events)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload=payload)

    async def store(self, events: list[GDACSEvent]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'Global Disaster Alert and Coordination System', 'GDACS', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.endpoint})
            for event in events:
                geometry_json = json.dumps(event.geometry) if event.geometry else None
                values = event.model_dump(mode="python")
                values.update({"source_id": self.source_id, "raw_payload": json.dumps(event.raw_payload), "geometry_json": geometry_json})
                await connection.execute(text("""INSERT INTO gdacs_events
                    (source_id, event_type, event_id, episode_id, alert_level, name, country,
                     observed_at, updated_at, geom, raw_payload)
                    VALUES (:source_id, :event_type, :event_id, :episode_id, :alert_level, :name, :country,
                            :observed_at, :updated_at,
                            CASE WHEN CAST(:geometry_json AS TEXT) IS NULL THEN NULL
                                 ELSE ST_SetSRID(ST_GeomFromGeoJSON(CAST(:geometry_json AS TEXT)), 4326)::geography END,
                            CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, event_type, event_id, episode_id) DO UPDATE SET
                        alert_level=EXCLUDED.alert_level, name=EXCLUDED.name, country=EXCLUDED.country,
                        observed_at=EXCLUDED.observed_at, updated_at=EXCLUDED.updated_at,
                        geom=EXCLUDED.geom, raw_payload=EXCLUDED.raw_payload"""), values)
        return len(events)
