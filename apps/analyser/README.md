# AXIS Analyser

The AXIS Analyser is the backend emergency-analysis service. It supports a
deterministic local mode and a durable mode backed by PostgreSQL/PostGIS,
Redis Streams and S3-compatible object storage.

From the repository root:

```bash
npm run dev
```

The service is available at <http://localhost:8000>. Its health endpoint is
<http://localhost:8000/health>.

To start Uvicorn directly, run it from the analyser package directory (the
`app` package is located there):

```bash
uv run --directory apps/analyser uvicorn app.main:app --reload --port 8000
```

## Local durable setup

Start local PostgreSQL/PostGIS and Redis with:

```bash
docker compose up -d postgres redis
```

Copy `.env.example` to `.env` and set:

```env
AXIS_DATABASE_URL=postgresql+asyncpg://axis:axis@localhost:5432/axis
AXIS_REDIS_URL=redis://localhost:6379/0
```

The bundled PostGIS image is suitable for development. Use a PostgreSQL image
with pgvector enabled for production semantic search.

Database migrations use Alembic. Install the database extra and run:

```bash
python -m pip install -e '.[database]'
python scripts/migrate.py
```

`AXIS_AUTO_MIGRATE` defaults to `false`; production must run migrations as a
release step rather than changing the schema during application startup.
Alembic is authoritative; `app/db/schema.sql` is kept as a bootstrap reference.

Production must set `AXIS_ALLOW_IN_MEMORY_FALLBACK=false`; database and Redis
startup failures then fail the process instead of silently degrading to local
in-memory state.

The development launcher enables non-blocking live incident polling for USGS
earthquakes and GDACS alerts after PostgreSQL and Redis are ready. Configure it
with `AXIS_LIVE_DATA_ENABLED`, `AXIS_LIVE_DATA_POLL_SECONDS`, and
`AXIS_LIVE_DATA_MAX_ITEMS`. Provider failures are isolated and source/external
identities are recorded in `live_incident_keys` so repeated polls do not create
duplicate incidents.

Run migrations after every fresh deployment:

```bash
uv run python scripts/migrate.py
```

The current migration head is `0016_ingestion_idempotency`.

`/health/live` checks process liveness. `/health/ready` reports PostgreSQL
readiness and returns a degraded in-memory status during development when the
database is intentionally unavailable.

Satellite endpoints are available at:

- `POST /api/satellite/search` for Copernicus Sentinel catalog searches
- `POST /api/satellite/fires` for NASA FIRMS fire detections
- `POST /api/satellite/bhuvan/layer` for an ISRO Bhuvan WMS layer URL

The complete source registry is available at `GET /api/data/sources`. Public
API/feed sources can be fetched through `POST /api/data/{source_id}/fetch`.
Provider connectivity can be checked with `GET /api/data/health`; pass
`?source_id=usgs_earthquakes` to check one provider.
Large licensed/static datasets are intentionally represented as catalog URLs;
they should be downloaded into object storage or a geospatial ETL pipeline,
not inserted as binary blobs into PostgreSQL.

Required credentials/configuration:

- `AXIS_FIRMS_MAP_KEY`: free NASA FIRMS map key
- `AXIS_BHUVAN_WMS_URL`: the Bhuvan WMS endpoint/layer service selected for your use case
- Copernicus catalog search works through the configured catalog URL; authenticated imagery processing requires a CDSE client separately

## Object storage

Development uses the local filesystem:

```env
AXIS_OBJECT_STORAGE_BACKEND=local
AXIS_OBJECT_STORAGE_DIR=data/object-store
```

Production should use S3 or MinIO:

```env
AXIS_OBJECT_STORAGE_BACKEND=s3
AXIS_OBJECT_STORAGE_BUCKET=axis
AXIS_OBJECT_STORAGE_ENDPOINT=https://s3.example.com
AXIS_OBJECT_STORAGE_ACCESS_KEY=
AXIS_OBJECT_STORAGE_SECRET_KEY=
```

Install the optional storage dependency with `uv sync --extra storage`.

## Queue and realtime behavior

Analysis and ingestion jobs use Redis Streams consumer groups when
`AXIS_REDIS_URL` is configured. Jobs are acknowledged only after processing;
pending messages are reclaimed after worker failure, retried up to three times,
and written to a dead-letter stream after the final failure. Shutdown waits for
in-flight work before cancelling a worker.

The WebSocket endpoint is `/api/ws`. In production authenticate with either an
`X-API-Key` header or an `api_key` query parameter. Do not put long-lived keys
in browser URLs; prefer a short-lived gateway token for browser deployments.

## Frontend contract

The SvelteKit and Dioxus teams consume the same backend:

```text
REST:      http://localhost:8000
OpenAPI:   http://localhost:8000/docs
WebSocket: ws://localhost:8000/api/ws
```

Important endpoints include `/api/incidents/{id}`, `/api/jobs/analysis`,
`/api/data/{source_id}/jobs`, `/api/data/runs/{run_id}`,
`/api/incidents/{id}/decision-timeline` and
`/api/incidents/{id}/approvals`.
