from app.models.risk import RiskFactor


def score_factors(factors: list[RiskFactor]) -> float:
    return round(min(sum(factor.contribution for factor in factors), 100), 2)


def risk_level(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 50:
        return "high"
    if score >= 25:
        return "moderate"
    return "low"
