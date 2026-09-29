"""Add source provenance and freshness fields to incidents."""

from alembic import op


revision = "0020_incident_provenance"
down_revision = "0019_user_sessions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source_id TEXT")
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS external_id TEXT")
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION")
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS data_status TEXT NOT NULL DEFAULT 'live'")
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS observed_at TIMESTAMPTZ")
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ")
    op.execute("ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_data_status_check")
    op.execute("ALTER TABLE incidents ADD CONSTRAINT incidents_data_status_check CHECK (data_status IN ('live', 'estimated', 'simulated', 'fallback'))")
    op.execute("ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_confidence_check")
    op.execute("ALTER TABLE incidents ADD CONSTRAINT incidents_confidence_check CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 100)")
    op.execute("CREATE INDEX IF NOT EXISTS incidents_source_idx ON incidents(source_id, last_seen_at DESC)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS incidents_source_external_idx ON incidents(source_id, external_id) WHERE source_id IS NOT NULL AND external_id IS NOT NULL")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS incidents_source_external_idx")
    op.execute("DROP INDEX IF EXISTS incidents_source_idx")
    op.execute("ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_data_status_check")
    op.execute("ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_confidence_check")
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS last_seen_at")
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS observed_at")
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS data_status")
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS confidence")
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS external_id")
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS source_id")
