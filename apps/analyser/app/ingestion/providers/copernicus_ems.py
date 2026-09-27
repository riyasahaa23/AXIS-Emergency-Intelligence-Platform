from __future__ import annotations

import json
import re
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.models import IngestionRequest, IngestionResult


class EMSActivation(BaseModel):
    code: str = Field(min_length=1)
    countries: list[str] = Field(default_factory=list)
    event_time: datetime | None = None
    name: str
    centroid_latitude: float | None = Field(default=None, ge=-90, le=90)
    centroid_longitude: float | None = Field(default=None, ge=-180, le=180)
    activation_time: datetime | None = None
    category: str | None = None
    last_update: datetime | None = None
    closed: bool = False
    gdacs_id: str | None = None
    area_of_interest_count: int = Field(default=0, ge=0)
    product_count: int = Field(default=0, ge=0)
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class CopernicusEMSAdapter:
    source_id = "copernicus_ems"
    default_endpoint = "https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations-info/"

    def __init__(self, endpoint: str = default_endpoint, database_engine=None, client: httpx.AsyncClient | None = None) -> None:
        self.endpoint = endpoint
        self.database_engine = database_engine
        self.client = client

    @staticmethod
    def _datetime(value: Any) -> datetime | None:
        if value in (None, ""):
            return None
        parsed = datetime.fromisoformat(str(value))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)

    @staticmethod
    def _point(value: Any) -> tuple[float | None, float | None]:
        if not value:
            return None, None
        match = re.search(r"POINT\s*\(\s*([-+\d.]+)\s+([-+\d.]+)\s*\)", str(value), re.IGNORECASE)
        if not match:
            return None, None
        longitude, latitude = float(match.group(1)), float(match.group(2))
        return latitude, longitude

    @classmethod
    def normalize(cls, payload: dict[str, Any]) -> list[EMSActivation]:
        results = payload.get("results", []) if isinstance(payload, dict) else []
        activations: list[EMSActivation] = []
        for row in results:
            latitude, longitude = cls._point(row.get("centroid"))
            activations.append(EMSActivation(
                code=str(row.get("code", "")), countries=[str(item) for item in row.get("countries", [])],
                event_time=cls._datetime(row.get("eventTime")), name=str(row.get("name", "Unnamed activation")),
                centroid_latitude=latitude, centroid_longitude=longitude,
                activation_time=cls._datetime(row.get("activationTime")), category=row.get("category"),
                last_update=cls._datetime(row.get("lastUpdate")), closed=bool(row.get("closed", False)),
                gdacs_id=row.get("gdacsId"), area_of_interest_count=int(row.get("n_aois", 0) or 0),
                product_count=int(row.get("n_products", 0) or 0), raw_payload=row,
            ))
        return [item for item in activations if item.code]

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        params = {"limit": request.limit, "offset": int(request.params.get("offset", 0))}
        params.update({key: value for key, value in request.params.items() if key not in {"operation", "offset"}})
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=60, follow_redirects=True)
        try:
            response = await client.get(self.endpoint, params=params)
            response.raise_for_status()
            payload = response.json()
        finally:
            if owned_client:
                await client.aclose()
        activations = self.normalize(payload)
        stored_count = await self.store(activations)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"count": len(activations), "total": payload.get("count") if isinstance(payload, dict) else None, "offset": params["offset"]})

    async def store(self, activations: list[EMSActivation]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'Copernicus EMS Rapid Mapping', 'Copernicus Emergency Management Service', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.endpoint})
            for activation in activations:
                values = activation.model_dump(mode="python")
                values.update({"source_id": self.source_id, "countries": json.dumps(activation.countries), "raw_payload": json.dumps(activation.raw_payload, default=str)})
                await connection.execute(text("""INSERT INTO copernicus_ems_activations
                    (source_id, code, countries, event_time, name, centroid_latitude, centroid_longitude,
                     activation_time, category, last_update, closed, gdacs_id, area_of_interest_count,
                     product_count, geom, raw_payload)
                    VALUES (:source_id, :code, CAST(:countries AS JSONB), :event_time, :name,
                     :centroid_latitude, :centroid_longitude, :activation_time, :category, :last_update,
                     :closed, :gdacs_id, :area_of_interest_count, :product_count,
                     CASE WHEN CAST(:centroid_latitude AS DOUBLE PRECISION) IS NULL OR CAST(:centroid_longitude AS DOUBLE PRECISION) IS NULL THEN NULL
                          ELSE ST_SetSRID(ST_MakePoint(CAST(:centroid_longitude AS DOUBLE PRECISION), CAST(:centroid_latitude AS DOUBLE PRECISION)), 4326)::geography END,
                     CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, code) DO UPDATE SET countries=EXCLUDED.countries,
                     event_time=EXCLUDED.event_time, name=EXCLUDED.name,
                     centroid_latitude=EXCLUDED.centroid_latitude, centroid_longitude=EXCLUDED.centroid_longitude,
                     activation_time=EXCLUDED.activation_time, category=EXCLUDED.category,
                     last_update=EXCLUDED.last_update, closed=EXCLUDED.closed, gdacs_id=EXCLUDED.gdacs_id,
                     area_of_interest_count=EXCLUDED.area_of_interest_count, product_count=EXCLUDED.product_count,
                     geom=EXCLUDED.geom, raw_payload=EXCLUDED.raw_payload, updated_at=now()"""), values)
        return len(activations)
