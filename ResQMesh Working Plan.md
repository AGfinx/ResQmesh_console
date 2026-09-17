# ResQMesh Working Plan

> This plan is written for a developer or AI agent with no prior repository context. Every task has an observable completion condition. Do not treat aspirational claims in `README.md` or `project.md` as completed functionality; use [`PRD.md`](./PRD.md) and [`brain.md`](./brain.md) as the current reality model.

## 1. Current-state audit

### Actually finished in the checked-in frontend

- React/Vite/TypeScript application builds successfully with `npm run build`.
- Client routes cover dashboard, incidents, map, teams, communication, resources, medical, reports, analytics, alerts, settings, profile, and simulation.
- Seeded Pune mock data is rendered through pages and Zustand stores.
- Incident creation, status updates, team assignment, resource assignment, alerts, messages, reports, settings persistence, and simulated SOS/connectivity flows exist locally.
- The layout is responsive and uses shared design tokens/components.

### Claimed but not finished

- Real authentication and authorization.
- Real backend/API/database persistence.
- BLE/Wi-Fi/LoRa mesh transport.
- Durable offline-first storage and automatic synchronization.
- AI recommendation engine.
- CAP-compliant external alert distribution.
- Drone/robot telemetry or dispatch.
- CRDT synchronization and Ed25519 signing.
- Automated unit, integration, or end-to-end tests.
- Production observability, security controls, and emergency-service integrations.

## 2. Execution backlog

### P0 — Establish a safe vertical slice

| Task name | Files to modify/create | Verification command |
|---|---|---|
| Define production domain contract | Create `docs/domain-contract.md`; update `src/types/index.ts` | `test -s docs/domain-contract.md && npm run build` |
| Add a test runner and baseline tests | `package.json`, `vitest.config.ts`, `src/**/*.test.ts` | `npm test -- --run` |
| Add centralized error boundaries | `src/App.tsx`, create `src/components/ErrorBoundary.tsx` | `npm run build` and manually navigate to an invalid route |
| Replace open-by-default demo auth with explicit demo flag | `src/stores/authStore.ts`, `src/pages/LoginPage.tsx`, `.env.example` | `npm run build && rg -n "isAuthenticated: true|DEMO" src .env.example` |
| Add route-level role policy | `src/App.tsx`, `src/lib/constants.ts`, `src/components/Sidebar.tsx` | Unit test allowed/denied role-route matrix |
| Specify SOS projection | Create `docs/sos-contract.md`; update `src/stores/sosStore.ts`, `src/stores/incidentStore.ts`, `src/stores/alertStore.ts` | Test one SOS creates exactly one traceable incident and alert |

### P0 — Make offline behavior truthful

| Task name | Files to modify/create | Verification command |
|---|---|---|
| Implement durable local outbox | Create `src/services/sync/outbox.ts`; update `meshStore.ts` | Reload browser with queued mutation and assert it remains queued |
| Define idempotency and replay rules | Create `docs/sync-contract.md`; `src/types/index.ts` | Contract tests for duplicate operation IDs |
| Reconcile only acknowledged operations | `src/services/sync/*`, `src/stores/meshStore.ts` | Test offline → online transition applies payload once |
| Surface sync failure state | `src/components/TopBar.tsx`, mesh UI/pages, sync service | Component test renders queued, syncing, failed, and acknowledged states |
| Add service worker/PWA only after outbox contract | `vite.config.ts`, PWA files, `src/services/sync/*` | Production preview works offline for app shell; outbox tests remain green |

### P1 — Make domain commands consistent

| Task name | Files to modify/create | Verification command |
|---|---|---|
| Introduce incident command service | Create `src/services/incidentService.ts`; migrate page/store calls | Unit tests cover create, assign, transition, cancel, close |
| Make assignment atomic | `incidentService.ts`, `incidentStore.ts`, `teamStore.ts`, relevant pages | Test incident/team invariants before and after assignment/reassignment |
| Release previous team on reassignment | `src/services/incidentService.ts`, stores | Test old team becomes available and new team owns incident |
| Derive activity timeline from logs | `src/pages/DashboardPage.tsx`, `src/stores/reportStore.ts` | Test a status change yields a visible activity record |
| Enforce resource invariants | `resourceStore.ts`, resource pages | Test available + inUse = total and no negative counts |

