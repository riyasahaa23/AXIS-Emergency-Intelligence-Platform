"""Add persistent provider ingestion schedules."""

from alembic import op

revision = "0015_ingestion_schedules"
down_revision = "0014_copernicus_land_cover"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS ingestion_schedules (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        interval_seconds INTEGER NOT NULL CHECK (interval_seconds BETWEEN 60 AND 31536000),
        params JSONB NOT NULL DEFAULT '{}'::jsonb,
        "limit" INTEGER NOT NULL DEFAULT 25 CHECK ("limit" BETWEEN 1 AND 100),
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        next_run_at TIMESTAMPTZ NOT NULL,
        last_run_id TEXT,
        last_error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS ingestion_schedules_due_idx ON ingestion_schedules(enabled, next_run_at)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS ingestion_schedules CASCADE")
