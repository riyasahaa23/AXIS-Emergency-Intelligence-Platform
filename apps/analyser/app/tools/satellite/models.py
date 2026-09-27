from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SatelliteSearchRequest(BaseModel):
    bbox: list[float] = Field(min_length=4, max_length=4)
    start: datetime
    end: datetime
    collections: list[str] = Field(default_factory=lambda: ["sentinel-1-grd"])
    limit: int = Field(default=10, ge=1, le=100)


class FireSearchRequest(BaseModel):
    bbox: list[float] = Field(min_length=4, max_length=4)
    days: int = Field(default=1, ge=1, le=10)
    source: str | None = None


class SatelliteLayerRequest(BaseModel):
    layer: str
    bbox: list[float] = Field(min_length=4, max_length=4)
    width: int = Field(default=1024, ge=64, le=4096)
    height: int = Field(default=1024, ge=64, le=4096)


class FireDetection(BaseModel):
    latitude: float
    longitude: float
    detected_at: str | None = None
    confidence: str | float | None = None
    satellite: str | None = None
    instrument: str | None = None
    frp: float | None = None
    source: str = "NASA FIRMS"


class SatelliteSearchResult(BaseModel):
    source: str
    features: list[dict[str, Any]]
    number_returned: int
