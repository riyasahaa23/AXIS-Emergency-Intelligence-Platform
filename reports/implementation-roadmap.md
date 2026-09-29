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

## Next implementation phases

1. Authentication hardening: session rotation, CSRF protection, password reset
   boundaries, and security-focused integration tests.
2. Operator workflow: assignment, notes, incident actions, escalation, and
   audit timeline APIs.
3. Provider operations: health history, freshness thresholds, circuit
   breakers, and notification delivery adapters.
4. Response operations: tracked plans, resources, shelters, teams, and
   approval/export workflows.
5. Browser-level testing, observability, load testing, and production runbooks.

Each phase must pass backend tests, frontend type checks/tests, production
builds, and migration validation before it is committed and pushed.
