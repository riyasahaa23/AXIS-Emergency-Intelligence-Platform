"""Persist response recommendations and execution status."""

from alembic import op


revision = "0022_response_plans"
down_revision = "0021_operator_workflow"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS response_plans (
            plan_id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'recommendation_only',
            plan JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS response_plans_incident_idx ON response_plans(incident_id, created_at DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS response_plans")
