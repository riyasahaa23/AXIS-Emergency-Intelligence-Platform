from datetime import UTC, datetime
import hashlib
import json
from typing import Any

import httpx

from .models import IngestionRequest, IngestionResult
from .registry import SOURCE_REGISTRY


class SourceNotConfigured(RuntimeError):
    pass


class SourceClient:
    """Conservative JSON ingestion client for public API/feed sources."""

    def __init__(self, database_engine=None) -> None:
        self.database_engine = database_engine

    async def fetch(self, source_id: str, request: IngestionRequest) -> IngestionResult:
        source = SOURCE_REGISTRY.get(source_id)
        if source is None:
            raise KeyError(source_id)
        if source.kind == "dataset" or source.endpoint is None:
            return IngestionResult(source=source_id, fetched_at=datetime.now(UTC), stored_count=0, payload={"catalog_url": source.endpoint, "message": "Dataset source registered; use its official download/catalog workflow."})
        params: dict[str, Any] = {**request.params}
        if request.query:
            params.setdefault("query", request.query)
        if request.start:
            params.setdefault("start", request.start.isoformat())
        if request.end:
            params.setdefault("end", request.end.isoformat())
        if source_id == "usgs_earthquakes":
            params.setdefault("format", "geojson")
            params.setdefault("limit", request.limit)
        if source_id == "reliefweb":
            params.setdefault("appname", "axis-emergency-intelligence")
            params.setdefault("limit", request.limit)
        if source_id == "osm_overpass":
            query = params.pop("data", request.query)
            if not query:
                raise ValueError("OSM Overpass requires params.data or query")
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(source.endpoint, data={"data": query})
        else:
            async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
                response = await client.get(source.endpoint, params=params)
        response.raise_for_status()
        payload: Any
        try:
            payload = response.json()
        except ValueError:
            payload = {"text": response.text}
        count = len(payload.get("features", [])) if isinstance(payload, dict) else 0
        if isinstance(payload, dict) and isinstance(payload.get("data"), list):
            count = len(payload["data"])
        stored_count = await self._store(source_id, payload)
        return IngestionResult(source=source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload=payload)

    async def _store(self, source_id: str, payload: Any) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        records = payload.get("features", []) if isinstance(payload, dict) else []
        if not records and isinstance(payload, dict) and isinstance(payload.get("data"), list):
            records = payload["data"]
        if not records:
            records = [payload]
        async with self.database_engine.begin() as connection:
            for record in records:
                encoded = json.dumps(record, default=str)
                external_id = record.get("id") if isinstance(record, dict) else None
                if external_id is None:
                    external_id = hashlib.sha256(encoded.encode()).hexdigest()
                await connection.execute(
                    text("""INSERT INTO external_observations (source, external_id, payload)
                        VALUES (:source, :external_id, CAST(:payload AS JSONB))
                        ON CONFLICT (source, external_id) DO UPDATE SET payload = EXCLUDED.payload,
                        observed_at = now()"""),
                    {"source": source_id, "external_id": str(external_id), "payload": encoded},
                )
        return len(records)
