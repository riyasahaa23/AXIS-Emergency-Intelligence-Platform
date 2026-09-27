import hashlib
import json
from datetime import UTC, datetime
from typing import Any

import httpx

from app.storage.object_store import ObjectStore

from .models import IngestionRequest, IngestionResult
from .registry import SOURCE_REGISTRY


class SourceNotConfigured(RuntimeError):
    pass


class SourceClient:
    """Conservative JSON ingestion client for public API/feed sources."""

    def __init__(self, database_engine=None) -> None:
        self.database_engine = database_engine
        self.firms_map_key = ""
        self.firms_source = "VIIRS_NOAA20_NRT"
        self.firms_days = 1
        self.ecmwf_base_url = "https://data.ecmwf.int"
        self.object_storage_dir = "data/object-store"
        self.bhuvan_api_url = "https://bhuvan-app1.nrsc.gov.in/api/"
        self.bhuvan_api_token = ""
        self.bhuvan_wms_url = ""
        self.bhuvan_wmts_url = ""
        self.india_hospitals_api_url = "https://api.data.gov.in/resource"
        self.india_hospitals_api_key = ""
        self.india_hospitals_resource_id = ""
        self.imerg_archive_url = "https://arthurhouhttps.pps.eosdis.nasa.gov/gpmdata/"
        self.imerg_access_token = ""
        self.imerg_storage_dir = "data/object-store"
        self.object_store: ObjectStore | None = None
        self.ibtracs_base_url = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01"
        self.ghcnh_base_url = "https://www.ncei.noaa.gov/oa/global-historical-climatology-network/hourly"
        self.copernicus_ems_url = "https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations-info/"
        self.copernicus_land_cover_stac_url = "https://stac.dataspace.copernicus.eu/v1"

    async def fetch(self, source_id: str, request: IngestionRequest) -> IngestionResult:
        source = SOURCE_REGISTRY.get(source_id)
        if source is None:
            raise KeyError(source_id)
        if source_id == "usgs_earthquakes":
            from .providers.usgs import USGSAdapter

            return await USGSAdapter(source.endpoint or "", self.database_engine).fetch(request)
        if source_id == "gdacs":
            from .providers.gdacs import GDACSAdapter

            return await GDACSAdapter(source.endpoint or "", self.database_engine).fetch(request)
        if source_id == "firms":
            from .providers.firms import FIRMSAdapter

            return await FIRMSAdapter(self.firms_map_key, self.firms_source, self.firms_days, self.database_engine).fetch(request)
        if source_id == "ecmwf":
            from .providers.ecmwf import ECMWFAdapter

            return await ECMWFAdapter(self.ecmwf_base_url, self.object_storage_dir, self.database_engine, object_store=self.object_store).fetch(request)
        if source_id == "bhuvan_lulc":
            from .providers.bhuvan import BhuvanAdapter

            return await BhuvanAdapter(
                self.bhuvan_api_url, self.bhuvan_api_token, self.bhuvan_wms_url,
                self.bhuvan_wmts_url, self.database_engine,
            ).fetch(request)
        if source_id == "india_hospitals":
            from .providers.india_hospitals import IndiaHospitalAdapter

            return await IndiaHospitalAdapter(
                self.india_hospitals_api_key, self.india_hospitals_resource_id,
                self.india_hospitals_api_url, self.database_engine,
            ).fetch(request)
        if source_id == "gpm_imerg":
            from .providers.imerg import IMERGAdapter

            return await IMERGAdapter(
                self.imerg_archive_url, self.imerg_access_token,
                self.imerg_storage_dir, self.database_engine, object_store=self.object_store,
            ).fetch(request)
        if source_id == "ibtracs":
            from .providers.ibtracs import IBTrACSAdapter

            return await IBTrACSAdapter(self.ibtracs_base_url, self.database_engine).fetch(request)
        if source_id == "ghcnh":
            from .providers.ghcnh import GHCNhAdapter

            return await GHCNhAdapter(self.ghcnh_base_url, self.database_engine).fetch(request)
        if source_id == "copernicus_ems":
            from .providers.copernicus_ems import CopernicusEMSAdapter

            return await CopernicusEMSAdapter(self.copernicus_ems_url, self.database_engine).fetch(request)
        if source_id == "copernicus_land_cover":
            from .providers.copernicus_land_cover import CopernicusLandCoverAdapter

            return await CopernicusLandCoverAdapter(self.copernicus_land_cover_stac_url, self.database_engine).fetch(request)
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
        stored_count = await self._store(source_id, payload)
        return IngestionResult(source=source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload=payload)

    async def health(self, source_id: str) -> dict[str, Any]:
        source = SOURCE_REGISTRY.get(source_id)
        if source is None:
            raise KeyError(source_id)
        if source_id == "firms" and not self.firms_map_key:
            return {"source": source_id, "status": "not_configured"}
        if source_id == "india_hospitals" and not self.india_hospitals_api_key:
            return {"source": source_id, "status": "not_configured"}
        if source_id == "gpm_imerg" and not self.imerg_access_token:
            return {"source": source_id, "status": "not_configured"}
        if source.endpoint is None:
            return {"source": source_id, "status": "catalog_only", "endpoint": None}
        try:
            async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
                response = await client.head(source.endpoint)
                if response.status_code in {405, 403}:
                    response = await client.get(source.endpoint, params={"limit": 1})
                response.raise_for_status()
            return {"source": source_id, "status": "healthy", "http_status": response.status_code}
        except Exception as exc:  # noqa: BLE001 - health endpoint reports provider state
            return {"source": source_id, "status": "unavailable", "error": str(exc)}

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
