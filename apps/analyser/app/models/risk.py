from pydantic import BaseModel, Field


class RiskFactor(BaseModel):
    name: str
    value: float = Field(ge=0, le=100)
    weight: float = Field(gt=0, le=1)
    contribution: float = Field(ge=0, le=100)


class RiskAssessment(BaseModel):
    incident_id: str
    score: float = Field(ge=0, le=100)
    level: str
    factors: list[RiskFactor]
    explanation: str
