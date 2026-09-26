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
