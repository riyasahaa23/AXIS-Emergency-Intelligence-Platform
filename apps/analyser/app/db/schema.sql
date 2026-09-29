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
    idempotency_key TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS ingestion_runs_idempotency_idx
    ON ingestion_runs(source_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

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
    latitude DOUBLE PRECISION CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180),
    source_id TEXT,
    external_id TEXT,
    confidence DOUBLE PRECISION CHECK (confidence BETWEEN 0 AND 100),
    data_status TEXT NOT NULL DEFAULT 'live' CHECK (data_status IN ('live', 'estimated', 'simulated', 'fallback')),
    observed_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active',
    version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
    geom GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incidents_geom_idx ON incidents USING GIST (geom);
CREATE INDEX IF NOT EXISTS incidents_source_idx ON incidents(source_id, last_seen_at DESC);

CREATE TABLE IF NOT EXISTS live_incident_keys (
    source_id TEXT NOT NULL,
    external_id TEXT NOT NULL,
    incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS live_incident_keys_incident_idx
    ON live_incident_keys(incident_id);

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

CREATE TABLE IF NOT EXISTS active_fire_detections (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    external_id TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    brightness DOUBLE PRECISION,
    bright_t31 DOUBLE PRECISION,
    frp DOUBLE PRECISION,
    confidence TEXT,
    satellite TEXT,
    instrument TEXT,
    acq_date TIMESTAMPTZ,
    daynight TEXT,
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS active_fire_detections_geom_idx ON active_fire_detections USING GIST (geom);
CREATE INDEX IF NOT EXISTS active_fire_detections_time_idx ON active_fire_detections(acq_date DESC);

CREATE TABLE IF NOT EXISTS weather_forecast_assets (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    forecast_id TEXT NOT NULL,
    run_date TEXT NOT NULL,
    run_time INTEGER NOT NULL CHECK (run_time IN (0, 6, 12, 18)),
    step_hours INTEGER NOT NULL CHECK (step_hours >= 0),
    stream TEXT NOT NULL,
    product_type TEXT NOT NULL,
    model TEXT NOT NULL,
    resolution TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
    object_uri TEXT NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
    content_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, forecast_id)
);

CREATE INDEX IF NOT EXISTS weather_forecast_assets_run_idx
    ON weather_forecast_assets(run_date, run_time, step_hours);

CREATE TABLE IF NOT EXISTS lulc_products (
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
);

CREATE INDEX IF NOT EXISTS lulc_products_scale_year_idx ON lulc_products(scale, year);

CREATE TABLE IF NOT EXISTS hospitals (
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
);

CREATE INDEX IF NOT EXISTS hospitals_geom_idx ON hospitals USING GIST (geom);
CREATE INDEX IF NOT EXISTS hospitals_state_district_idx ON hospitals(state, district);

CREATE TABLE IF NOT EXISTS precipitation_assets (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    product_id TEXT NOT NULL,
    source_url TEXT NOT NULL,
    object_uri TEXT NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
    content_type TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, checksum_sha256)
);

CREATE TABLE IF NOT EXISTS precipitation_observations (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    external_id TEXT NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    precipitation_mm DOUBLE PRECISION NOT NULL,
    product_id TEXT NOT NULL,
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS precipitation_observations_geom_idx ON precipitation_observations USING GIST (geom);
CREATE INDEX IF NOT EXISTS precipitation_observations_time_idx ON precipitation_observations(observed_at DESC);

CREATE TABLE IF NOT EXISTS tropical_cyclones (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    storm_id TEXT NOT NULL,
    season INTEGER,
    basin TEXT,
    name TEXT,
    point_count INTEGER NOT NULL CHECK (point_count >= 0),
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, storm_id)
);

CREATE TABLE IF NOT EXISTS tropical_cyclone_points (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    storm_id TEXT NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    basin TEXT,
    nature TEXT,
    wind_kt DOUBLE PRECISION,
    pressure_mb DOUBLE PRECISION,
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, storm_id, observed_at)
);

CREATE INDEX IF NOT EXISTS tropical_cyclone_points_geom_idx ON tropical_cyclone_points USING GIST (geom);
CREATE INDEX IF NOT EXISTS tropical_cyclone_points_time_idx ON tropical_cyclone_points(observed_at DESC);

CREATE TABLE IF NOT EXISTS hourly_weather_observations (
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
);

CREATE INDEX IF NOT EXISTS hourly_weather_observations_geom_idx ON hourly_weather_observations USING GIST (geom);
CREATE INDEX IF NOT EXISTS hourly_weather_observations_time_idx ON hourly_weather_observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS hourly_weather_observations_station_idx ON hourly_weather_observations(station_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS copernicus_ems_activations (
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
);

CREATE INDEX IF NOT EXISTS copernicus_ems_activations_geom_idx ON copernicus_ems_activations USING GIST (geom);
CREATE INDEX IF NOT EXISTS copernicus_ems_activations_event_idx ON copernicus_ems_activations(event_time DESC);

CREATE TABLE IF NOT EXISTS land_cover_products (
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
);

CREATE TABLE IF NOT EXISTS land_cover_assets (
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
);

CREATE INDEX IF NOT EXISTS land_cover_assets_observed_idx ON land_cover_assets(observed_at DESC);

CREATE TABLE IF NOT EXISTS ingestion_schedules (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    interval_seconds INTEGER NOT NULL CHECK (interval_seconds BETWEEN 60 AND 31536000),
    params JSONB NOT NULL DEFAULT '{}'::jsonb,
    "limit" INTEGER NOT NULL DEFAULT 25 CHECK ("limit" BETWEEN 1 AND 100),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    next_run_at TIMESTAMPTZ NOT NULL,
    last_run_id TEXT,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ingestion_schedules_due_idx ON ingestion_schedules(enabled, next_run_at);

CREATE TABLE IF NOT EXISTS incident_events (
    id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    version INTEGER NOT NULL CHECK (version >= 1),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS incident_events_aggregate_version_idx
    ON incident_events(aggregate_id, version);

CREATE TABLE IF NOT EXISTS analysis_jobs (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id),
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    current_stage TEXT NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    idempotency_key TEXT UNIQUE,
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

CREATE TABLE IF NOT EXISTS earthquakes (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(source_id),
    external_id TEXT NOT NULL,
    magnitude DOUBLE PRECISION,
    place TEXT,
    observed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    status TEXT,
    event_type TEXT,
    depth_km DOUBLE PRECISION,
    url TEXT,
    geom GEOGRAPHY(POINT, 4326) NOT NULL,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS earthquakes_geom_idx ON earthquakes USING GIST (geom);
CREATE INDEX IF NOT EXISTS earthquakes_observed_idx ON earthquakes(observed_at DESC);

CREATE TABLE IF NOT EXISTS gdacs_events (
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
);

CREATE INDEX IF NOT EXISTS gdacs_events_geom_idx ON gdacs_events USING GIST (geom);
CREATE INDEX IF NOT EXISTS gdacs_events_observed_idx ON gdacs_events(observed_at DESC);

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

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expiry_idx ON user_sessions(expires_at);

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
