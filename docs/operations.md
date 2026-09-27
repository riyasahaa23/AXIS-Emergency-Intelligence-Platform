# AXIS Operations Runbook

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
