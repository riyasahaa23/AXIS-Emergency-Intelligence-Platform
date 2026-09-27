import csv
import io

import httpx

from .models import FireDetection, FireSearchRequest


class FirmsProvider:
    """NASA FIRMS area query adapter. A free MAP_KEY is required by NASA."""

    base_url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

    def __init__(self, map_key: str, default_source: str = "VIIRS_NOAA20_NRT", timeout: float = 30) -> None:
        self.map_key = map_key
        self.default_source = default_source
        self.timeout = timeout

    async def fires(self, request: FireSearchRequest) -> list[FireDetection]:
        if not self.map_key:
            raise RuntimeError("AXIS_FIRMS_MAP_KEY is required for NASA FIRMS")
        bbox = ",".join(str(value) for value in request.bbox)
        url = f"{self.base_url}/{self.map_key}/{request.source or self.default_source}/{bbox}/{request.days}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url)
            response.raise_for_status()
        rows = csv.DictReader(io.StringIO(response.text))
        return [
            FireDetection(
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                detected_at=f"{row.get('acq_date', '')}T{row.get('acq_time', '')}",
                confidence=row.get("confidence"),
                satellite=row.get("satellite"),
                instrument=row.get("instrument"),
                frp=float(row["frp"]) if row.get("frp") else None,
            )
            for row in rows
            if row.get("latitude") and row.get("longitude")
        ]
