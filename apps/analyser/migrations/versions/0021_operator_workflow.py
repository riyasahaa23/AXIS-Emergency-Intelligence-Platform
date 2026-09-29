"""Add operator incident actions and in-app notifications."""

from alembic import op


revision = "0021_operator_workflow"
down_revision = "0020_incident_provenance"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS incident_actions (
            id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
            actor TEXT NOT NULL,
            action_type TEXT NOT NULL CHECK (action_type IN ('note', 'assign', 'escalate', 'acknowledge', 'status_change')),
            message TEXT NOT NULL DEFAULT '',
            assignee TEXT,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS incident_actions_incident_idx ON incident_actions(incident_id, created_at)")
    op.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            recipient TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
            incident_id TEXT REFERENCES incidents(id) ON DELETE CASCADE,
            read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON notifications(recipient, read, created_at DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS notifications")
    op.execute("DROP TABLE IF EXISTS incident_actions")
