from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.ingestion.models import IngestionRequest, IngestionResult


class LandCoverProduct(BaseModel):
    product_id: str
    collection_id: str
    title: str
    resolution: str
    temporal_extent: str
    spatial_extent: str = "global"
    access_methods: list[str] = Field(default_factory=list)
    product_url: str
    s3_path: str | None = None


class LandCoverAsset(BaseModel):
    collection_id: str
    item_id: str
    observed_at: datetime | None = None
    bbox: list[float] | None = None
    assets: dict[str, Any] = Field(default_factory=dict)
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class CopernicusLandCoverAdapter:
    source_id = "copernicus_land_cover"
    default_stac_url = "https://stac.dataspace.copernicus.eu/v1"
    product_page = "https://land.copernicus.eu/en/products/global-dynamic-land-cover"

    def __init__(self, stac_url: str = default_stac_url, database_engine=None, client: httpx.AsyncClient | None = None) -> None:
        self.stac_url = stac_url.rstrip("/")
        self.database_engine = database_engine
        self.client = client

    def catalog(self) -> list[LandCoverProduct]:
        return [
            LandCoverProduct(
                product_id="lc_global_100m_yearly_v3", collection_id="clms_lc_global_100m_yearly_v3",
                title="Global Dynamic Land Cover 100 m yearly V3", resolution="100 m",
                temporal_extent="2015-2019", access_methods=["OData", "STAC", "S3", "Browser", "CSV"],
                product_url=self.product_page,
                s3_path="/eodata/CLMS/landcover_landuse/dynamic_land_cover/lc_global_100m_yearly_v3",
            ),
            LandCoverProduct(
                product_id="lcm_global_10m_yearly_v1", collection_id="clms_lcm_global_10m_yearly_v1",
                title="Global Dynamic Land Cover 10 m yearly V1", resolution="10 m",
                temporal_extent="2020", access_methods=["OData", "STAC", "S3", "Browser", "CSV"],
                product_url="https://land.copernicus.eu/en/products/global-dynamic-land-cover/land-cover-2020-raster-10-m-global-annual",
                s3_path="/eodata/CLMS/landcover_landuse/dynamic_land_cover/lcm_global_10m_yearly_v1",
            ),
            LandCoverProduct(
                product_id="tcd_pantropical_10m_yearly_v1", collection_id="clms_tcd_pantropical_10m_yearly_v1",
                title="Pan-tropical Tree Cover Density 10 m yearly V1", resolution="10 m",
                temporal_extent="2020", spatial_extent="pan-tropical", access_methods=["OData", "STAC", "S3", "Browser"],
                product_url=self.product_page,
                s3_path="/eodata/CLMS/landcover_landuse/dynamic_land_cover/tcd_pantropical_10m_yearly_v1",
            ),
        ]

    @staticmethod
    def normalize_stac(payload: dict[str, Any]) -> list[LandCoverAsset]:
        features = payload.get("features", []) if isinstance(payload, dict) else []
        assets: list[LandCoverAsset] = []
        for feature in features:
            properties = feature.get("properties", {})
            timestamp = properties.get("datetime")
            observed_at = None
            if timestamp:
                observed_at = datetime.fromisoformat(str(timestamp))
                if observed_at.tzinfo is None:
                    observed_at = observed_at.replace(tzinfo=UTC)
            assets.append(LandCoverAsset(
                collection_id=str(feature.get("collection") or properties.get("collection", "unknown")),
                item_id=str(feature.get("id", "")), observed_at=observed_at,
                bbox=feature.get("bbox"), assets=feature.get("assets", {}), raw_payload=feature,
            ))
        return [item for item in assets if item.item_id]

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        operation = str(request.params.get("operation", "catalog")).lower()
        if operation == "catalog":
            products = self.catalog()
            stored_count = await self.store_products(products)
            return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"operation": operation, "products": [item.model_dump(mode="json") for item in products]})
        if operation != "stac":
            raise ValueError("Copernicus land-cover operation must be catalog or stac")
        params = {"limit": request.limit}
        for key in ("collections", "bbox", "datetime", "page"):
            if key in request.params:
                params[key] = request.params[key]
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=60, follow_redirects=True)
        try:
            response = await client.get(f"{self.stac_url}/search", params=params)
            response.raise_for_status()
            payload = response.json()
        finally:
            if owned_client:
                await client.aclose()
        assets = self.normalize_stac(payload)
        stored_count = await self.store_assets(assets)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"operation": operation, "count": len(assets), "context": payload.get("context", {})})

    async def store_products(self, products: list[LandCoverProduct]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'Copernicus Global Dynamic Land Cover', 'Copernicus Land Monitoring Service', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.product_page})
            for product in products:
                values = product.model_dump(mode="python")
                values.update({"source_id": self.source_id, "access_methods": json.dumps(product.access_methods)})
                await connection.execute(text("""INSERT INTO land_cover_products
                    (source_id, product_id, collection_id, title, resolution, temporal_extent,
                     spatial_extent, access_methods, product_url, s3_path)
                    VALUES (:source_id, :product_id, :collection_id, :title, :resolution, :temporal_extent,
                     :spatial_extent, CAST(:access_methods AS JSONB), :product_url, :s3_path)
                    ON CONFLICT (source_id, product_id) DO UPDATE SET collection_id=EXCLUDED.collection_id,
                     title=EXCLUDED.title, resolution=EXCLUDED.resolution, temporal_extent=EXCLUDED.temporal_extent,
                     access_methods=EXCLUDED.access_methods, product_url=EXCLUDED.product_url, s3_path=EXCLUDED.s3_path,
                     updated_at=now()"""), values)
        return len(products)

    async def store_assets(self, assets: list[LandCoverAsset]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'Copernicus Global Dynamic Land Cover', 'Copernicus Land Monitoring Service', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.product_page})
            for asset in assets:
                values = asset.model_dump(mode="python")
                values.update({"source_id": self.source_id, "assets": json.dumps(asset.assets, default=str), "raw_payload": json.dumps(asset.raw_payload, default=str)})
                await connection.execute(text("""INSERT INTO land_cover_assets
                    (source_id, collection_id, item_id, observed_at, bbox, assets, raw_payload)
                    VALUES (:source_id, :collection_id, :item_id, :observed_at,
                     CASE WHEN CAST(:bbox AS DOUBLE PRECISION[]) IS NULL THEN NULL ELSE CAST(:bbox AS DOUBLE PRECISION[]) END,
                     CAST(:assets AS JSONB), CAST(:raw_payload AS JSONB))
                    ON CONFLICT (source_id, collection_id, item_id) DO UPDATE SET observed_at=EXCLUDED.observed_at,
                     bbox=EXCLUDED.bbox, assets=EXCLUDED.assets, raw_payload=EXCLUDED.raw_payload"""), {
                    **values, "bbox": asset.bbox,
                })
        return len(assets)
