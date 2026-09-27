from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class SourceDefinition(BaseModel):
    id: str
    name: str
    kind: Literal["api", "feed", "dataset"]
    priority: Literal["must_have", "should_have"]
    publisher: str
    endpoint: str | None = None
    requires_configuration: bool = False
    description: str


class IngestionRequest(BaseModel):
    params: dict[str, Any] = Field(default_factory=dict)
    query: str | None = None
    start: datetime | None = None
    end: datetime | None = None
    limit: int = Field(default=25, ge=1, le=100)
    idempotency_key: str | None = Field(default=None, max_length=200)


class IngestionResult(BaseModel):
    source: str
    fetched_at: datetime
    stored_count: int
    payload: Any
