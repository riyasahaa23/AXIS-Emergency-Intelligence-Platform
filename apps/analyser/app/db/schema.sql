-- Optional PostgreSQL schema for AXIS deployments.
-- Enable these extensions before applying the schema:
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL,
    severity DOUBLE PRECISION NOT NULL CHECK (severity BETWEEN 0 AND 100),
    exposure DOUBLE PRECISION NOT NULL CHECK (exposure BETWEEN 0 AND 100),
    population INTEGER NOT NULL CHECK (population >= 0),
    vulnerability DOUBLE PRECISION NOT NULL CHECK (vulnerability BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS incident_events (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS incident_events_incident_id_idx ON incident_events(incident_id);
