"""Add ECMWF forecast asset catalog."""

from alembic import op

revision = "0006_ecmwf_assets"
down_revision = "0005_firms_active_fire"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS weather_forecast_assets (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        forecast_id TEXT NOT NULL,
        run_date TEXT NOT NULL,
        run_time INTEGER NOT NULL CHECK (run_time IN (0, 6, 12, 18)),
        step_hours INTEGER NOT NULL CHECK (step_hours >= 0),
        stream TEXT NOT NULL,
        product_type TEXT NOT NULL,
        model TEXT NOT NULL,
        resolution TEXT NOT NULL,
        parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
        object_uri TEXT NOT NULL,
        checksum_sha256 TEXT NOT NULL,
        byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
        content_type TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, forecast_id)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS weather_forecast_assets_run_idx ON weather_forecast_assets(run_date, run_time, step_hours)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS weather_forecast_assets CASCADE")
