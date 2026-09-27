"""Add NOAA GHCNh hourly weather observations."""

from alembic import op

revision = "0012_ghcnh"
down_revision = "0011_ibtracs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS hourly_weather_observations (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        station_id TEXT NOT NULL,
        observed_at TIMESTAMPTZ NOT NULL,
        latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
        longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
        elevation_m DOUBLE PRECISION,
        temperature_c DOUBLE PRECISION,
        dew_point_c DOUBLE PRECISION,
        precipitation_mm DOUBLE PRECISION,
        wind_speed_mps DOUBLE PRECISION,
        wind_direction_deg DOUBLE PRECISION CHECK (wind_direction_deg BETWEEN 0 AND 360),
        relative_humidity_pct DOUBLE PRECISION CHECK (relative_humidity_pct BETWEEN 0 AND 100),
        quality JSONB NOT NULL DEFAULT '{}'::jsonb,
        geom GEOGRAPHY(POINT, 4326) NOT NULL,
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, station_id, observed_at)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS hourly_weather_observations_geom_idx ON hourly_weather_observations USING GIST (geom)")
    op.execute("CREATE INDEX IF NOT EXISTS hourly_weather_observations_time_idx ON hourly_weather_observations(observed_at DESC)")
    op.execute("CREATE INDEX IF NOT EXISTS hourly_weather_observations_station_idx ON hourly_weather_observations(station_id, observed_at DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS hourly_weather_observations CASCADE")
