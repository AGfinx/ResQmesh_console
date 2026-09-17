# ResQMesh Product Requirements Document

> **Repository reality baseline:** commit `cda5bea` on `main`, inspected 2026-09-16. This document separates the product vision from the behavior that exists in the checked-in frontend. The repository README is the concise developer-facing summary; this document provides the product and gap analysis behind it.

## 1. Product vision

**ResQMesh is intended to be an emergency SOS and disaster-response operating environment that keeps citizens, control-room staff, responders, resources, alerts, and simulated robotic assets coordinated when ordinary connectivity is degraded.** Its intended user value is a single operational picture: an SOS or incident can become a triaged record, be assigned to a team, be tracked through a response lifecycle, communicated to stakeholders, and included in reporting.

The present repository is a **browser-only frontend demonstration of that vision**, not a deployable emergency network. It uses seeded Pune-centered mock data, React pages, Zustand stores, and local browser state. Online, mesh, and offline modes are represented by local UI state and timers; no radio, backend, identity provider, durable cloud synchronization, or hardware integration is present.

## 2. Users and jobs to be done

| User | Intended job | Current repository behavior |
|---|---|---|
| Administrator / control room | Monitor incidents, teams, alerts, resources, reports, analytics, and settings | Shared operations dashboard over local mock state |
| Responder | View operational data, team context, resources, medical support, and alerts | Responder-specific sidebar navigation; route authorization is incomplete |
| Citizen / field user | Send an SOS with type and description, including under degraded connectivity | SOS form is available in the shared shell; no separate citizen product surface exists |
| Demo operator / evaluator | Generate incidents, SOS events, connectivity changes, and resolution events | Floating simulation controls and `/simulation` page |

## 3. Feature taxonomy

### Core features currently implemented

| Capability | User value | Current implementation | Status |
|---|---|---|---|
| Demo persona selection | Lets an evaluator enter as a seeded user | `src/pages/LoginPage.tsx` selects from `src/data/users.ts`; selected ID is stored locally | **Demo-only** |
| Routed application shell | Provides navigation and lazy-loaded feature views | `src/App.tsx`, `ProtectedRoute`, `src/layouts/AppLayout.tsx` | **Implemented, not production access control** |
| Incident register | Shows seeded incidents and supports local creation, selection, assignment, and status updates | `src/stores/incidentStore.ts` and incident pages | **Implemented in memory** |
| Incident lifecycle | Makes response progress visible from reported through resolved/closed or cancelled | `STATUS_TRANSITIONS` and `IncidentDetailsPage` | **Implemented as client-side transitions** |
| Team assignment | Associates a team with an incident and marks the team assigned | `incidentStore.assignTeam` plus `teamStore.assignTeamToIncident` | **Implemented, without atomic transaction/rollback** |
| SOS workflow | Captures emergency type/description and displays sending, sent, relay, queued, or acknowledged states | Sidebar modal, `sosStore`, and timers | **Simulated** |
| Connectivity simulation | Cycles Online → Mesh → Offline → Online | `meshStore` and simulation controls | **Simulated labels/state** |
| Alerts center | Adds, reads, broadcasts, removes, and clears local alert records | `alertStore`, alerts page, dashboard | **Implemented in memory** |
| Team/resource/medical views | Provides operational views over seeded entities | Domain stores and routed pages | **UI and local state** |
| Map and analytics | Visualizes seeded geography and metrics | Leaflet/React Leaflet and Recharts pages | **Implemented with mock data** |
| Reports and activity logs | Displays local reports and seeded/activity-store records | `reportStore`, reports page, dashboard | **Partially event-derived; dashboard timeline remains illustrative** |
| Communication | Shows seeded team messages and supports local message composition | `communicationStore` and communication page | **Implemented in memory** |
| Settings persistence | Saves application preferences in the browser | `settingsStore` using `localStorage` | **Partially persistent** |
| Responsive shell and design system | Provides navigation, cards, status badges, toast feedback, and mobile layout behavior | Tailwind, shared UI components, CSS tokens | **Implemented** |

### Secondary or presentation features

| Capability | Current status |
|---|---|
| Floating simulation console | Demo-only controls; not a production operator console |
| AI recommendation / “Simulation & AI” | UI and seeded copy exist; no recommendation algorithm, model call, or ranked-team service is wired |
| Drone/robotics controls | Represented by seeded resources and UI language; no device integration or telemetry |
| CAP alerting | Alert records resemble emergency notifications; no CAP serialization, validation, or distribution |
| Mesh metrics and sync queue | Store fields and local transitions exist; no network adapter, durable outbox, or entity reconciliation |

## 4. User journey maps

### 4.1 Control-room incident response

1. Open the app. `src/main.tsx` mounts `App` in `StrictMode`.
2. `App` reads `useAuthStore`; the current implementation defaults to the first mock user and `isAuthenticated: true`, so the dashboard is normally reachable without sign-in.
3. If the user visits `/login`, `LoginPage` invokes `authStore.login(userId)`, stores the selected ID in `localStorage`, and navigates to `/dashboard`.
4. `App` renders `AppLayout`, containing `Sidebar`, `TopBar`, the routed `Outlet`, and `SimulationPanel`.
5. The dashboard derives KPIs, active incidents, alerts, and user information directly from Zustand selectors.
6. The operator opens an incident at `/incidents/:id`; the page reads the current incident and teams from their stores.
7. The operator selects a legal next status from `STATUS_TRANSITIONS`, or opens team assignment.
8. Assignment updates the incident store and team store separately, then shows a toast. There is no server transaction, audit event, or resource reservation.
9. The operator can return to dashboard, map, alerts, reports, or analytics; all views read the same in-memory store instances for that browser tab.

