"""Database model boundary.

The first local runtime uses the in-memory repository. SQLAlchemy models can be
added here without changing the API or service layer.
"""

TABLE_NAMES = (
    "sources",
    "ingestion_runs",
    "raw_assets",
    "incidents",
    "incident_events",
    "analysis_jobs",
    "analysis_results",
    "hazard_observations",
    "risk_scores",
    "approvals",
    "audit_events",
)
