# Reference Project Live-Data Integration Audit

**Reference audited:** `/home/riya/Downloads/AXIS-Emergency-Intelligence-Platform`

**Scope:** Backend live incident ingestion, telemetry aggregation, database persistence, API exposure, and frontend consumption.

## Executive summary

The reference project uses two related live-data mechanisms:

1. A startup seeder in `apps/analyser/app/incident/seeder.py` fetches public agency feeds and creates incidents through the existing `IncidentManager`.
2. A separate telemetry endpoint in `apps/analyser/app/api/routes/telemetry.py` fetches/aggregates environmental observations and returns the dashboard telemetry contract.

The frontend consumes incidents through `/api/incidents` and telemetry through `/api/telemetry`. The visual dashboard therefore does not read provider APIs directly; it reads normalized backend responses.

The design is useful as a reference for provider coverage and UI contracts, but it should not be copied wholesale. Several values in the reference telemetry response are synthetic or static, and the reference PostgreSQL repository does not persist the richer coordinates and metadata passed by the seeder.

## 1. Startup and lifecycle

In `apps/analyser/app/main.py`, the application:

- creates a shared `httpx.AsyncClient` with redirects, connection limits, and a 60-second default timeout;
- initializes PostgreSQL and the incident store;
- starts the seeder with `asyncio.create_task(seed_real_incidents(...))`;
- initializes the generic ingestion service, worker, scheduler, jobs manager, and satellite service;
- registers the telemetry, incidents, satellite, data, communications, history, resources, response, and scenario routers.

The seeder runs as a background task, so the HTTP server can start before all external feeds finish. However, the task is not retained in an application task registry and is not explicitly cancelled during shutdown. There is also no periodic loop in this seeder; it is primarily a startup population step.

## 2. Live providers used by the reference

| Provider | Data | Seeder behavior | Persistence quality |
|---|---|---|---|
| NASA EONET | Wildfires, storms, volcanoes, floods | Fetches events and maps categories to hazard types | Incident row only; rich metadata is not retained by the repository |
| NOAA NWS | Severe/extreme weather alerts | Fetches active alerts, derives severity and area | Incident row only |
| Copernicus EMS | Rapid-mapping activations | Fetches activations, parses countries and WKT centroids | Incident row only |
| EMSC | Earthquakes | Fetches GeoJSON seismic events and magnitude | Incident row only |
| USGS | Earthquakes | Fetches GeoJSON earthquakes and estimates risk/exposure | Incident row only; source-specific earthquake tables exist separately |
| GDACS | Global disaster alerts | Fetches disaster features and alert levels | Incident row only; dedicated GDACS tables/providers also exist |
| ISRO/Bhuvan | Indian satellite/disaster context | Adds two fixed ISRO/DMSP operational records when no matching records exist | These are canonical seeded records, not a live API response |

The provider transformations calculate a common incident shape: title, hazard type, location, severity, exposure, population estimate, vulnerability, coordinates, source details, and an overview.

## 3. Seeder flow

The seeder follows this pattern for each provider:

1. Request the public endpoint with the shared HTTP client.
2. Check the HTTP status.
3. Parse the provider-specific payload.
4. Normalize the provider event into `IncidentCreate`.
5. Check a case-insensitive in-memory set of existing titles.
6. Call `await manager.create(incident)`.
7. Add the title to the set to avoid duplicates within that startup run.
8. Log and skip individual malformed records.

Each provider is isolated in its own `try/except`, so one provider outage does not abort the remaining feeds. If every source is unavailable and the database is empty, the seeder creates four fallback canonical incidents.

## 4. Database behavior

The reference database contains a broad ingestion schema in `app/db/schema.sql`, including:

- `sources` for provider catalog metadata;
- `ingestion_runs` for queued/running/completed/failed ingestion operations;
- `raw_assets` for source files and checksums;
- `incidents` for normalized operational incidents;
- `satellite_observations`, `fire_detections`, and source-specific observation tables;
- PostGIS `GEOGRAPHY`/`GEOMETRY` columns and spatial indexes;
- event sourcing, jobs, schedules, and idempotency structures.

