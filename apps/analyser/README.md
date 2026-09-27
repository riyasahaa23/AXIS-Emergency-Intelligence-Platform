# AXIS Analyser

The AXIS Analyser is the backend emergency-analysis service. The current local
runtime uses deterministic engines and in-memory storage so it can run without
PostgreSQL, Redis, Ollama, external APIs, or frontend integration.

From the repository root:

```bash
npm run dev
```

The service is available at <http://localhost:8000>. Its health endpoint is
<http://localhost:8000/health>.

## Real data services

Start local PostgreSQL/PostGIS and Redis with:

```bash
docker compose up -d postgres redis
```

The database schema is in `app/db/schema.sql`. Set `AXIS_DATABASE_URL` and
`AXIS_REDIS_URL` in your environment when enabling persistent repositories and
Redis Streams. The bundled PostGIS image uses a portable array for embeddings;
use a custom PostgreSQL image with `pgvector` and migrate that column to
`VECTOR(1536)` for production semantic search.

Database migrations use Alembic. Install the database extra and run:

```bash
python -m pip install -e '.[database]'
python scripts/migrate.py
```

`AXIS_AUTO_MIGRATE` defaults to `false`; production must run migrations as a
release step rather than changing the schema during application startup.

`/health/live` checks process liveness. `/health/ready` reports PostgreSQL
readiness and returns a degraded in-memory status during development when the
database is intentionally unavailable.

Satellite endpoints are available at:

- `POST /api/satellite/search` for Copernicus Sentinel catalog searches
- `POST /api/satellite/fires` for NASA FIRMS fire detections
- `POST /api/satellite/bhuvan/layer` for an ISRO Bhuvan WMS layer URL

The complete source registry is available at `GET /api/data/sources`. Public
API/feed sources can be fetched through `POST /api/data/{source_id}/fetch`.
Large licensed/static datasets are intentionally represented as catalog URLs;
they should be downloaded into object storage or a geospatial ETL pipeline,
not inserted as binary blobs into PostgreSQL.

Required credentials/configuration:

- `AXIS_FIRMS_MAP_KEY`: free NASA FIRMS map key
- `AXIS_BHUVAN_WMS_URL`: the Bhuvan WMS endpoint/layer service selected for your use case
- Copernicus catalog search works through the configured catalog URL; authenticated imagery processing requires a CDSE client separately
