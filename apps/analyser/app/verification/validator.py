from pydantic import BaseModel, Field


class VerificationResult(BaseModel):
    is_valid: bool
    confidence: float = Field(ge=0, le=1)
    warnings: list[str] = Field(default_factory=list)
    safety_flags: list[str] = Field(default_factory=list)


def validate_score(score: float) -> VerificationResult:
    warnings: list[str] = []
    if score < 0 or score > 100:
        warnings.append("Risk score is outside the permitted range.")
    return VerificationResult(is_valid=not warnings, confidence=1.0 if not warnings else 0.0, warnings=warnings)
