from __future__ import annotations

import csv
import io
import json
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.models import IngestionRequest, IngestionResult


class CycloneTrackPoint(BaseModel):
    storm_id: str
    observed_at: datetime
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    basin: str | None = None
    nature: str | None = None
    wind_kt: float | None = None
    pressure_mb: float | None = None
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class CycloneTrack(BaseModel):
    storm_id: str
    season: int | None = None
    basin: str | None = None
    name: str | None = None
    point_count: int
    points: list[CycloneTrackPoint]


class IBTrACSAdapter:
    source_id = "ibtracs"
    default_base_url = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01"

    def __init__(self, base_url: str = default_base_url, database_engine=None, client: httpx.AsyncClient | None = None) -> None:
        self.base_url = base_url.rstrip("/")
        self.database_engine = database_engine
        self.client = client

    def catalog(self) -> dict[str, Any]:
        return {
            "version": "v04r01",
            "formats": ["csv", "netcdf", "shapefile"],
            "subsets": ["ALL", "since1980", "last3years", "active", "NA", "NI", "SI", "WP", "SP", "EP"],
            "csv_url_template": f"{self.base_url}/access/csv/ibtracs.{{subset}}.list.v04r01.csv",
            "publisher": "NOAA NCEI",
        }

    @staticmethod
    def _value(row: dict[str, str], *names: str) -> str | None:
        for name in names:
            value = row.get(name) or row.get(name.upper()) or row.get(name.lower())
            if value not in (None, "", "NaN", "-999", "-999.0"):
                return value.strip()
        return None

    @classmethod
    def normalize_csv(cls, csv_text: str) -> list[CycloneTrack]:
        lines = csv_text.lstrip("\ufeff").splitlines()
        if len(lines) > 1 and lines[1].startswith(""):
            # IBTrACS CSV includes a units row after the variable-name row.
            reader = csv.DictReader(io.StringIO("\n".join([lines[0], *lines[2:]])))
        else:
            reader = csv.DictReader(io.StringIO(csv_text))
        grouped: dict[str, list[CycloneTrackPoint]] = {}
        metadata: dict[str, dict[str, Any]] = {}
        for row in reader:
            storm_id = cls._value(row, "SID")
            timestamp = cls._value(row, "ISO_TIME")
            latitude = cls._value(row, "LAT")
            longitude = cls._value(row, "LON")
            if not storm_id or not timestamp or latitude is None or longitude is None:
                continue
            try:
                observed_at = datetime.fromisoformat(timestamp)
                if observed_at.tzinfo is None:
                    observed_at = observed_at.replace(tzinfo=UTC)
                point = CycloneTrackPoint(
                    storm_id=storm_id, observed_at=observed_at,
                    latitude=float(latitude), longitude=float(longitude),
                    basin=cls._value(row, "BASIN", "BASIN_CODE"),
                    nature=cls._value(row, "NATURE"),
                    wind_kt=cls._float(cls._value(row, "USA_WIND", "WMO_WIND")),
                    pressure_mb=cls._float(cls._value(row, "USA_PRES", "WMO_PRES")),
                    raw_payload=dict(row),
                )
            except (TypeError, ValueError):
                continue
            grouped.setdefault(storm_id, []).append(point)
            metadata.setdefault(storm_id, {
                "season": cls._int(cls._value(row, "SEASON")),
                "basin": cls._value(row, "BASIN"),
                "name": cls._value(row, "NAME"),
            })
        return [CycloneTrack(storm_id=storm_id, **metadata[storm_id], point_count=len(points), points=sorted(points, key=lambda item: item.observed_at)) for storm_id, points in grouped.items()]

    @staticmethod
    def _float(value: str | None) -> float | None:
        try:
            return float(value) if value is not None else None
        except ValueError:
            return None

    @staticmethod
    def _int(value: str | None) -> int | None:
        try:
            return int(float(value)) if value is not None else None
        except ValueError:
            return None

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        operation = str(request.params.get("operation", "catalog")).lower()
        if operation == "catalog":
            return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=0, payload={"operation": operation, **self.catalog()})
        if operation != "csv":
            raise ValueError("IBTrACS operation must be catalog or csv")
        url = request.params.get("url")
        if not url:
            raise ValueError("IBTrACS CSV ingestion requires params.url from the official NCEI archive")
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=180, follow_redirects=True)
        try:
            response = await client.get(url)
            response.raise_for_status()
            tracks = self.normalize_csv(response.text)
        finally:
            if owned_client:
                await client.aclose()
        stored_count = await self.store(tracks)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"operation": operation, "url": url, "storm_count": len(tracks), "point_count": sum(track.point_count for track in tracks)})

    async def store(self, tracks: list[CycloneTrack]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'NOAA IBTrACS', 'NOAA NCEI', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.base_url})
            for track in tracks:
                await connection.execute(text("""INSERT INTO tropical_cyclones
                    (source_id, storm_id, season, basin, name, point_count, raw_payload)
                    VALUES (:source_id, :storm_id, :season, :basin, :name, :point_count, CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, storm_id) DO UPDATE SET season=EXCLUDED.season,
                    basin=EXCLUDED.basin, name=EXCLUDED.name, point_count=EXCLUDED.point_count,
                    raw_payload=EXCLUDED.raw_payload, updated_at=now()"""), {
                    "source_id": self.source_id, "storm_id": track.storm_id, "season": track.season,
                    "basin": track.basin, "name": track.name, "point_count": track.point_count,
                    "raw_payload": json.dumps({"storm_id": track.storm_id}),
                })
                for point in track.points:
                    values = point.model_dump(mode="python")
                    values.update({"source_id": self.source_id, "raw_payload": json.dumps(point.raw_payload, default=str)})
                    await connection.execute(text("""INSERT INTO tropical_cyclone_points
                        (source_id, storm_id, observed_at, latitude, longitude, basin, nature, wind_kt,
                         pressure_mb, geom, raw_payload)
                        VALUES (:source_id, :storm_id, :observed_at, :latitude, :longitude, :basin,
                         :nature, :wind_kt, :pressure_mb,
                         ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                         CAST(:raw_payload AS JSONB))
                        ON CONFLICT (source_id, storm_id, observed_at) DO UPDATE SET latitude=EXCLUDED.latitude,
                         longitude=EXCLUDED.longitude, basin=EXCLUDED.basin, nature=EXCLUDED.nature,
                         wind_kt=EXCLUDED.wind_kt, pressure_mb=EXCLUDED.pressure_mb,
                         geom=EXCLUDED.geom, raw_payload=EXCLUDED.raw_payload"""), values)
        return len(tracks)
