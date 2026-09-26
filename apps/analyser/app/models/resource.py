from pydantic import BaseModel, Field


class Resource(BaseModel):
    id: str
    kind: str
    available: int = Field(ge=0)
    capacity: int = Field(default=0, ge=0)


class ResourceAllocation(BaseModel):
    resource_id: str
    requested: int = Field(ge=0)
    allocated: int = Field(ge=0)
    unmet: int = Field(ge=0)
