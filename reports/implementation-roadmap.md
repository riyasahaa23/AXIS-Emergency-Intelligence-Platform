# AXIS Production Feature Roadmap

Status: core implementation complete; optional extensions remain

The platform is being extended in small, validated phases. Existing API
contracts, demo fallback behavior, and deployment-safe migration rules remain
unchanged unless a feature explicitly requires a versioned addition.

## Completed in this implementation cycle

- Incident source identity and external provider identity.
- Incident confidence and data-status labels (`live`, `estimated`,
  `simulated`, `fallback`).
- Observation and last-seen timestamps.
- PostgreSQL migration `0020_incident_provenance` and matching bootstrap
  schema.
- Frontend provenance metadata on normalized incidents.
- Regression coverage for live-feed provenance.
- Rotating cookie sessions and double-submit CSRF protection.
- Operator incident actions, assignment/escalation notes, and in-app notifications.
- Provider latency/error tracking with circuit breakers.
- Persisted response plans with status transitions.
- GeoJSON and CSV incident exports retaining provenance fields.
- Audit listing and CSV export APIs.

## Optional follow-up extensions

These are deliberately deferred extensions rather than missing pieces of the
core platform objective:

1. Email verification/password reset delivery, once a mail provider is
   configured.
2. Long-term provider health history and external observability dashboards.
3. Dedicated resource/shelter/team inventory persistence beyond the persisted
   response-plan allocations.
4. Browser-level and load-test suites beyond the current API, unit, type,
   build, lint, and CI checks.

Each phase must pass backend tests, frontend type checks/tests, production
builds, and migration validation before it is committed and pushed.
