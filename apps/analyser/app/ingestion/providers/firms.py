from __future__ import annotations

import csv
import hashlib
import io
import json
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.client import SourceNotConfigured
from app.ingestion.models import IngestionRequest, IngestionResult


class FireDetection(BaseModel):
    external_id: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    brightness: float | None = None
    bright_t31: float | None = None
    frp: float | None = None
    confidence: str | None = None
    satellite: str | None = None
    instrument: str | None = None
    acq_date: datetime | None = None
    daynight: str | None = None
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class FIRMSAdapter:
    source_id = "firms"

    def __init__(self, map_key: str, source: str = "VIIRS_NOAA20_NRT", days: int = 1, database_engine=None, client: httpx.AsyncClient | None = None) -> None:
        self.map_key = map_key
        self.source = source
        self.days = max(1, min(days, 5))
        self.database_engine = database_engine
        self.client = client

    @staticmethod
    def normalize(csv_text: str) -> list[FireDetection]:
        reader = csv.DictReader(io.StringIO(csv_text))
        detections: list[FireDetection] = []
        for row in reader:
            if not row.get("latitude") or not row.get("longitude") or not row.get("acq_date"):
                continue
            acq_time = str(row.get("acq_time", "0000")).zfill(4)
            try:
                captured = datetime.strptime(f"{row['acq_date']} {acq_time}", "%Y-%m-%d %H%M").replace(tzinfo=UTC)
            except ValueError:
                captured = None
            external_id = hashlib.sha256(
                f"{row.get('satellite')}|{row.get('instrument')}|{row.get('latitude')}|{row.get('longitude')}|{row.get('acq_date')}|{acq_time}".encode()
            ).hexdigest()[:32]
            detections.append(FireDetection(
                external_id=external_id,
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                brightness=FIRMSAdapter._float(row.get("brightness")),
                bright_t31=FIRMSAdapter._float(row.get("bright_t31")),
                frp=FIRMSAdapter._float(row.get("frp")),
                confidence=row.get("confidence"),
                satellite=row.get("satellite"),
                instrument=row.get("instrument"),
                acq_date=captured,
                daynight=row.get("daynight"),
                raw_payload=row,
            ))
        return detections

    @staticmethod
    def _float(value: Any) -> float | None:
        try:
            return float(value) if value not in (None, "", "null") else None
        except (TypeError, ValueError):
            return None

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        if not self.map_key:
            raise SourceNotConfigured("NASA FIRMS requires AXIS_FIRMS_MAP_KEY")
        area = request.params.get("area", "world")
        source = request.params.get("source", self.source)
        days = max(1, min(int(request.params.get("days", self.days)), 5))
        url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{self.map_key}/{source}/{area}/{days}"
        if request.start:
            url = f"{url}/{request.start.date().isoformat()}"
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=60, follow_redirects=True)
        try:
            response = await client.get(url)
            response.raise_for_status()
            csv_text = response.text
        finally:
            if owned_client:
                await client.aclose()
        detections = self.normalize(csv_text)
        stored_count = await self.store(detections)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"count": len(detections), "source": source, "area": area, "days": days})

    async def store(self, detections: list[FireDetection]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'NASA FIRMS Active Fire', 'NASA LANCE', 'https://firms.modaps.eosdis.nasa.gov/api/')
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id})
            for detection in detections:
                values = detection.model_dump(mode="python")
                values.update({"source_id": self.source_id, "raw_payload": json.dumps(detection.raw_payload)})
                await connection.execute(text("""INSERT INTO active_fire_detections
                    (source_id, external_id, latitude, longitude, brightness, bright_t31, frp,
                     confidence, satellite, instrument, acq_date, daynight, geom, raw_payload)
                    VALUES (:source_id, :external_id, :latitude, :longitude, :brightness, :bright_t31, :frp,
                            :confidence, :satellite, :instrument, :acq_date, :daynight,
                            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                            CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, external_id) DO UPDATE SET
                        brightness=EXCLUDED.brightness, bright_t31=EXCLUDED.bright_t31,
                        frp=EXCLUDED.frp, confidence=EXCLUDED.confidence,
                        satellite=EXCLUDED.satellite, instrument=EXCLUDED.instrument,
                        acq_date=EXCLUDED.acq_date, daynight=EXCLUDED.daynight,
                        geom=EXCLUDED.geom, raw_payload=EXCLUDED.raw_payload"""), values)
        return len(detections)
