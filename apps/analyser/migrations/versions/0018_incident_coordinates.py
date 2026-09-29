"""Store provider coordinates on incidents for live map rendering."""

from alembic import op

revision = "0018_incident_coordinates"
down_revision = "0017_live_incident_keys"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION CHECK (latitude BETWEEN -90 AND 90)")
    op.execute("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180)")


def downgrade() -> None:
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS latitude")
    op.execute("ALTER TABLE incidents DROP COLUMN IF EXISTS longitude")
