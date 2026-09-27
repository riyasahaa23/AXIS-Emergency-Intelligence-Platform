"""Add incident aggregate versions and event ordering."""

from alembic import op

revision = "0009_incident_event_sourcing"
down_revision = "0008_india_hospitals"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1")
    op.execute("ALTER TABLE incident_events ADD COLUMN IF NOT EXISTS version INTEGER")
    op.execute(
        """UPDATE incident_events SET version = ordered.version
        FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY aggregate_id ORDER BY occurred_at, id) AS version
            FROM incident_events
        ) AS ordered
        WHERE incident_events.id = ordered.id AND incident_events.version IS NULL"""
    )
    op.execute("ALTER TABLE incident_events ALTER COLUMN version SET NOT NULL")
    op.execute("ALTER TABLE incident_events ADD CONSTRAINT incident_events_version_check CHECK (version >= 1)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS incident_events_aggregate_version_idx ON incident_events(aggregate_id, version)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS incident_events_aggregate_version_idx")
    op.execute("ALTER TABLE incident_events DROP CONSTRAINT IF EXISTS incident_events_version_check")
    op.execute("ALTER TABLE incident_events DROP COLUMN IF EXISTS version")
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS version")
