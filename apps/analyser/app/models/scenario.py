from pydantic import BaseModel, Field

from .risk import RiskAssessment


class ScenarioRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    severity_delta: float = Field(default=0, ge=-100, le=100)
    exposure_delta: float = Field(default=0, ge=-100, le=100)
    population_delta: int = Field(default=0, ge=-1_000_000)
    vulnerability_delta: float = Field(default=0, ge=-100, le=100)


class ScenarioComparison(BaseModel):
    scenario_name: str
    baseline: RiskAssessment
    projected: RiskAssessment
    score_delta: float
    interpretation: str
