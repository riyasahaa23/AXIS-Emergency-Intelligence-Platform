"""Add ingestion idempotency keys."""

from alembic import op

revision = "0016_ingestion_idempotency"
down_revision = "0015_ingestion_schedules"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE ingestion_runs ADD COLUMN IF NOT EXISTS idempotency_key TEXT")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ingestion_runs_idempotency_idx ON ingestion_runs(source_id, idempotency_key) WHERE idempotency_key IS NOT NULL")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ingestion_runs_idempotency_idx")
    op.execute("ALTER TABLE ingestion_runs DROP COLUMN IF EXISTS idempotency_key")
