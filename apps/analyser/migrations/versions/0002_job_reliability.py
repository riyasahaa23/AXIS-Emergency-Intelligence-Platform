"""Add retry and idempotency fields to analysis jobs."""

from alembic import op

revision = "0002_job_reliability"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0")
    op.execute("ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE")


def downgrade() -> None:
    op.execute("ALTER TABLE analysis_jobs DROP COLUMN IF EXISTS idempotency_key")
    op.execute("ALTER TABLE analysis_jobs DROP COLUMN IF EXISTS attempts")
