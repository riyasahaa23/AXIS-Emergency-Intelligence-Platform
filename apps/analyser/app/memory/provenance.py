from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class ProvenanceRecord(BaseModel):
    source: str = Field(min_length=1)
    detail: str = Field(min_length=1)
    checksum: str | None = None
    observed_at: datetime | None = None
    freshness_status: str = "unknown"
    metadata: dict[str, Any] = Field(default_factory=dict)


def provenance(source: str, detail: str, **metadata: Any) -> dict[str, Any]:
    record = ProvenanceRecord(source=source, detail=detail, metadata=metadata)
    return {**record.model_dump(mode="json"), "recorded_at": datetime.now(UTC).isoformat()}
