"""Track source identities for idempotent live incident ingestion."""

from alembic import op


revision = "0017_live_incident_keys"
down_revision = "0016_ingestion_idempotency"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS live_incident_keys (
        source_id TEXT NOT NULL,
        external_id TEXT NOT NULL,
        incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (source_id, external_id)
    )""")
    op.execute("""CREATE INDEX IF NOT EXISTS live_incident_keys_incident_idx
        ON live_incident_keys(incident_id)""")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS live_incident_keys")
