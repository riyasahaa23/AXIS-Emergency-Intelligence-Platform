# AXIS Operations Runbook

Commands in this runbook are run from the repository root (`/home/riya/AXIS`).
If you are inside `apps/web` or `apps/analyser`, first run `cd ../..`.

## Production configuration

Set the following before starting the analyser:

```env
AXIS_ENVIRONMENT=production
AXIS_ALLOW_ANONYMOUS_DEMO=false
AXIS_ALLOW_IN_MEMORY_FALLBACK=false
AXIS_DATABASE_URL=postgresql+asyncpg://...
AXIS_REDIS_URL=redis://...
AXIS_API_KEY_READONLY=...
AXIS_API_KEY_OPERATOR=...
AXIS_API_KEY_ADMIN=...
```

Run migrations as a release step, before switching traffic:

```bash
uv run --directory apps/analyser python scripts/migrate.py
```

The service must pass both `/health/live` and `/health/ready` before it is
considered ready. `/metrics` exposes request counters and cumulative latency
in Prometheus text format.

Run a bounded concurrency smoke test after each deployment:

```bash
uv run --directory apps/analyser python scripts/load_test.py \
  --url https://api.example.com/health/live \
  --requests 200 --concurrency 20
```

The probe reports success count, status counts, average latency, and p95
latency. It exits non-zero if any request fails; it is a smoke test, not a
capacity certification.

From `apps/web`, use this equivalent path:

```bash
uv run --directory ../analyser python scripts/load_test.py \
  --url http://localhost:8000/health/live \
  --requests 1000 --concurrency 50
```

## PostgreSQL backup and restore

Backups must be encrypted and stored outside the database host. Run the
following from a trusted release/operations host:

```bash
pg_dump --format=custom --no-owner --file=axis-$(date -u +%Y%m%dT%H%M%SZ).dump "$AXIS_DATABASE_URL"
```

Restore into an empty database after validating the dump:

```bash
createdb axis_restore
pg_restore --clean --if-exists --no-owner --dbname="$AXIS_RESTORE_DATABASE_URL" axis-YYYYMMDDTHHMMSSZ.dump
```

After restore, run migrations and verify the current Alembic head:

```bash
uv run --directory apps/analyser alembic current
uv run --directory apps/analyser alembic heads
```

When running Compose outside the repository root, pass the root Compose file:

```bash
docker compose -f ../../docker-compose.yml ps
```

Redis is a queue/event transport, not the source of truth. A Redis loss must
not require restoring application data; pending jobs should be replayed from
durable PostgreSQL job records according to the deployment recovery procedure.

## Failure drills

- Stop PostgreSQL and verify production readiness returns `503`.
- Stop Redis and verify the process fails or is removed from service rather than
  silently switching to in-memory events.
- Kill a worker during a Redis-stream job and verify reclaim/retry behavior.
- Disable one provider and verify its health reports `unavailable` without
  converting the provider failure into a zero-valued hazard.
- Restore the latest database backup in an isolated environment quarterly.

## Monitoring and alerting

Configure the deployment platform or Prometheus to scrape `/metrics` and
probe `/health/live` and `/health/ready`. Alert on:

- `/health/live` failures or restart loops.
- `/health/ready` returning `503` in production.
- Any non-2xx API rate above the service's normal baseline.
- Request latency p95 and job queue age exceeding the agreed SLO.
- PostgreSQL connection exhaustion, Redis unavailable, and disk/object-store
  capacity thresholds.

Application logs include request IDs. Preserve those IDs in the log collector
and tracing system so an API request can be followed through audit events and
background jobs.

## Security and review boundary

Run the local Python dependency audit with:

```bash
uv run --directory apps/analyser pip-audit
```

CI performs Python dependency auditing, tracked-secret scanning, compilation,
unit tests, and frontend checks/builds. A production security assessment,
penetration test, independent architecture review, provider outage drill, and
rollback exercise still require an authorized staging/production environment
and an independent operator; they must not be simulated as completed by local
tests.
