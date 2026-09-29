from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from urllib.parse import urlencode

import httpx
from pydantic import BaseModel, Field

from app.ingestion.client import SourceNotConfigured
from app.ingestion.models import IngestionRequest, IngestionResult


class BhuvanLULCProduct(BaseModel):
    product_id: str
    scale: str
    year: str
    service_type: str
    endpoint: str
    layer: str | None = None
    title: str
    access_policy: str = "public_catalog"
    metadata: dict[str, Any] = Field(default_factory=dict)


class BhuvanAdapter:
    """Catalog and API adapter for official Bhuvan/NRSC LULC services.

    The public WMS/WMTS layers are catalogued without credentials. The
    authenticated thematic-statistics API is only called when the operator
    explicitly supplies an endpoint and token; undocumented endpoint paths are
    never guessed by the backend.
    """

    source_id = "bhuvan_lulc"
    default_wms = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
    default_wmts = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/gwc/service/wmts"

    def __init__(
        self,
        api_url: str,
        api_token: str = "",
        wms_url: str = default_wms,
        wmts_url: str = default_wmts,
        database_engine=None,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self.api_url = api_url.rstrip("/")
        self.api_token = api_token
        self.wms_url = wms_url or self.default_wms
        self.wmts_url = wmts_url or self.default_wmts
        self.database_engine = database_engine
        self.client = client

    def catalog(self) -> list[BhuvanLULCProduct]:
        products: list[BhuvanLULCProduct] = []
        for year in ("2005-06", "2011-12", "2015-16"):
            products.append(BhuvanLULCProduct(
                product_id=f"lulc-50k-{year}", scale="1:50000", year=year,
                service_type="wms", endpoint=self.wms_url,
                layer="lulc", title=f"Bhuvan LULC 1:50,000 ({year})",
                metadata={"wmts_endpoint": self.wmts_url},
            ))
        for numeric_year in range(2004, 2024):
            label = f"{numeric_year}-{str(numeric_year + 1)[-2:]}"
            products.append(BhuvanLULCProduct(
                product_id=f"lulc-250k-{label}", scale="1:250000", year=label,
                service_type="wms", endpoint="https://bhuvan-ras2.nrsc.gov.in/cgi-bin/LULC250K.exe",
                layer="lulc", title=f"Bhuvan LULC 1:250,000 ({label})",
            ))
        products.append(BhuvanLULCProduct(
            product_id="lulc-sisdp-10k", scale="1:10000", year="phase-2",
            service_type="catalog", endpoint="https://bhuvan-app1.nrsc.gov.in/2dresources/bhuvanstore2.php",
            title="Bhuvan SIS-DP LULC 1:10,000 (phase 2)",
        ))
        return products

    async def fetch(self, request: IngestionRequest) -> IngestionResult:
        operation = str(request.params.get("operation", "catalog")).lower()
        if operation == "catalog":
            products = self.catalog()
            stored_count = await self.store(products)
            return IngestionResult(
                source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count,
                payload={"operation": operation, "products": [item.model_dump(mode="json") for item in products]},
            )
        if operation == "capabilities":
            return await self.fetch_capabilities()
        if operation == "statistics":
            return await self.fetch_statistics(request)
        raise ValueError("Bhuvan operation must be catalog, capabilities, or statistics")

    async def fetch_capabilities(self) -> IngestionResult:
        url = f"{self.wms_url}?{urlencode({'service': 'WMS', 'request': 'GetCapabilities'})}"
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=60, follow_redirects=True)
        try:
            response = await client.get(url)
            response.raise_for_status()
            content = response.text
        finally:
            if owned_client:
                await client.aclose()
        return IngestionResult(
            source=self.source_id, fetched_at=datetime.now(UTC), stored_count=0,
            payload={"operation": "capabilities", "url": url, "content_type": response.headers.get("content-type", "application/xml"), "xml": content},
        )

    async def fetch_statistics(self, request: IngestionRequest) -> IngestionResult:
        endpoint = request.params.get("endpoint")
        if not self.api_token:
            raise SourceNotConfigured("Bhuvan thematic statistics requires AXIS_BHUVAN_API_TOKEN")
        if not endpoint:
            raise ValueError("Bhuvan statistics requires params.endpoint from the published API contract")
        params = {key: value for key, value in request.params.items() if key not in {"operation", "endpoint"}}
        owned_client = self.client is None
        client = self.client or httpx.AsyncClient(timeout=60, follow_redirects=True)
        try:
            response = await client.get(endpoint, params=params, headers={"Authorization": f"Bearer {self.api_token}"})
            response.raise_for_status()
            payload = response.json()
        finally:
            if owned_client:
                await client.aclose()
        stored_count = await self.store_statistics(endpoint, payload)
        return IngestionResult(source=self.source_id, fetched_at=datetime.now(UTC), stored_count=stored_count, payload={"operation": "statistics", "endpoint": endpoint, "data": payload})

    async def store(self, products: list[BhuvanLULCProduct]) -> int:
        if self.database_engine is None:
            return 0
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO sources (source_id, name, publisher, endpoint)
                VALUES (:source_id, 'Bhuvan LULC and Thematic APIs', 'ISRO/NRSC', :endpoint)
                ON CONFLICT (source_id) DO NOTHING"""), {"source_id": self.source_id, "endpoint": self.api_url})
            for product in products:
                values = product.model_dump(mode="python")
                import json
                await connection.execute(text("""INSERT INTO lulc_products
                    (source_id, product_id, scale, year, service_type, endpoint, layer, title, access_policy, metadata)
                    VALUES (:source_id, :product_id, :scale, :year, :service_type, :endpoint, :layer, :title, :access_policy, CAST(:metadata AS JSONB))
                    ON CONFLICT (source_id, product_id) DO UPDATE SET endpoint=EXCLUDED.endpoint,
                    layer=EXCLUDED.layer, title=EXCLUDED.title, metadata=EXCLUDED.metadata"""), {
                    **values, "source_id": self.source_id, "metadata": json.dumps(values["metadata"]),
                })
        return len(products)

    async def store_statistics(self, endpoint: str, payload: Any) -> int:
        if self.database_engine is None:
            return 0
        import json

        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("""INSERT INTO external_observations (source, external_id, payload)
                VALUES (:source, :external_id, CAST(:payload AS JSONB))
                ON CONFLICT (source, external_id) DO UPDATE SET payload=EXCLUDED.payload, observed_at=now()"""), {
                "source": self.source_id, "external_id": f"statistics:{endpoint}", "payload": json.dumps(payload, default=str),
            })
        return 1
