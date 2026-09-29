# AXIS Production Feature Roadmap

Status: in progress

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

## Next implementation phases

1. Authentication email verification/password reset delivery boundaries.
2. Provider health history, freshness thresholds, and external notification
   delivery adapters.
3. Response resources, shelters, teams, and approval/export workflows.
4. Browser-level testing, observability dashboards, load testing, and
   production runbooks.

Each phase must pass backend tests, frontend type checks/tests, production
builds, and migration validation before it is committed and pushed.
