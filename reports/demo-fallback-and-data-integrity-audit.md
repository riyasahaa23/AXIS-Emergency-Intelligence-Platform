# Demo Fallback and Data Integrity Audit

Date: 2026-09-29

## Executive result

The project now has a real-first demo fallback for local development. If the backend, PostgreSQL, Redis, or live providers are unavailable, `npm run dev` can still start the frontend and display the static demo dataset.

Demo data is explicitly labelled `DEMO DATA` in the top bar and the tooltip identifies it as synthetic. Production builds do not enable the fallback.

This is a runtime continuity measure, not a guarantee that arbitrary frontend or backend code defects will be hidden. Compile errors, import errors, browser crashes, and incorrect successful API responses still require code fixes.

## How the fallback works

1. `scripts/dev-all.sh` attempts to start PostgreSQL, Redis, migrations, and the analyser API.
2. If those dependencies or the API are unavailable, the script continues with the frontend instead of exiting.
3. The local dev wrapper enables `VITE_ENABLE_MOCK_FALLBACK=true` by default.
4. The frontend tries the real API first.
5. Only when the API is unavailable does it use the static mock incidents and telemetry datasets.
6. The top bar reports one of these states:
   - `LIVE DATA`: the backend API responded successfully.
   - `DEMO DATA`: the real API is unavailable and synthetic data is being shown.
   - `BACKEND OFFLINE`: the backend is unavailable and fallback has been disabled.

## What it protects

| Failure | Demo frontend continues? | Notes |
|---|---:|---|
| Live provider timeout or outage | Yes | The backend can continue with persisted data; if the API is unavailable, frontend fallback is available. |
| PostgreSQL unavailable during local startup | Yes | The dev script continues to frontend demo mode. |
| Redis unavailable during local startup | Yes | The dev script continues to frontend demo mode. |
| Backend fails to start | Yes, for the frontend | The frontend can run in demo mode, but backend features remain unavailable. |
| Frontend compile/type/import error | No | This is a code/build failure, not a data-source outage. |
| Browser runtime crash before fallback loads | No | Requires a frontend fix. |
| Backend returns an incorrect HTTP 200 response | No | A healthy HTTP response cannot be distinguished from bad content by the current fallback. |

## Hallucination and data-integrity assessment

There is no generative AI model producing fallback incidents. The fallback consists of predetermined static mock records, so it does not hallucinate new facts at runtime.

However, synthetic data can still be misleading if it is presented as live. The current implementation addresses this by:

- using `DEMO DATA` instead of `LIVE DATA` when fallback is active;
- stating that the dataset is synthetic in the status tooltip;
- disabling fallback in production builds;
- clearing live-derived stores when fallback is disabled and the API cannot be reached.

The following are remaining transparency risks and should not be interpreted as independently observed live measurements:

- some `/api/telemetry` fields are static or estimated compatibility values, such as satellite totals, sensor totals, response-team counts, shelter counts, and resource percentages;
- incidents without provider coordinates can receive deterministic approximate coordinates based on region metadata;
- scenario, response, resource, and some analysis views intentionally use mock/demo datasets even when the backend is connected;
- `LIVE DATA` currently means that the backend API is connected. It does not mean every displayed field came directly from a live sensor.

These are data provenance limitations, not runtime language-model hallucinations.

## Manual verification

Restart the development process so the updated launcher is loaded:

```bash
npm run dev
```

With the backend unavailable, confirm that:

1. the frontend opens;
2. the top bar says `DEMO DATA`;
3. the tooltip says the dataset is synthetic;
4. incidents and telemetry remain visible.

After restoring the backend, click the data-status indicator or reload and confirm it changes to `LIVE DATA`.

To test strict behavior locally, run with:

```bash
VITE_ENABLE_MOCK_FALLBACK=false npm run dev
```

In that mode, an unavailable backend should show `BACKEND OFFLINE` and no synthetic incident/telemetry records.

## Conclusion

The fallback is suitable for a last-minute local demo when the data services fail, and it is clearly labelled to reduce the risk of presenting demo records as real incidents. It cannot rescue broken application code, and the telemetry/provenance caveats above should be addressed before treating the dashboard as an operational source of truth.
