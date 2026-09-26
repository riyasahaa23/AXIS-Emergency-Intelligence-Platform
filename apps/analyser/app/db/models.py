"""Database model boundary.

The first local runtime uses the in-memory repository. SQLAlchemy models can be
added here without changing the API or service layer.
"""

TABLE_NAMES = ("incidents", "incident_events", "resources", "scenario_runs")
