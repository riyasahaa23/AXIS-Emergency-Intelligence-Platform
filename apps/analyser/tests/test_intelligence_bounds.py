from app.intelligence.risk.engine import RiskEngine
from app.intelligence.risk.scoring import risk_level, score_factors
from app.models.incident import Incident
from app.models.risk import RiskFactor


def incident(**changes):
    return Incident(title="Test", hazard_type="flood", location="Zone", **changes)


def test_risk_bounds_are_valid_and_confidence_is_explicit():
    result = RiskEngine().assess(incident(severity=80, exposure=60, population=1000, vulnerability=40))
    assert 0 <= result.lower_bound <= result.score <= result.upper_bound <= 100
    assert result.confidence == 0.9
    assert result.evidence[0]["type"] == "incident_input"


def test_risk_is_monotonic_for_severity():
    engine = RiskEngine()
    lower = engine.assess(incident(severity=20, exposure=50, vulnerability=50)).score
    higher = engine.assess(incident(severity=80, exposure=50, vulnerability=50)).score
    assert higher > lower


def test_score_is_bounded_for_extreme_factors():
    factors = [RiskFactor(name="x", value=100, weight=1, contribution=100)]
    assert score_factors(factors) == 100
    assert risk_level(0) == "low"
    assert risk_level(100) == "critical"
