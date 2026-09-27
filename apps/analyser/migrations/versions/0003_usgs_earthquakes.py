"""Add normalized USGS earthquake storage."""

from alembic import op

revision = "0003_usgs_earthquakes"
down_revision = "0002_job_reliability"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS earthquakes (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        external_id TEXT NOT NULL,
        magnitude DOUBLE PRECISION,
        place TEXT,
        observed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        status TEXT,
        event_type TEXT,
        depth_km DOUBLE PRECISION,
        url TEXT,
        geom GEOGRAPHY(POINT, 4326) NOT NULL,
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, external_id)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS earthquakes_geom_idx ON earthquakes USING GIST (geom)")
    op.execute("CREATE INDEX IF NOT EXISTS earthquakes_observed_idx ON earthquakes(observed_at DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS earthquakes CASCADE")
