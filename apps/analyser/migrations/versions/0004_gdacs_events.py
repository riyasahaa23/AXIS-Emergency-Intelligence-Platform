"""Add normalized GDACS event storage."""

from alembic import op

revision = "0004_gdacs_events"
down_revision = "0003_usgs_earthquakes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""CREATE TABLE IF NOT EXISTS gdacs_events (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT NOT NULL REFERENCES sources(source_id),
        event_type TEXT NOT NULL,
        event_id TEXT NOT NULL,
        episode_id TEXT NOT NULL DEFAULT '',
        alert_level TEXT,
        name TEXT,
        country TEXT,
        observed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        geom GEOGRAPHY(GEOMETRY, 4326),
        raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (source_id, event_type, event_id, episode_id)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS gdacs_events_geom_idx ON gdacs_events USING GIST (geom)")
    op.execute("CREATE INDEX IF NOT EXISTS gdacs_events_observed_idx ON gdacs_events(observed_at DESC)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS gdacs_events CASCADE")
