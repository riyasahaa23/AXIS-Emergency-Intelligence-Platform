CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS sources (
    source_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    publisher TEXT NOT NULL,
    endpoint TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'partial', 'failed')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    fetched_count INTEGER NOT NULL DEFAULT 0,
    stored_count INTEGER NOT NULL DEFAULT 0,
    error TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS ingestion_runs_source_idx
    ON ingestion_runs(source_id, requested_at DESC);

CREATE TABLE IF NOT EXISTS raw_assets (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    ingestion_run_id TEXT REFERENCES ingestion_runs(id),
    object_uri TEXT NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    content_type TEXT,
    byte_size BIGINT,
    captured_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, checksum_sha256)
);

CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    location TEXT NOT NULL,
    severity DOUBLE PRECISION NOT NULL CHECK (severity BETWEEN 0 AND 100),
    exposure DOUBLE PRECISION NOT NULL CHECK (exposure BETWEEN 0 AND 100),
    population BIGINT NOT NULL DEFAULT 0 CHECK (population >= 0),
    vulnerability DOUBLE PRECISION NOT NULL CHECK (vulnerability BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'active',
    geom GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incidents_geom_idx ON incidents USING GIST (geom);

CREATE TABLE IF NOT EXISTS satellite_observations (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    collection TEXT,
    observation_id TEXT NOT NULL,
    captured_at TIMESTAMPTZ,
    cloud_cover DOUBLE PRECISION,
    bbox GEOMETRY(POLYGON, 4326),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    asset_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source, observation_id)
);

CREATE INDEX IF NOT EXISTS satellite_observations_bbox_idx
    ON satellite_observations USING GIST (bbox);

CREATE TABLE IF NOT EXISTS fire_detections (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    detected_at TIMESTAMPTZ,
    confidence TEXT,
    satellite TEXT,
    instrument TEXT,
    frp DOUBLE PRECISION,
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    raw JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fire_detections_geom_idx
    ON fire_detections USING GIST (geom);

CREATE TABLE IF NOT EXISTS incident_events (
    id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS analysis_jobs (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id),
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    current_stage TEXT NOT NULL DEFAULT 'queued',
    request JSONB NOT NULL DEFAULT '{}'::jsonb,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analysis_jobs_incident_idx
    ON analysis_jobs(incident_id, created_at DESC);

CREATE TABLE IF NOT EXISTS analysis_results (
    job_id TEXT PRIMARY KEY REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hazard_observations (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    external_id TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    observed_at TIMESTAMPTZ,
    confidence DOUBLE PRECISION CHECK (confidence BETWEEN 0 AND 1),
    geom GEOGRAPHY(GEOMETRY, 4326),
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, external_id, observed_at)
);

CREATE INDEX IF NOT EXISTS hazard_observations_geom_idx
    ON hazard_observations USING GIST (geom);

CREATE TABLE IF NOT EXISTS risk_scores (
    id BIGSERIAL PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id),
    score DOUBLE PRECISION NOT NULL CHECK (score BETWEEN 0 AND 100),
    confidence DOUBLE PRECISION CHECK (confidence BETWEEN 0 AND 1),
    factors JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approvals (
    id BIGSERIAL PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id),
    plan_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'rejected')),
    rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
    id BIGSERIAL PRIMARY KEY,
    request_id TEXT,
    actor TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    outcome TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_created_idx
    ON audit_events(created_at DESC);

CREATE TABLE IF NOT EXISTS semantic_memory (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding DOUBLE PRECISION[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_observations (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    external_id TEXT,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    payload JSONB NOT NULL,
    UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS external_observations_source_idx
    ON external_observations(source, observed_at DESC);
