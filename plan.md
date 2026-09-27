# AXIS — Backend Architecture Review and Implementation Plan

Status: backend foundation in progress
Scope: Python/FastAPI backend, data platform, intelligence engines, workers and contracts
Out of scope: SvelteKit/TypeScript and Dioxus/Rust client implementation

## 1. Executive decision

AXIS has a credible capstone/prototype domain model, but it is not yet an MVP backend. The domain folders exist and several deterministic components work, while persistence, provider adapters, queue durability, authentication, observability, provenance and deployment controls are incomplete.

The implementation remains one modular Python backend. We will not create a microservice swarm. The backend follows a gateway-and-modules pattern inspired by the Vitalis MCP architecture:

```text
Client (SvelteKit / Dioxus)
        |
REST + WebSocket gateway
        |
Auth -> request context -> validation -> rate limit -> audit/timing
        |
Command / query / job controllers
        |
Domain modules and deterministic tools
        |
PostgreSQL/PostGIS/pgvector + Redis Streams + object storage
```

The LLM may interpret missions, select typed tools and explain results. It may not calculate or invent hazard scores, geometry, capacities, routes or safety decisions.

## 2. Strict current review

Scores reflect the repository as inspected, not the intended architecture.

| Category | Score | Review |
|---|---:|---|
| Code Quality | 5.5/10 | Modules are small and mostly focused, but error handling, typing and production boundaries are inconsistent. `app/ingestion/client.py` is a generic JSON sink rather than source-specific production adapters. |
| Code Readability | 6.5/10 | Names and folders are clear. The architecture is easy to locate, but runtime wiring in `app/main.py` and fallback behavior are implicit rather than documented through interfaces. |
| Implementation Quality | 4.5/10 | Risk, impact, scenarios and optimization have useful beginnings. The current job manager is in-memory, ingestion is not normalized per provider, and several advertised features are placeholders or optional packages only. |
| Architecture & Design | 6/10 | The incident-centered design is correct and the deterministic/LLM separation is strong. Missing gateway, module lifecycle, durable job model, provider contracts and command/query separation prevent production confidence. |
| Performance & Optimization | 4.5/10 | Redis and background work are planned, but the active queue is `asyncio.Queue`; provider calls use per-request HTTP clients; there is no connection pooling policy, caching, backpressure, bulk ingestion strategy or raster execution plan. |
| Security | 3.5/10 | API keys are blank, which is correct for source control, but the API currently has no authentication, scope model, request identity, rate limiting or production fail-closed startup rule. External payloads are persisted without a validation/quarantine boundary. |
| Testing Quality | 4.5/10 | The eight tests cover basic health, analysis, scenarios, events and a satellite normalizer. There are no provider contract tests, auth tests, database migration tests, queue retry tests, replay tests, security tests or deterministic scenario fixtures. |
| Documentation | 6/10 | `README.md`, architecture notes and this plan provide useful direction. The API contract, configuration matrix, operational runbook, provenance policy and failure semantics need to be executable and versioned. |
| Scalability | 4/10 | PostgreSQL/PostGIS and Redis are appropriate choices, but persistence is incomplete and the current in-memory jobs/events cannot survive restarts or support multiple workers. No idempotency, deduplication, leases or dead-letter queue is implemented. |
| DevOps Practices | 4/10 | Docker Compose exists and compilation/tests run. There is no migration command, CI quality gate, image hardening, health/readiness split, structured logs, metrics, backup policy or deployment manifest. |
| User Experience | 5.5/10 | The planned job status, WebSocket and explainable results are good. UX cannot be dependable until stale data, partial provider failure, confidence, approval state and actionable error codes are returned consistently. |

### Overall score: 4.9/10

### Maturity: Prototype, approaching structured MVP

It is not production-ready. It can demonstrate domain logic locally, but it cannot yet safely operate as a multi-user emergency decision-support backend.

### Top strengths

1. Correct central concept: `IncidentState` is the operational object.
2. Good separation between deterministic Python computation and LLM orchestration.
3. Sensible domain decomposition: risk, impact, graph, scenarios, response and optimization.
4. PostgreSQL/PostGIS, Redis Streams and object storage are appropriate choices.
5. Provider registry and provenance are already recognized as first-class concerns.
6. The repository already has testable building blocks rather than one monolithic script.

