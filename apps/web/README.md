# AXIS — Planetary Emergency Intelligence System (Web Client)

The operational web command interface for **AXIS** (Planetary Emergency Intelligence System), built with SvelteKit, TypeScript, Tailwind CSS, Three.js WebGL rendering, and WebSockets.

---

## 1. Architectural Architecture & Principles

```
apps/web/
├── src/
│   ├── app.html              # CSP & security headers, fonts, dark theme
│   ├── routes/
│   │   ├── +page.svelte      # Master Command Cockpit with Deep-Linking
│   │   └── +layout.svelte    # Global layout container
│   ├── lib/
│   │   ├── api/              # Modular backend services with safe fallback
│   │   │   ├── client.ts     # apiFetch, health probe & fallback resolver
│   │   │   ├── incidentsApi.ts
│   │   │   ├── scenariosApi.ts
│   │   │   └── telemetryApi.ts
│   │   ├── websocket/        # Resilient real-time WebSocket client
│   │   │   └── socketService.ts
│   │   ├── stores/           # Reactive Svelte stores (single-source-of-truth)
│   │   │   ├── incidentStore.ts
│   │   │   ├── scenarioStore.ts
│   │   │   ├── systemStore.ts
│   │   │   ├── resourceStore.ts
│   │   │   ├── commsStore.ts
│   │   │   └── commandStore.ts
│   │   ├── three/            # WebGL 3D Globe with strict lifecycle cleanup
│   │   │   └── GlobeView.svelte
│   │   ├── mock/             # High-fidelity fallback scenarios & datasets
│   │   └── components/       # Modular C2 workstations
│   │       ├── analysis/     # Multi-hazard intelligence engine
│   │       ├── incidents/    # Live incident explorer & telemetry
│   │       ├── scenarios/    # What-if simulation center
│   │       ├── response/     # Tactical response coordination
│   │       ├── resources/    # Logistics and deployment maps
│   │       ├── communications/# Mesh communications & broadcast
│   │       └── cockpit/      # Sci-fi HUD overlay frame
```

---

## 2. Key Modules & Workstations

| Section | Route Hash | Purpose |
| :--- | :--- | :--- |
| **Global View** | `/#` or `/#global` | 3D Interactive WebGL Earth, orbital satellites, incident telemetry & AI voice HUD |
| **Incidents** | `/#incidents` | Multi-hazard incident database, interactive sector map, population impact charts |
| **Analysis** | `/#analysis` | Multi-hazard cascade intelligence, flood/seismic telemetry, compound risk scoring |
| **Scenarios** | `/#scenarios` | What-if simulation engine, parameter sensitivity controls, D+1 to D+7 timeline modeling |
| **Response** | `/#response` | Incident action planning, evacuation zoning, resource allocation |
| **Resources** | `/#resources` | Staging bases, logistics deployment map, supply pipeline tracking |
| **Comms** | `/#comms` | Emergency radio/satellite mesh networks, broadcast distribution |
| **History** | `/#history` | Timeline replay of planetary incidents and tactical decisions |

---

## 3. Autonomous Mock Fallback Architecture

AXIS implements an **always-available, fail-safe architecture**. The application automatically probes the FastAPI backend (`http://localhost:8000/health`) with a 1.2-second timeout:
- **Backend Online (`REAL_API`)**: Telemetry and incidents stream live from PostGIS / FastAPI with WebSocket updates (`ws://localhost:8000/api/ws`).
- **Backend Offline (`SIMULATED_MOCK`)**: Local development can fall back to high-fidelity, physics-informed mock scenarios. Production builds disable this fallback by default and expose the backend as unavailable instead of presenting synthetic data as live.

---

## 4. WebGL Memory Lifecycle & Teardown

`GlobeView.svelte` enforces strict WebGL resource management to prevent GPU memory leaks across route transitions and re-renders:
- Cancels active `requestAnimationFrame` loop.
- Unregisters all DOM and window event listeners (`resize`, `pointerdown`, `pointermove`, `pointerup`, `wheel`).
- Traverses the Three.js scene graph, disposing geometries, materials, and canvas textures.
- Calls `renderer.dispose()` and `renderer.forceContextLoss()`.

---

## 5. Security Posture

- **Content Security Policy (CSP)**: Strict origin control restricting script, style, font, and WebSocket execution.
- **X-Content-Type-Options**: Enforced `nosniff`.
- **Referrer Policy**: `strict-origin-when-cross-origin`.
- **Accessible ARIA Standards**: 0 Svelte compiler accessibility warnings; all modals, controls, and canvas visualizers include ARIA labels and keyboard navigation handlers.

---

## 6. Testing

AXIS Web uses **Vitest** for fast unit and contract verification:

```bash
# Run unit and contract tests
npm run test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- Incident data normalization (`normalizeIncident`)
- Deterministic scenario calculation models (`calculateScenarioResults`)
- Base API client fallback and probe caching (`apiFetch`, `probeBackend`)
- WebSocket client subscriptions and lifecycle (`socketService`)

---

## 7. Development & Production Build

```bash
# Start local development server
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## 8. Docker Deployment

```bash
# Build production Docker image
docker build -f apps/web/Dockerfile -t axis-web .

# Run container
docker run -p 5180:5180 axis-web
```
