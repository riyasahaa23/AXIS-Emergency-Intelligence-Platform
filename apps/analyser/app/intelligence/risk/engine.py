from app.models.incident import Incident
from app.models.risk import RiskAssessment

from .factors import factors_for
from .scoring import risk_level, score_factors


class RiskEngine:
    def assess(self, incident: Incident) -> RiskAssessment:
        factors = factors_for(incident)
        score = score_factors(factors)
        level = risk_level(score)
        strongest = max(factors, key=lambda factor: factor.contribution)
        return RiskAssessment(
            incident_id=incident.id,
            score=score,
            level=level,
            factors=factors,
            explanation=f"Risk is {level}; {strongest.name} is the largest contributing factor.",
        )
