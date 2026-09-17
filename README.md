# ResQMesh

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Zustand](https://img.shields.io/badge/State-Zustand-433E38)](https://zustand.docs.pmnd.rs/)

**Emergency SOS and disaster-response operations dashboard**

ResQMesh is a React-based frontend prototype for exploring emergency incident management, responder coordination, alerts, resources, maps, reports, analytics, and degraded-connectivity scenarios.

> **Prototype disclaimer:** This repository is a browser-only demonstration. It uses seeded mock data and Zustand in-memory state. BLE/Wi-Fi/LoRa mesh transport, backend persistence, real authentication, AI services, CAP distribution, CRDT synchronization, Ed25519 signing, and drone/robot hardware integrations are **not implemented**.

## Highlights

- Incident dashboard with priorities, status lifecycle, affected-person counts, and response activity
- Team directory, team assignment, responder context, and resource management
- Pune-centered Leaflet map with mock incidents, teams, resources, and mesh nodes
- Alerts, reports, activity logs, analytics charts, and medical-support views
- Simulated SOS lifecycle across online, mesh, and offline modes
- Responsive emergency-operations UI with Tailwind CSS, shared components, status badges, and toast feedback
- Demo simulation controls for creating incidents, simulating SOS events, cycling connectivity, and resolving incidents

## Screens and workflows

### Incident response

1. Open **Incidents** from the sidebar.
2. Select an incident to review its location, priority, description, affected people, and status.
3. Move it through the legal transitions defined in [`src/lib/constants.ts`](./src/lib/constants.ts).
4. Assign a response team from the incident details page.
5. Review the updated local state on the dashboard or map.

### SOS simulation

1. Open **Send SOS** in the sidebar.
2. Choose an emergency type and optionally add a description.
3. Submit the SOS.
4. Observe the simulated `sending`, `sent`, `mesh-relay`, `queued-offline`, or `acknowledged` state.

The current SOS flow updates local `sosStore` state only. It does not create a persistent incident, transmit over hardware, or notify a remote command center.

### Simulation controls

Use the floating gear button in the lower-right corner to open **Simulation Controls**. The controls can:

- Create a randomized high-priority flash-flood incident around Pune
- Add a linked local alert
- Simulate an SOS
- Cycle between Online, Mesh, and Offline modes
- Resolve the currently selected incident
- Open the full simulation center at `/simulation`

## Quick start

### Requirements

- Node.js 18 or newer
- npm 9 or newer

### Clone and install

```bash
git clone https://github.com/AGfinx/resqmesh.git
cd resqmesh
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, usually [`http://localhost:5173`](http://localhost:5173).

### Build and preview

```bash
npm run build
npm run preview
```

> The repository does not currently include an automated test script. `npm run build` is the available project-level smoke check.

## Technology stack

- **React 19** with **TypeScript** and **Vite**
- **React Router** for client-side navigation and lazy-loaded pages
- **Zustand** for local application state
- **Tailwind CSS** with custom design tokens
- **Leaflet** and **React Leaflet** for maps
- **Recharts** for analytics and visualization
- **Lucide React** for icons
- **OpenStreetMap-compatible tiles** through Leaflet configuration

## Repository structure

```text
.
├── README.md                 # GitHub project overview and setup guide
├── PRD.md                    # Product vision, journeys, taxonomy, and gaps
├── brain.md                  # Architecture source of truth and execution traces
├── working_plan.md           # Deterministic engineering backlog and guardrails
├── prompt.md                 # AI-agent onboarding and task prompts
├── project.md                # Original product/specification brief
├── package.json              # Scripts and dependencies
├── vite.config.ts            # Vite config and @/* source alias
├── tsconfig.app.json         # Strict TypeScript configuration
└── src/
    ├── App.tsx               # Router, lazy routes, protected shell
    ├── main.tsx              # React StrictMode entry point
    ├── components/           # Shared layout, simulation, and UI components
    ├── data/                 # Seeded Pune mock datasets
    ├── layouts/              # Application shell and outlet
    ├── lib/                  # Constants and shared utilities
    ├── pages/                # Routed feature views
    ├── services/             # Local event bus
    ├── stores/               # Zustand domain and UI stores
    ├── styles/               # Tailwind entry point and design tokens
    └── types/                # Shared TypeScript domain types
```

## Available routes

| Route | View |
|---|---|
| `/login` | Demo persona selection |
| `/dashboard` | Operational dashboard |
| `/incidents` | Incident list |
| `/incidents/:id` | Incident details and status actions |
| `/incidents/:id/assign` | Team assignment view |
| `/map` | Map view |
| `/teams` | Team directory |
| `/teams/:id` | Team details |
| `/communication` | Team communication |
| `/resources` | Resource management |
| `/medical` | Medical support |
| `/reports` | Reports and logs |
| `/analytics` | Charts and analytics |
| `/alerts` | Alert center |
| `/settings` | Application settings |
| `/profile` | User profile |
| `/simulation` | Simulation and AI-themed demo center |

## State and data model

The application uses Zustand stores backed primarily by seeded data in `src/data/`.

| Store | Responsibility | Persistence |
|---|---|---|
| `authStore` | Current demo user, login/logout, profile patching, user status | Selected user ID in `localStorage` |
| `incidentStore` | Incidents, selected incident, create/update/assignment actions | In memory only |
| `teamStore` | Teams, team status, incident association | In memory only |
| `resourceStore` | Resource counts and assignments | In memory only |
| `alertStore` | Alerts and unread count | In memory only |
| `communicationStore` | Team chat messages | In memory only |
| `reportStore` | Reports and activity logs | In memory only |
| `meshStore` | Connectivity mode, mesh nodes, simulated queue, metrics | In memory only |
| `sosStore` | One active simulated SOS state machine | In memory only |
| `settingsStore` | Application preferences | `localStorage` |
| `uiStore` | Sidebar and simulation-panel visibility | In memory only |

Most domain changes reset when the page is reloaded.

## Known limitations

The current implementation should not be used as a real emergency-response system:

- No backend API, database, remote synchronization, or multi-device state
- Mock persona selection instead of real authentication and incomplete authorization
- SOS events do not automatically become persistent incidents or alerts
- Connectivity is represented by local labels and timers; no wireless transport exists
- No durable outbox, retry handling, conflict resolution, or idempotent replay
- No AI model or recommendation service
- No CAP-compliant alert serialization or external distribution
- Drone and robot records have no telemetry or device control
- CRDT synchronization and Ed25519 signing are absent
- Some dashboard timelines and metrics are illustrative seeded values
- No unit, integration, or end-to-end tests yet
- Maps and fonts rely on external network resources at runtime

## Documentation

- [`PRD.md`](./PRD.md) — product vision, user journeys, feature taxonomy, constraints, and documentation gaps
- [`brain.md`](./brain.md) — architecture, state ownership, execution traces, dependencies, and gotchas
- [`working_plan.md`](./working_plan.md) — prioritized implementation backlog and stability guardrails
- [`prompt.md`](./prompt.md) — onboarding, feature, debugging, and refactoring prompts for AI agents
- [`project.md`](./project.md) — original product concept and frontend specification

## Contributing

Before making a change:

1. Read [`PRD.md`](./PRD.md), [`brain.md`](./brain.md), and [`working_plan.md`](./working_plan.md).
2. Identify the owning store, service, type, and route.
3. Preserve incident transition rules and the simulation boundary.
4. Add or update tests when the test harness is introduced.
5. Run `npm run build` before submitting the change.

Keep documentation claims aligned with the implementation. If a feature is simulated or aspirational, label it clearly rather than presenting it as a production integration.