The generic `SourceClient` and `IngestionService` provide a more durable ingestion workflow than the startup seeder: provider registry lookup, request metadata, run IDs, idempotency keys, status updates, event publishing, and source-specific adapters.

Important limitation: `PostgresIncidentRepository._incident()` and its `INSERT` statement persist only the base incident columns. Although the seeder passes `coords`, `country`, `region`, `details`, and `overview`, the repository does not write those fields into the incident row or reconstruct them when reading it. The frontend compensates by deriving defaults, which means the displayed coordinates are not reliably the provider coordinates.

## 5. Telemetry endpoint

The reference exposes `GET /api/telemetry` from `routes/telemetry.py`.

It computes incident aggregates from the incident store and performs two cached external observations with a 60-second TTL:

- Open-Meteo marine endpoint for wave and swell measurements;
- Open-Meteo air-quality endpoint for PM2.5, carbon monoxide, and ozone.

The response includes the frontend contract. For an empty incident store with default cached observation values, the shape is approximately:

```json
{
  "satellitesOnline": 18,
  "weatherFeedsStatus": "Live",
  "groundSensors": 3280,
  "dataSources": 25,
  "activeIncidents": 1,
  "highRisk": 1,
  "countriesAffected": 1,
  "peopleAffected": "4.2M",
  "responseTeams": 12,
  "activeShelters": 24,
  "criticalResourcesPct": 88
}
```

The exact runtime values are partly calculated and partly defaults. In particular:

- `satellitesOnline` is hardcoded to `18`;
- `dataSources` is the registry length, not the number of currently healthy providers;
- `groundSensors` is built from default buoy/gauge counts, a fixed `1700`, and incident count—not a live sensor inventory;
- `responseTeams`, `activeShelters`, and `criticalResourcesPct` use minimums/static values;
- when population is zero, `peopleAffected` falls back to `4.2M`.

Therefore the endpoint is a stable dashboard contract, but not a fully authoritative live telemetry inventory.

## 6. Frontend consumption

The reference frontend:

- calls `/api/telemetry` through `telemetryApi.ts`;
- calls `/api/incidents` through `incidentsApi.ts`;
- normalizes backend incidents into the richer `HazardIncident` UI model;
- derives missing geometry, impact, forecast, and response fields for visual continuity;
- falls back to mock data when the API is unavailable unless explicitly disabled;
- displays the feed state in the top bar as `LIVE DATA` or `FALLBACK DATA`.

The normalization layer is responsible for much of the screenshot-like presentation. It converts numeric severity into labels, derives coordinates when missing, creates map geometry around the point, formats population, and creates default operational details. This makes the UI resilient, but some displayed values are inferred rather than sourced from the live provider.

## 7. What should be adopted in our project

Recommended patterns to carry over:

- provider-specific adapters with isolated failure handling;
- one shared async HTTP client with explicit timeouts;
- normalized provider-to-incident conversion;
- persistent provider identity and deduplication keys;
- coordinates as first-class incident data;
- a dedicated telemetry endpoint matching the frontend contract;
- a cached environmental telemetry layer with short TTLs;
- explicit live/fallback status visible in the UI;
- ingestion-run metadata and provider health reporting.

Patterns that should not be copied unchanged:

- hardcoded satellite, sensor, response, and resource values presented as live;
- fallback incidents mixed into production live data without a source/status marker;
- title-only deduplication;
- startup-only seeding without a supervised refresh task;
- dropping coordinates and source metadata at the PostgreSQL repository boundary;
- frontend-generated coordinates that replace missing provider coordinates;
- copying the reference backend wholesale, because its model, routes, and persistence contracts differ from ours.

## Conclusion

The reference project’s strongest contribution is its provider coverage and normalized frontend contract. Its live-data experience is produced by a combination of real provider requests, a startup incident seeder, a cached telemetry endpoint, and frontend-derived display fields. The correct implementation strategy for our project is to retain the provider/adaptor ideas while keeping our existing database and route contracts, persisting coordinates/source identity, supervising refresh tasks, and marking inferred or fallback values explicitly.
