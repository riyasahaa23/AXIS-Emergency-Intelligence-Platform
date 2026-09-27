"""Add NASA GPM IMERG assets and precipitation observations."""

from alembic import op

revision = "0010_imerg"
down_revision = "0009_incident_event_sourcing"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS precipitation_assets (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        product_id TEXT NOT NULL,
        source_url TEXT NOT NULL,
        object_uri TEXT NOT NULL,
        checksum_sha256 TEXT NOT NULL,
        byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
        content_type TEXT,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, checksum_sha256)
    )""")
    op.execute("""CREATE TABLE IF NOT EXISTS precipitation_observations (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        external_id TEXT NOT NULL,
        observed_at TIMESTAMPTZ NOT NULL,
        latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
        longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
        precipitation_mm DOUBLE PRECISION NOT NULL,
        product_id TEXT NOT NULL,
        geom GEOGRAPHY(POINT, 4326) NOT NULL,
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, external_id)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS precipitation_observations_geom_idx ON precipitation_observations USING GIST (geom)")
    op.execute("CREATE INDEX IF NOT EXISTS precipitation_observations_time_idx ON precipitation_observations(observed_at DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS precipitation_observations CASCADE")
    op.execute("DROP TABLE IF EXISTS precipitation_assets CASCADE")
