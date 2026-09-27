from __future__ import annotations

import csv
import io
import json
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.models import IngestionRequest, IngestionResult


class GHCNhObservation(BaseModel):
    station_id: str
    observed_at: datetime
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    elevation_m: float | None = None
    temperature_c: float | None = None
    dew_point_c: float | None = None
    precipitation_mm: float | None = None
    wind_speed_mps: float | None = None
    wind_direction_deg: float | None = Field(default=None, ge=0, le=360)
    relative_humidity_pct: float | None = Field(default=None, ge=0, le=100)
    quality: dict[str, Any] = Field(default_factory=dict)
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class GHCNhAdapter:
    source_id = "ghcnh"
    default_base_url = "https://www.ncei.noaa.gov/oa/global-historical-climatology-network/hourly"

    def __init__(self, base_url: str = default_base_url, database_engine=None, client: httpx.AsyncClient | None = None) -> None:
        self.base_url = base_url.rstrip("/")
        self.database_engine = database_engine
        self.client = client

    def catalog(self) -> dict[str, Any]:
        return {
            "version": "v1",
            "formats": ["PSV", "tar.gz"],
            "access_methods": ["by-station-period", "by-year", "archive"],
            "station_file_template": f"{self.base_url}/access/by-year/{{year}}/psv/GHCNh_{{station}}_{{year}}.psv",
            "archive_url": f"{self.base_url}/archive",
            "publisher": "NOAA NCEI",
        }

    @staticmethod
    def _value(row: dict[str, str], *names: str) -> str | None:
        normalized = {str(key).strip().lower().replace(" ", "_"): value for key, value in row.items()}
        for name in names:
            value = normalized.get(name.lower().replace(" ", "_"))
            if value not in (None, "", "-999", "-999.0", "99999", "99999.0"):
                return value.strip()
        return None

    @classmethod
    def normalize_psv(cls, psv_text: str) -> list[GHCNhObservation]:
        sample = psv_text.splitlines()[0] if psv_text.splitlines() else ""
        delimiter = "|" if "|" in sample else "\t" if "\t" in sample else ","
        reader = csv.DictReader(io.StringIO(psv_text), delimiter=delimiter)
        observations: list[GHCNhObservation] = []
        for row in reader:
            station_id = cls._value(row, "station")
            timestamp = cls._value(row, "date", "datetime", "iso_time")
            latitude = cls._float(cls._value(row, "latitude", "lat"))
            longitude = cls._float(cls._value(row, "longitude", "lon", "lng"))
            if not station_id or not timestamp or latitude is None or longitude is None:
                continue
            try:
                observed_at = datetime.fromisoformat(timestamp)
                if observed_at.tzinfo is None:
                    observed_at = observed_at.replace(tzinfo=UTC)
                observations.append(GHCNhObservation(
                    station_id=station_id,
                    observed_at=observed_at,
                    latitude=latitude,
                    longitude=longitude,
                    elevation_m=cls._float(cls._value(row, "elevation", "elevation_m")),
                    temperature_c=cls._float(cls._value(row, "temperature", "dry_bulb_temperature", "tmp")),
                    dew_point_c=cls._float(cls._value(row, "dew_point_temperature", "dew_point", "dew_point_c")),
                    precipitation_mm=cls._float(cls._value(row, "precipitation", "precipitation_1_hour", "precipitation_24_hour")),
                    wind_speed_mps=cls._float(cls._value(row, "wind_speed", "wind_speed_mps")),
                    wind_direction_deg=cls._float(cls._value(row, "wind_direction", "wind_direction_deg")),
                    relative_humidity_pct=cls._float(cls._value(row, "relative_humidity", "relative_humidity_pct")),
                    quality={key: value for key, value in row.items() if "quality" in key.lower() or key.upper().endswith("_QC")},
                    raw_payload=dict(row),
                ))
            except (TypeError, ValueError):
                continue
        return observations

    @staticmethod
    def _float(value: str | None) -> float | None:
        try:
            return float(value) if value is not None else None
        except ValueError:
            return None

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        operation = str(request.params.get("operation", "catalog")).lower()
        if operation == "catalog":
            return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=0, payload={"operation": operation, **self.catalog()})
        if operation != "psv":
            raise ValueError("GHCNh operation must be catalog or psv")
        url = request.params.get("url")
        if not url:
            raise ValueError("GHCNh ingestion requires params.url from the official NCEI archive")
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=180, follow_redirects=True)
        try:
            response = await client.get(url)
            response.raise_for_status()
            observations = self.normalize_psv(response.text)
        finally:
            if owned_client:
                await client.aclose()
        stored_count = await self.store(observations)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"operation": operation, "url": url, "observation_count": len(observations)})

    async def store(self, observations: list[GHCNhObservation]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'NOAA GHCNh', 'NOAA NCEI', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.base_url})
            for observation in observations:
                values = observation.model_dump(mode="python")
                values.update({"source_id": self.source_id, "quality": json.dumps(observation.quality), "raw_payload": json.dumps(observation.raw_payload, default=str)})
                await connection.execute(text("""INSERT INTO hourly_weather_observations
                    (source_id, station_id, observed_at, latitude, longitude, elevation_m, temperature_c,
                     dew_point_c, precipitation_mm, wind_speed_mps, wind_direction_deg,
                     relative_humidity_pct, quality, geom, raw_payload)
                    VALUES (:source_id, :station_id, :observed_at, :latitude, :longitude, :elevation_m,
                     :temperature_c, :dew_point_c, :precipitation_mm, :wind_speed_mps, :wind_direction_deg,
                     :relative_humidity_pct, CAST(:quality AS JSONB),
                     ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                     CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, station_id, observed_at) DO UPDATE SET latitude=EXCLUDED.latitude,
                     longitude=EXCLUDED.longitude, elevation_m=EXCLUDED.elevation_m,
                     temperature_c=EXCLUDED.temperature_c, dew_point_c=EXCLUDED.dew_point_c,
                     precipitation_mm=EXCLUDED.precipitation_mm, wind_speed_mps=EXCLUDED.wind_speed_mps,
                     wind_direction_deg=EXCLUDED.wind_direction_deg,
                     relative_humidity_pct=EXCLUDED.relative_humidity_pct, quality=EXCLUDED.quality,
                     geom=EXCLUDED.geom, raw_payload=EXCLUDED.raw_payload"""), values)
        return len(observations)
