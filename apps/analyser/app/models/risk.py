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
    confidence: float = Field(default=0.9, ge=0, le=1)
    lower_bound: float = Field(default=0, ge=0, le=100)
    upper_bound: float = Field(default=100, ge=0, le=100)
    evidence: list[dict] = Field(default_factory=list)