### Biggest weaknesses

1. The generic ingestion implementation does not yet implement the actual USGS, GDACS, ECMWF, FIRMS, Bhuvan, IMERG, IBTrACS, GHCNh, EMS and hospital contracts.
2. The job queue is process-local and loses work/results on restart.
3. There is no API gateway security model comparable to Vitalis's authentication, scopes, audit and stable error behavior.
4. The database schema is not yet the complete source of truth for jobs, observations, provenance, scenarios, resources and approvals.
5. The test suite validates happy paths, not operational failure, safety and replay behavior.

### Critical fixes

- Add production authentication, scopes, request IDs, rate limits and stable error codes.
- Replace generic ingestion with typed adapters, validation, source-specific normalization and idempotent upserts.
- Move jobs/events from in-memory implementations to Redis Streams plus durable PostgreSQL job records.
- Add migrations, readiness checks, provider health checks, structured logs and metrics.
- Add provenance, data freshness and uncertainty to every result.
- Add human approval boundaries before any consequential recommendation/action.
- Add deterministic scenario fixtures and contract tests for every provider adapter.

## 3. Target backend modules

```text
apps/analyser/app/
├── api/                 HTTP/WebSocket gateway and controllers
├── auth/                API keys, JWT option, scopes and request identity
├── core/                settings, errors, logging, IDs, lifecycle
├── health/              liveness, readiness and upstream checks
├── ingestion/           typed provider adapters and normalization
├── jobs/                durable job model, queue publisher and workers
├── incident/            IncidentState, event application and replay
├── intelligence/        risk, impact, uncertainty and hazard graph
├── scenarios/           cloned state, modifications and comparison
├── response/            response plans and approval requirements
├── optimization/        OR-Tools allocation and constraints
├── memory/              provenance, audit, retrieval and embeddings
├── storage/             object storage and raster catalog
├── tools/               typed deterministic tools used by orchestrator
├── orchestrator/        PydanticAI/Ollama mission planning
├── verification/        schema, evidence, safety and confidence checks
├── voice/               faster-whisper and Piper adapters
├── models/              Pydantic domain contracts
└── db/                  SQLAlchemy models, repositories and migrations
```

## 4. Data architecture

PostgreSQL is the source of truth. PostGIS stores points, lines, polygons and spatial indexes. pgvector stores embeddings only after the source record and provenance are persisted.

```text
sources, ingestion_runs, raw_assets
incidents, incident_events, incident_snapshots
hazards, observations, forecasts
earthquakes, active_fire_detections
cyclones, cyclone_track_points
weather_stations, weather_observations
lulc_products, lulc_statistics
ems_activations, ems_products
hospitals, shelters, roads, resources
analysis_jobs, analysis_results
risk_scores, impact_results, scenarios
response_plans, approvals, audit_events
```

Redis Streams provide event delivery between API, workers and WebSocket subscribers. Redis is also used for short-lived caching and rate-limit counters. S3/MinIO stores original and derived GRIB2, BUFR, NetCDF, HDF, GeoTIFF, Parquet, shapefile archives and reports.

## 5. Provider adapter contract

Every provider must implement a common interface:

```python
class ProviderAdapter(Protocol):
    source_id: str

    async def health(self, ...) -> ProviderHealth: ...
    async def fetch(self, request: FetchRequest) -> FetchBatch: ...
    def normalize(self, payload: bytes | dict) -> list[NormalizedObservation]: ...
```

Rules:

- Use one shared `httpx.AsyncClient` with timeout, retry and connection limits.
- Validate payloads before database writes.
- Record raw payload checksum and source timestamp.
- Upsert using `(source_id, external_id, observed_at)`.
- Preserve source fields in `raw_payload` JSONB.
- Mark stale, partial, unavailable and invalid data explicitly.
- Never convert provider failure into zero hazard.

Adapters: `usgs.py`, `gdacs.py`, `ecmwf.py`, `firms.py`, `bhuvan.py`, `imerg.py`, `ibtracs.py`, `ghcnh.py`, `copernicus_ems.py` and `hospitals_india.py`.

## 6. Ordered implementation plan

Each phase is completed and tested before the next phase begins.

### Phase 1 — Gateway and runtime foundation

