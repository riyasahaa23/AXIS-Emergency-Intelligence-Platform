from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from pydantic import BaseModel, Field


class IncidentStatus(StrEnum):
    ACTIVE = "active"
    MONITORING = "monitoring"
    RESOLVED = "resolved"


class IncidentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    hazard_type: str = Field(min_length=1, max_length=100)
    location: str = Field(min_length=1, max_length=200)
    severity: float = Field(default=50, ge=0, le=100)
    exposure: float = Field(default=50, ge=0, le=100)
    population: int = Field(default=0, ge=0)
    vulnerability: float = Field(default=50, ge=0, le=100)


class IncidentUpdate(BaseModel):
    expected_version: int | None = Field(default=None, ge=1)
    status: IncidentStatus | None = None
    severity: float | None = Field(default=None, ge=0, le=100)
    exposure: float | None = Field(default=None, ge=0, le=100)
    population: int | None = Field(default=None, ge=0)
    vulnerability: float | None = Field(default=None, ge=0, le=100)


class Incident(IncidentCreate):
    id: str = Field(default_factory=lambda: f"INC-{uuid4().hex[:8].upper()}")
    status: IncidentStatus = IncidentStatus.ACTIVE
    version: int = Field(default=1, ge=1)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
