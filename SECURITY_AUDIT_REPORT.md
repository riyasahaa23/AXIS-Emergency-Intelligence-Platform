# AXIS Security and Operations Validation Report

Date: 2026-09-28

## Results

- Tracked-secret scan: passed. No AWS access-key, GitHub token, or private-key
  patterns were found by the repository scan.
- Python dependency audit: passed. `uv run pip-audit` reports no known
  vulnerabilities in PyPI dependencies; the local `axis-analyser` package is
  skipped because it is not published on PyPI.
- Web dependency audit: 9 findings remain: 3 low, 5 moderate, and 1 high;
  there are no critical findings. The remaining findings are in development
  tooling and the current Vite/SvelteKit compatibility range. `npm audit
  fix --force` was not applied because npm reports breaking upgrades.
- Web checks: `svelte-check` passed with 0 errors and 0 warnings.
- Web tests: 16 tests passed.
- Web production build: passed with `adapter-node`.
- API load test: 1,000/1,000 requests succeeded at concurrency 50.

## Database and Redis drills

Using `docker compose -f ../../docker-compose.yml` from `apps/web`:

- PostgreSQL stopped: readiness became degraded.
- PostgreSQL restarted: readiness returned healthy.
- Redis stopped: readiness became degraded.
- Redis restarted: readiness returned healthy.

The development API returns HTTP 200 with a degraded payload during dependency
loss. Production mode is configured to return HTTP 503 instead.

## Backup and restore

A custom-format PostgreSQL backup was created, restored into a temporary
`axis_restore_codex` database, queried successfully, and the temporary database
was dropped. The restored `incidents` table contained 135 rows.

## Correct command locations

Run repository-level operational commands from `/home/riya/AXIS`. From
`apps/web`, use `uv run --directory ../analyser ...` for analyser scripts and
`docker compose -f ../../docker-compose.yml ...` for Compose commands.
