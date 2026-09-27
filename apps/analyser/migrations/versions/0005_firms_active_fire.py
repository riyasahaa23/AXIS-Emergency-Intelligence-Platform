"""Add normalized NASA FIRMS active-fire storage."""

from alembic import op

revision = "0005_firms_active_fire"
down_revision = "0004_gdacs_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS active_fire_detections (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        external_id TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
        longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
        brightness DOUBLE PRECISION,
        bright_t31 DOUBLE PRECISION,
        frp DOUBLE PRECISION,
        confidence TEXT,
        satellite TEXT,
        instrument TEXT,
        acq_date TIMESTAMPTZ,
        daynight TEXT,
        geom GEOGRAPHY(POINT, 4326) NOT NULL,
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, external_id)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS active_fire_detections_geom_idx ON active_fire_detections USING GIST (geom)")
    op.execute("CREATE INDEX IF NOT EXISTS active_fire_detections_time_idx ON active_fire_detections(acq_date DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS active_fire_detections CASCADE")
