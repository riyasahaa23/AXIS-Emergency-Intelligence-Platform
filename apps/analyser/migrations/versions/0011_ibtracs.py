"""Add NOAA IBTrACS cyclone tracks and points."""

from alembic import op

revision = "0011_ibtracs"
down_revision = "0010_imerg"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS tropical_cyclones (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        storm_id TEXT NOT NULL,
        season INTEGER,
        basin TEXT,
        name TEXT,
        point_count INTEGER NOT NULL CHECK (point_count >= 0),
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, storm_id)
    )""")
    op.execute("""CREATE TABLE IF NOT EXISTS tropical_cyclone_points (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        storm_id TEXT NOT NULL,
        observed_at TIMESTAMPTZ NOT NULL,
        latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
        longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
        basin TEXT,
        nature TEXT,
        wind_kt DOUBLE PRECISION,
        pressure_mb DOUBLE PRECISION,
        geom GEOGRAPHY(POINT, 4326) NOT NULL,
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, storm_id, observed_at)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS tropical_cyclone_points_geom_idx ON tropical_cyclone_points USING GIST (geom)")
    op.execute("CREATE INDEX IF NOT EXISTS tropical_cyclone_points_time_idx ON tropical_cyclone_points(observed_at DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS tropical_cyclone_points CASCADE")
    op.execute("DROP TABLE IF EXISTS tropical_cyclones CASCADE")
