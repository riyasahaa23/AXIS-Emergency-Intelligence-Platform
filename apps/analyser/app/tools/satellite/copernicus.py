from datetime import datetime
from typing import Any

import httpx

from .models import SatelliteSearchRequest, SatelliteSearchResult


class CopernicusProvider:
    """Catalog access for Sentinel observations through the CDSE STAC API."""

    def __init__(self, catalog_url: str, timeout: float = 30) -> None:
        self.catalog_url = catalog_url
        self.timeout = timeout

    async def search(self, request: SatelliteSearchRequest) -> SatelliteSearchResult:
        payload = {
            "bbox": request.bbox,
            "datetime": f"{request.start.isoformat()}/{request.end.isoformat()}",
            "collections": request.collections,
            "limit": request.limit,
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(self.catalog_url, json=payload)
            response.raise_for_status()
            data: dict[str, Any] = response.json()
        features = data.get("features", [])
        return SatelliteSearchResult(source="Copernicus Data Space", features=features, number_returned=len(features))


def iso_date(value: datetime) -> str:
    return value.isoformat().replace("+00:00", "Z")
