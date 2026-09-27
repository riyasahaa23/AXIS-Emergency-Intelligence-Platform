"""Add Copernicus EMS public activation records."""

from alembic import op

revision = "0013_copernicus_ems"
down_revision = "0012_ghcnh"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS copernicus_ems_activations (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        code TEXT NOT NULL,
        countries JSONB NOT NULL DEFAULT '[]'::jsonb,
        event_time TIMESTAMPTZ,
        name TEXT NOT NULL,
        centroid_latitude DOUBLE PRECISION CHECK (centroid_latitude BETWEEN -90 AND 90),
        centroid_longitude DOUBLE PRECISION CHECK (centroid_longitude BETWEEN -180 AND 180),
        activation_time TIMESTAMPTZ,
        category TEXT,
        last_update TIMESTAMPTZ,
        closed BOOLEAN NOT NULL DEFAULT FALSE,
        gdacs_id TEXT,
        area_of_interest_count INTEGER NOT NULL DEFAULT 0 CHECK (area_of_interest_count >= 0),
        product_count INTEGER NOT NULL DEFAULT 0 CHECK (product_count >= 0),
        geom GEOGRAPHY(POINT, 4326),
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, code)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS copernicus_ems_activations_geom_idx ON copernicus_ems_activations USING GIST (geom)")
    op.execute("CREATE INDEX IF NOT EXISTS copernicus_ems_activations_event_idx ON copernicus_ems_activations(event_time DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS copernicus_ems_activations CASCADE")
