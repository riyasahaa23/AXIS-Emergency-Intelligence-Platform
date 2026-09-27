"""Create the initial AXIS database schema."""

from pathlib import Path

from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    schema_path = Path(__file__).resolve().parents[2] / "app" / "db" / "schema.sql"
    statements = [part.strip() for part in schema_path.read_text().split(";") if part.strip()]
    for statement in statements:
        op.execute(statement)


def downgrade() -> None:
    for table in (
        "audit_events", "approvals", "risk_scores", "hazard_observations",
        "analysis_results", "analysis_jobs", "incident_events", "raw_assets",
        "ingestion_runs", "sources", "external_observations", "semantic_memory",
        "fire_detections", "satellite_observations", "incidents",
    ):
        op.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
