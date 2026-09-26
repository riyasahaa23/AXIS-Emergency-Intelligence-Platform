# AXIS backend architecture

The backend is organized around replaceable boundaries:

```text
API → orchestrator → deterministic domain services → verification
                         │
                         ├── in-memory repositories (local default)
                         ├── PostgreSQL/PostGIS/pgvector (optional)
                         ├── in-memory events (local default)
                         └── Redis Streams (optional)
```

External AI, geospatial, optimization, and voice providers are optional
adapters. They are never authoritative for safety-critical calculations.