### 4.2 Citizen / field SOS

1. The user opens **Send SOS** from the sidebar.
2. They choose one of six emergency types and optionally enter a description.
3. `activateSOS` sets `sosActive=true` and status `sending`.
4. After a timer, the selected connectivity mode maps to `queued-offline`, `mesh-relay`, or `sent`; online mode later becomes `acknowledged`.
5. The visible status is local UI state. The SOS does not create an `Incident`, `Alert`, `SyncOperation`, or server record in the checked-in implementation.

### 4.3 Simulation/evaluation

1. Open the floating gear or `/simulation`.
2. Create a high-priority flash-flood incident. This adds a randomized Pune incident and a linked high-priority local alert.
3. Simulate an SOS. Timers update the local SOS status.
4. Cycle connectivity to observe mode labels and demo behavior.
5. Select an incident elsewhere, then resolve it from the simulation controls.

## 5. Constraint analysis

### The system cannot currently do

- Authenticate real people or enforce authorization; login is role selection over mock users.
- Store incidents, teams, alerts, messages, resources, or SOS events on a server or durable local database.
- Communicate over BLE, Wi-Fi Direct, LoRa, cellular, radio, or any mesh hardware.
- Guarantee delivery, ordering, deduplication, conflict resolution, or replay of offline mutations.
- Synchronize between browser tabs, devices, or a control room.
- Produce a real CAP-compliant alert payload or distribute alerts to public channels.
- Call an AI model, calculate a recommendation from specialty/workload/distance, or prove a confidence score.
- Control or receive telemetry from a drone or robot.
- Provide safety-critical geolocation, dispatch, medical advice, or emergency-service integration.
- Provide a separate citizen-only product surface with route-level isolation from control-room features.

### Product and engineering constraints

- Treat all seeded values, Pune coordinates, metrics, timelines, and demo user identities as non-production data.
- Do not market the current app as an operational emergency system without backend, security, offline-storage, observability, delivery, and field-validation work.
- Any production change must preserve legal incident transitions and must not silently drop queued operations.
- Emergency actions need explicit error, retry, acknowledgement, and audit semantics before real users rely on them.
- The current repository has no automated test command; build verification is the available baseline until a test runner is added.

## 6. Documentation gaps and claim reconciliation

| Claim in the original `README.md` or `project.md` | Repository evidence | Classification |
|---|---|---|
| Offline BLE/Wi-Fi mesh communication | `meshStore` changes local labels, metrics, and a queue; no transport adapter exists | **Documentation gap / simulation only** |
| Automatic synchronization on reconnection | `processSyncQueue` marks queue items synced, is not connected to connectivity changes, and does not apply payloads | **Documentation gap** |
| AI recommendation engine | No model/API/recommendation service; only types, UI language, and seeded activity copy | **Documentation gap** |
| CAP-compliant alert system | `Alert` is a local TypeScript shape; no CAP XML/JSON schema or outbound channel | **Documentation gap** |
| Drone and robotic integrations | Resources contain entries such as Drone; no telemetry/device adapter exists | **Documentation gap / mock representation** |
| CRDT-based synchronization | Mentioned in `project.md`; no CRDT dependency or implementation | **Documentation gap** |
| Ed25519 signing | Mentioned in `project.md`; no crypto implementation or dependency | **Documentation gap** |
| Full disaster lifecycle management | Client incident lifecycle exists; no persistence, workflow audit, or external coordination | **Partial implementation** |
| Role-based UI | Responder receives a different sidebar; route guards do not check role and admin/control-room/citizen are not fully separated | **Partial implementation** |
| `localStorage` / IndexedDB local persistence | Selected user and settings use `localStorage`; domain stores reset on reload and no IndexedDB exists | **Partial implementation** |
| “15 lazy-loaded views” | `App.tsx` lazy-loads 17 page modules, including login and simulation | **Implemented; original count stale** |
| “No paid services/keys needed” | No application API keys are required; map tiles and fonts still require external network access | **Mostly true with network dependency** |

The current README now reflects these gaps directly rather than presenting them as implemented capabilities.

## 7. Success criteria for a production direction

The product should not be considered operational until a vertical slice can: authenticate a real role; create an incident or SOS; persist it locally; enqueue it under a deliberately disabled network; transmit it through an authenticated API or supported mesh adapter; reconcile it idempotently; show delivery/acknowledgement; audit assignment/status changes; and recover after reload or device restart. See [`working_plan.md`](./working_plan.md) for binary implementation tasks and [`brain.md`](./brain.md) for current boundaries.

## 8. Cross-links

- Architecture and execution model: [`brain.md`](./brain.md)
- Deterministic backlog and verification: [`working_plan.md`](./working_plan.md)
- AI-agent operating prompts: [`prompt.md`](./prompt.md)