### P1 — Add external interfaces behind adapters

| Task name | Files to modify/create | Verification command |
|---|---|---|
| Create API client interface | Create `src/services/api/*`, `src/services/config.ts` | Typecheck with mock adapter and no network |
| Create mesh adapter interface | Create `src/services/mesh/*` | Adapter contract test passes with fake transport |
| Create alert distribution adapter | Create `src/services/notifications/*`; CAP schema docs | Validate a known-good and known-bad payload |
| Create recommendation adapter | Create `src/services/recommendations/*`; update simulation page | Deterministic fixture returns ranked teams with explainable score |
| Add device/robot telemetry boundary | Create `src/services/devices/*`; update resource types | Fake telemetry updates a device without claiming hardware control |

### P1 — Security and operational readiness

| Task name | Files to modify/create | Verification command |
|---|---|---|
| Add structured audit events | `src/stores/reportStore.ts`, domain services | Test every mutation has actor, entity, action, timestamp, correlation ID |
| Add input validation | `package.json`, forms/pages, Zod schemas | Validation tests reject malformed incident, SOS, resource, and report input |
| Add secure configuration handling | `.env.example`, deployment config, service client | `rg -n "API_KEY|SECRET|TOKEN" src` returns no hard-coded secrets |
| Add browser persistence migration/versioning | `src/services/storage/*`, stores | Migration test upgrades an old settings/outbox schema |
| Add observability hooks | error boundary, service adapters, deployment config | Simulated failure produces a structured error event |

### P2 — Product completeness and performance

| Task name | Files to modify/create | Verification command |
|---|---|---|
| Separate citizen experience | `src/pages/*`, routing, role policy | Citizen test cannot see control-room-only navigation/routes |
| Replace hard-coded demo timelines/metrics | dashboard, analytics, reports, data layer | Fixture changes alter visible metrics deterministically |
| Add loading/empty/error states to every data page | pages and shared UI components | Component tests cover each state |
| Optimize route chunks | Vite config and heavy pages | `npm run build` and compare bundle report against budget |
| Add accessibility pass | all interactive pages/components | Automated accessibility smoke test plus keyboard walkthrough |
| Update README/project specification | `README.md`, `project.md` | Every claimed feature links to implementation or is labeled simulation/gap |

## 3. Stability guardrails

Run these checks before merging any feature:

```bash
npm install --no-audit --no-fund
npm run build
npm test -- --run
```

The following behavioral invariants must remain true:

1. An incident status can only move through `STATUS_TRANSITIONS` unless a deliberate cancellation/administrative override is specified and tested.
2. An assignment cannot leave two teams owning the same incident.
3. Resource counts never become negative and `available + inUse === total` for countable resources.
4. An SOS has a traceable lifecycle and never reports acknowledgement before the selected transport or simulation adapter confirms it.
5. Offline operations survive reload, carry unique IDs, and are applied idempotently.
6. A user cannot reach a route or mutation outside their role policy.
7. Alerts and unread counts stay consistent after add, read, remove, broadcast, and clear operations.
8. No production UI claims that a simulated mesh, AI recommendation, CAP alert, drone, or robot is real.
9. External dependencies are mocked in unit tests; tests do not require live map tiles, fonts, APIs, or hardware.
10. Any mutation creates an auditable event with actor, timestamp, entity, and result.

## 4. Recommended implementation order

1. Add tests and error boundaries without changing product behavior.
2. Define domain contracts and role policy.
3. Implement SOS-to-incident projection and atomic domain commands.
4. Implement durable outbox and explicit sync states.
5. Add API/mesh/notification/recommendation/device adapters behind interfaces.
6. Add security, audit, validation, persistence migration, and observability.
7. Split citizen UX and replace hard-coded operational copy.
8. Optimize, accessibility-test, and update product documentation.

## 5. Cross-links

- Product scope and constraints: [`PRD.md`](./PRD.md)
- Current architecture and gotchas: [`brain.md`](./brain.md)
- Future-agent instructions: [`prompt.md`](./prompt.md)
