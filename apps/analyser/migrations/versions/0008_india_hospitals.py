"""Add normalized India Hospital Directory records."""

from alembic import op

revision = "0008_india_hospitals"
down_revision = "0007_bhuvan_lulc"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS hospitals (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        external_id TEXT NOT NULL,
        name TEXT NOT NULL,
        state TEXT,
        district TEXT,
        address TEXT,
        category TEXT,
        systems_of_medicine TEXT,
        pin_code TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        specializations TEXT,
        latitude DOUBLE PRECISION CHECK (latitude BETWEEN -90 AND 90),
        longitude DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180),
        geom GEOGRAPHY(POINT, 4326),
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, external_id)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS hospitals_geom_idx ON hospitals USING GIST (geom)")
    op.execute("CREATE INDEX IF NOT EXISTS hospitals_state_district_idx ON hospitals(state, district)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS hospitals CASCADE")
