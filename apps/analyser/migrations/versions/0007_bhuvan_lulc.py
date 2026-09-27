"""Add Bhuvan/NRSC LULC product catalog."""

from alembic import op

revision = "0007_bhuvan_lulc"
down_revision = "0006_ecmwf_assets"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS lulc_products (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        product_id TEXT NOT NULL,
        scale TEXT NOT NULL,
        year TEXT NOT NULL,
        service_type TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        layer TEXT,
        title TEXT NOT NULL,
        access_policy TEXT NOT NULL DEFAULT 'public_catalog',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, product_id)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS lulc_products_scale_year_idx ON lulc_products(scale, year)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS lulc_products CASCADE")
