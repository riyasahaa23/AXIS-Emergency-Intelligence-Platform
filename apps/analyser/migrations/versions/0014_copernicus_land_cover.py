"""Add Copernicus Dynamic Land Cover catalog and STAC assets."""

from alembic import op

revision = "0014_copernicus_land_cover"
down_revision = "0013_copernicus_ems"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS land_cover_products (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        product_id TEXT NOT NULL,
        collection_id TEXT NOT NULL,
        title TEXT NOT NULL,
        resolution TEXT NOT NULL,
        temporal_extent TEXT NOT NULL,
        spatial_extent TEXT NOT NULL DEFAULT 'global',
        access_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
        product_url TEXT NOT NULL,
        s3_path TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, product_id)
    )""")
    op.execute("""CREATE TABLE IF NOT EXISTS land_cover_assets (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        collection_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        observed_at TIMESTAMPTZ,
        bbox DOUBLE PRECISION[],
        assets JSONB NOT NULL DEFAULT '{}'::jsonb,
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, collection_id, item_id)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS land_cover_assets_observed_idx ON land_cover_assets(observed_at DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS land_cover_assets CASCADE")
    op.execute("DROP TABLE IF EXISTS land_cover_products CASCADE")
