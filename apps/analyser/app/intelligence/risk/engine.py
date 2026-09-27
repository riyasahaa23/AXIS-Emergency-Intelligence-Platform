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
        confidence = 0.9
        uncertainty = (1 - confidence) * 100
        return RiskAssessment(
            incident_id=incident.id,
            score=score,
            level=level,
            factors=factors,
            explanation=f"Risk is {level}; {strongest.name} is the largest contributing factor.",
            confidence=confidence,
            lower_bound=round(max(0, score - uncertainty), 2),
            upper_bound=round(min(100, score + uncertainty), 2),
            evidence=[{"type": "incident_input", "incident_id": incident.id, "version": incident.version}],
        )
