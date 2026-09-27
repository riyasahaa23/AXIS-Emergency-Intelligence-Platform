from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.client import SourceNotConfigured
from app.ingestion.models import IngestionRequest, IngestionResult
from app.storage.object_store import LocalObjectStore, ObjectStore


class IMERGProduct(BaseModel):
    product_id: str
    run: str
    temporal_resolution: str
    format: str
    resolution: str
    access_url: str
    latency: str
    notes: str


class IMERGObservation(BaseModel):
    external_id: str
    observed_at: datetime
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    precipitation_mm: float
    product_id: str
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class IMERGAdapter:
    source_id = "gpm_imerg"
    default_archive_url = "https://arthurhouhttps.pps.eosdis.nasa.gov/gpmdata/"

    def __init__(self, archive_url: str = default_archive_url, access_token: str = "", storage_dir: str = "data/object-store", database_engine=None, client: httpx.AsyncClient | None = None, object_store: ObjectStore | None = None) -> None:
        self.archive_url = archive_url.rstrip("/")
        self.access_token = access_token
        self.object_store = object_store or LocalObjectStore(storage_dir)
        self.database_engine = database_engine
        self.client = client

    def catalog(self) -> list[IMERGProduct]:
        return [
            IMERGProduct(product_id="3IMERGHH", run="Early", temporal_resolution="half-hourly", format="HDF5/GeoTIFF", resolution="0.1 degree", access_url="https://gpm.nasa.gov/data/directory", latency="about 4 hours", notes="Near-real-time disaster monitoring."),
            IMERGProduct(product_id="3IMERGHH", run="Late", temporal_resolution="half-hourly", format="HDF5/GeoTIFF", resolution="0.1 degree", access_url="https://gpm.nasa.gov/data/directory", latency="longer than Early", notes="Improved near-real-time quality."),
            IMERGProduct(product_id="3IMERGHH", run="Final", temporal_resolution="half-hourly", format="HDF5/GeoTIFF", resolution="0.1 degree", access_url="https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGHH_07/summary", latency="research latency", notes="Research-quality retrospectively processed product."),
            IMERGProduct(product_id="3IMERGDF", run="Final", temporal_resolution="daily", format="HDF5/GeoTIFF", resolution="0.1 degree", access_url="https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDF_07/summary", latency="research latency", notes="Daily precipitation accumulation."),
        ]

    @staticmethod
    def normalize_observations(rows: list[dict[str, Any]], product_id: str) -> list[IMERGObservation]:
        observations: list[IMERGObservation] = []
        for index, row in enumerate(rows):
            timestamp = row.get("observed_at") or row.get("time") or row.get("timestamp")
            if timestamp is None:
                continue
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp)
            if timestamp.tzinfo is None:
                timestamp = timestamp.replace(tzinfo=UTC)
            latitude = row.get("latitude")
            longitude = row.get("longitude")
            value = row.get("precipitation_mm", row.get("precipitation", row.get("precipitationCal")))
            if latitude is None or longitude is None or value is None:
                continue
            observations.append(IMERGObservation(
                external_id=str(row.get("id") or f"{product_id}:{timestamp.isoformat()}:{latitude}:{longitude}:{index}"),
                observed_at=timestamp,
                latitude=float(latitude), longitude=float(longitude),
                precipitation_mm=float(value), product_id=product_id, raw_payload=row,
            ))
        return observations

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        operation = str(request.params.get("operation", "catalog")).lower()
        if operation == "catalog":
            return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=0, payload={"operation": operation, "products": [item.model_dump(mode="json") for item in self.catalog()]})
        if operation == "observations":
            return await self.fetch_observations(request)
        if operation == "download":
            return await self.download_asset(request)
        raise ValueError("IMERG operation must be catalog, observations, or download")

    async def fetch_observations(self, request: IngestionRequest) -> IngestionResult:
        endpoint = request.params.get("endpoint")
        product_id = str(request.params.get("product_id", "3IMERGHH"))
        if not self.access_token:
            raise SourceNotConfigured("NASA IMERG data access requires AXIS_IMERG_ACCESS_TOKEN")
        if not endpoint:
            raise ValueError("IMERG observations require params.endpoint for the selected NASA service")
        payload = await self._get_json(endpoint, request.params)
        observations = self.normalize_observations(payload.get("records", []) if isinstance(payload, dict) else [], product_id)
        stored_count = await self.store_observations(observations)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"operation": "observations", "count": len(observations), "product_id": product_id})

    async def download_asset(self, request: IngestionRequest) -> IngestionResult:
        if not self.access_token:
            raise SourceNotConfigured("NASA IMERG data access requires AXIS_IMERG_ACCESS_TOKEN")
        url = request.params.get("url")
        if not url:
            raise ValueError("IMERG downloads require params.url from the selected NASA archive/service")
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=180, follow_redirects=True)
        try:
            response = await client.get(url, headers={"Authorization": f"Bearer {self.access_token}"})
            response.raise_for_status()
            content = response.content
        finally:
            if owned_client:
                await client.aclose()
        checksum = hashlib.sha256(content).hexdigest()
        filename = url.rstrip("/").split("/")[-1] or f"imerg-{checksum[:16]}.bin"
        content_type = response.headers.get("content-type", "application/octet-stream")
        object_uri = await self.object_store.put(f"imerg/{filename}", content, content_type)
        asset = {"url": url, "object_uri": object_uri, "checksum_sha256": checksum, "byte_size": len(content), "content_type": content_type, "product_id": request.params.get("product_id", "unknown")}
        stored_count = await self.store_asset(asset)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"operation": "download", "asset": asset})

    async def _get_json(self, endpoint: str, params: dict[str, Any]) -> Any:
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=60, follow_redirects=True)
        query = {key: value for key, value in params.items() if key not in {"operation", "endpoint", "product_id"}}
        try:
            response = await client.get(endpoint, params=query, headers={"Authorization": f"Bearer {self.access_token}"})
            response.raise_for_status()
            return response.json()
        finally:
            if owned_client:
                await client.aclose()

    async def store_asset(self, asset: dict[str, Any]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'NASA GPM IMERG', 'NASA GPM', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.archive_url})
            await connection.execute(text("""INSERT INTO precipitation_assets
                (source_id, product_id, source_url, object_uri, checksum_sha256, byte_size, content_type, metadata)
                VALUES (:source_id, :product_id, :url, :object_uri, :checksum_sha256, :byte_size, :content_type, CAST(:metadata AS JSONB))
                ON CONFLICT (source_id, checksum_sha256) DO UPDATE SET object_uri=EXCLUDED.object_uri,
                byte_size=EXCLUDED.byte_size, metadata=EXCLUDED.metadata"""), {
                "source_id": self.source_id, **asset, "metadata": json.dumps(asset, default=str),
            })
        return 1

    async def store_observations(self, observations: list[IMERGObservation]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'NASA GPM IMERG', 'NASA GPM', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.archive_url})
            for observation in observations:
                values = observation.model_dump(mode="python")
                values.update({"source_id": self.source_id, "raw_payload": json.dumps(observation.raw_payload, default=str)})
                await connection.execute(text("""INSERT INTO precipitation_observations
                    (source_id, external_id, observed_at, latitude, longitude, precipitation_mm, product_id, geom, raw_payload)
                    VALUES (:source_id, :external_id, :observed_at, :latitude, :longitude, :precipitation_mm,
                    :product_id, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, external_id) DO UPDATE SET observed_at=EXCLUDED.observed_at,
                    precipitation_mm=EXCLUDED.precipitation_mm, product_id=EXCLUDED.product_id,
                    geom=EXCLUDED.geom, raw_payload=EXCLUDED.raw_payload"""), values)
        return len(observations)