Typed settings, blank secrets in examples, request IDs, stable error envelopes, API-key authentication, scopes (`read`, `analyse`, `simulate`, `recommend`, `approve`, `admin`), liveness/readiness, timing, audit hooks, shared HTTP client lifecycle and CI gates.

Gate: unauthenticated production requests fail closed; development tests remain deterministic.

### Phase 2 — Database source of truth

Alembic migrations, SQLAlchemy models, PostGIS indexes, durable job/ingestion/provenance/audit tables, repository interfaces, transaction boundaries and test fixtures.

Gate: clean creation and repeated migration/replay work without corruption.

### Phase 3 — Durable jobs and events

Redis Streams, consumer groups, PostgreSQL job state, retries/backoff, idempotency keys, dead-letter stream, progress events, WebSocket subscriptions and graceful SIGTERM shutdown.

Gate: killing/restarting a worker does not silently lose or duplicate a job.

### Phase 4 — Verified data adapters

Implement and test in this order: USGS, GDACS, FIRMS, ECMWF, Bhuvan LULC, India hospitals, IMERG, IBTrACS, GHCNh and Copernicus EMS. Each adapter receives sanitized fixtures, opt-in live tests, freshness checks and provenance tests.

Gate: disabling one provider does not break AXIS; partial failure is visible to callers.

### Phase 5 — Incident State Engine

Versioned aggregate, observation reducers, event-sourced timeline, optimistic version checks, replay and evidence index.

Gate: replay produces the same state hash as the live sequence.

### Phase 6 — Intelligence engines

Explainable risk fusion, confidence/uncertainty propagation, GeoPandas/Shapely impact overlays, NetworkX dependency graph and deterministic scenario fixtures.

Gate: bounds, monotonicity, missing-input and geometry tests pass.

### Phase 7 — Scenarios and counterfactuals

Clone baseline state, apply typed modifications, recalculate, compare and measure intervention deltas without mutating the live incident.

Gate: identical inputs are deterministic and baseline state is unchanged.

### Phase 8 — Response planning and optimization

Typed mission-to-task planner, capacity/route constraints, OR-Tools allocation, recommendation/approval separation and audit records.

Gate: impossible assignments are rejected and no execute capability exists without explicit authorization.

### Phase 9 — Orchestration, memory and voice

One PydanticAI planning agent, typed tools, Ollama adapter, provenance-aware explanations, pgvector retrieval, faster-whisper and Piper interfaces.

Gate: the agent only calls registered tools and cannot directly write risk/result tables.

### Phase 10 — Operations and release

Hardened Docker image, deployment manifest, secrets, readiness/upstream health checks, metrics, backups, restore runbook, migration/rollback procedure and load/failure/security tests.

Gate: clean deployment, restored backup and provider outage drill all pass.

## 7. Required API contract

```text
GET  /health/live
GET  /health/ready
GET  /api/v1/sources
GET  /api/v1/sources/{source_id}/health
POST /api/v1/incidents
GET  /api/v1/incidents/{id}
GET  /api/v1/incidents/{id}/timeline
GET  /api/v1/incidents/{id}/evidence
POST /api/v1/jobs/analysis
GET  /api/v1/jobs/{id}
GET  /api/v1/jobs/{id}/result
POST /api/v1/scenarios
GET  /api/v1/scenarios/{id}
POST /api/v1/plans/{id}/approve
GET  /api/v1/resources
WS   /api/v1/incidents/{id}/stream
```

Stable errors: `AUTH_DENIED`, `SCOPE_DENIED`, `VALIDATION_FAILED`, `SOURCE_UNAVAILABLE`, `STALE_DATA`, `JOB_NOT_FOUND`, `INCIDENT_NOT_FOUND`, `CONSTRAINT_VIOLATION` and `APPROVAL_REQUIRED`.

## 8. Evaluation suite

Create deterministic Urban Flood, Cyclone, Earthquake, Wildfire and Compound Flood/Heat scenarios. Measure provider normalization, risk bounds/monotonicity, geometry correctness, uncertainty, optimizer violations, replay determinism, queue retry/idempotency, auth/scope enforcement, outage behavior and end-to-end latency.

## 9. Definition of done

AXIS is MVP-ready only when it has durable jobs, migrations, authenticated APIs, source-specific adapters, provenance, replay, deterministic intelligence, approval boundaries, operational health checks and passing contract/scenario tests. A folder tree or local happy-path request is not completion.
