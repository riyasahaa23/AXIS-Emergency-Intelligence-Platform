# AXIS

AXIS is a planetary emergency intelligence platform for incident monitoring,
risk analysis, scenario simulation, and response coordination.

## Project layout

- `apps/web` — SvelteKit operator cockpit with Three.js globe visualization.
- `apps/analyser` — FastAPI analysis service with ingestion, incident state,
  response planning, WebSockets, and optional durable services.
- `apps/native` — native client workspace.
- `docs` and `reports` — architecture, operations, audits, and implementation
  documentation.

## Run locally

Requirements: Node.js, npm, Python 3.12+, `uv`, and Docker/Podman Compose.

```bash
npm install
cp .env.example .env
npm run dev
```

The development launcher starts PostgreSQL/PostGIS and Redis, applies Alembic
migrations, and starts both applications:

- Web cockpit: <http://localhost:5180>
- API: <http://127.0.0.1:8000>
- API liveness: <http://127.0.0.1:8000/health/live>
- API readiness: <http://127.0.0.1:8000/health/ready>

If PostgreSQL or Redis is unavailable, the web app can run in clearly labelled
demo-data mode. Production should disable in-memory/demo fallbacks.

## Configuration

Use [.env.example](.env.example) for repository-wide defaults and
[apps/analyser/.env.example](apps/analyser/.env.example) for backend options.
Frontend variables are documented in [apps/web/.env.example](apps/web/.env.example).

Important production settings include:

- `AXIS_ENVIRONMENT=production`
- `AXIS_ALLOW_IN_MEMORY_FALLBACK=false`
- `AXIS_DATABASE_URL` for PostgreSQL
- `AXIS_REDIS_URL` for Redis Streams and realtime events
- API keys and provider credentials required by enabled data sources

## Development commands

```bash
npm run test       # Backend and frontend tests
npm run lint       # Ruff lint checks
npm run typecheck  # Mypy backend checks
npm run build      # Production build for both workspaces
```

Backend migrations can be run directly with:

```bash
uv run --directory apps/analyser alembic upgrade head
```

## Deployment

The repository includes Dockerfiles for the API and web app. Deployment
platforms must be configured with the required environment variables, database,
Redis, and object-storage settings. `render.yaml` was intentionally removed;
Render deployments therefore require equivalent Dashboard or infrastructure
configuration.

## Security

Never commit `.env` files, API keys, provider tokens, or production secrets.
Use authenticated API keys in production and configure explicit CORS origins.
