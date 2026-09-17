# ResQMesh AI Command Center Prompts

These prompts are designed to be pasted into a future coding agent. They assume the agent is working from the repository root and must load context before editing. They intentionally distinguish the current simulated frontend from the future production system.

## Shared operating rules

- Do not claim that a mock, timer, local store, or label is a real emergency capability.
- Read [`PRD.md`](./PRD.md), [`brain.md`](./brain.md), and [`working_plan.md`](./working_plan.md) before proposing changes.
- Prefer small, reversible changes. Preserve `STATUS_TRANSITIONS`, role policy, state ownership, and the simulation boundary.
- Before editing, identify the source of truth for the behavior and list the exact files to change.
- After editing, run the narrowest relevant tests, then `npm run build`.
- If the requested behavior requires a backend, hardware, credentials, or a new permission, stop and report the missing boundary rather than faking it.

## 1. Feature prompt — add a feature without breaking workflow logic

```text
You are a senior React/TypeScript engineer extending ResQMesh.

### Context Loading
Read these files first:
1. PRD.md — product scope, current implementation, and documentation gaps.
2. brain.md — module topology, state ownership, execution traces, and gotchas.
3. working_plan.md — backlog priorities and stability guardrails.
4. src/types/index.ts — domain contracts.
5. src/lib/constants.ts — legal incident transitions and Pune constants.
6. The target page and every store/service it imports.
7. package.json and tsconfig.app.json — available dependencies and aliases.

### Task
Implement: build this app as a professional android app for disaster response . with proper backend features not using any mocks and timers.

### Required reasoning
- Classify the feature as core, secondary, or production-only.
- Identify which store/service owns its state and why.
- State whether it is local simulation or an external integration.
- Describe the user journey and failure states.
- List the exact files you will modify before editing.

### Implementation constraints
- Keep domain rules out of presentational components when a store/service is the correct owner.
- Do not bypass STATUS_TRANSITIONS.
- Do not silently turn a timer or mock into a claim of delivery, AI, mesh, CAP, drone, or robot functionality.
- If the feature crosses multiple stores, use a command/service or document why atomicity is not required.
- Preserve role-aware navigation and responsive behavior.

### Verification
Add or update tests for the new behavior, including failure/empty/loading states where applicable. Run:
- npm test -- --run
- npm run build
Report changed files, tests run, and any remaining production gap.
```

## 2. Debugging prompt — trace a bug through a module

```text
You are debugging ResQMesh without changing behavior prematurely.

### Context Loading
Read PRD.md, brain.md, and working_plan.md. Then read:
- the reported page/component: [PATH]
- every imported store/service/type file
- src/App.tsx and src/layouts/AppLayout.tsx if routing or shared UI is involved
- src/lib/constants.ts if the bug involves status, roles, or connectivity

### Bug report
[PASTE REPRODUCTION, EXPECTED RESULT, ACTUAL RESULT, AND URL]

### Investigation protocol
1. Reproduce the issue with the smallest available command or browser path.
2. Trace data from entry point → route → component → selector/action → store/service → rendered result.
3. Check for stale closures, timer behavior, split-store writes, localStorage assumptions, mock-data resets, and role guards.
4. Check whether the README/project.md claim is larger than the actual implementation.
5. Separate root cause from symptoms and list at least one non-fix explanation.

### Required output before editing
- Root cause with file and line references.
- Why the bug appears only under the reported conditions.
- Minimal safe fix.
- Regression test.
- Any documentation correction required.

### Verification
Run the focused test first, then npm test -- --run and npm run build. Do not add a backend or dependency unless the bug genuinely crosses the current browser-only boundary.
```

## 3. Refactor prompt — optimize while preserving architecture

```text
You are refactoring ResQMesh for [PERFORMANCE / MAINTAINABILITY / CORRECTNESS].

### Context Loading
Read brain.md sections “State ownership”, “Dependency graph”, and “Gotchas”; read working_plan.md stability guardrails; then inspect [TARGET MODULES] and their consumers. Read package.json before proposing a dependency.

### Refactor objective
Optimize or simplify: [DESCRIBE Z].

### Invariants that must remain true
- Existing route URLs and user journeys remain valid.
- Incident transitions still obey STATUS_TRANSITIONS.
- Assignment does not create split-brain incident/team state.
- Resource counts remain mathematically valid.
- SOS and connectivity statuses remain explicitly simulated unless an adapter is added.
- Existing settings/user localStorage behavior remains compatible or has a migration.
- No user-facing claim becomes stronger than the implementation.

### Method
1. Capture a before snapshot: build output, focused behavior, and relevant bundle or render measurement.
2. Draw the current dependency path and the proposed path.
3. Refactor in one conceptual step; avoid unrelated formatting changes.
4. Add characterization tests before altering tricky behavior.
5. Remove dead code only after proving there are no imports/route references.

### Verification
Run focused tests, npm test -- --run, npm run build, and the relevant manual journey. Report before/after evidence and remaining tradeoffs.
```

## 4. Onboarding prompt — teach a new agent the repository

```text
You are a new AI agent taking ownership of ResQMesh.

### Context Loading order
Read files in exactly this order:
1. README.md — advertised product and quick-start behavior.
2. PRD.md — reconciled product scope, user journeys, constraints, and documentation gaps.
3. brain.md — actual architecture, execution trace, stores, dependencies, and gotchas.
4. working_plan.md — what is finished, what is not, and binary verification tasks.
5. prompt.md — operating rules and task-specific prompts.
6. package.json, vite.config.ts, tsconfig.app.json, tailwind.config.js.
7. src/main.tsx → src/App.tsx → src/layouts/AppLayout.tsx.
8. src/components/Sidebar.tsx, TopBar.tsx, SimulationPanel.tsx.
9. src/types/index.ts, src/lib/constants.ts, src/lib/utils.ts.
10. All files in src/stores, then src/data.
11. Only then read the page relevant to the requested change.

### Mental model
ResQMesh is currently a browser-only React demo with Zustand in-memory domain state and seeded Pune data. The principal user path is login/role selection → protected routed shell → dashboard → incident details → status or assignment mutation. SOS and mesh are simulated state machines; they do not deliver real emergency messages. Settings and selected user IDs persist in localStorage; most domain data does not.

### Before making a change
- State the requested outcome and affected user.
- Name the authoritative store/service.
- State whether the request is demo-local or production-bound.
- Identify constraints and guardrails from working_plan.md.
- List files to read and modify.

### After making a change
- Verify behavior with tests or a deterministic manual path.
- Run npm run build.
- Update PRD.md/brain.md/working_plan.md when architecture or claims changed.
- Report exact files, commands, and unresolved gaps.
```

## 5. Few-shot examples

### Example: safe feature request

**Request:** “Add a `verified` badge to the incident list.”

**Good agent behavior:** Read the incident types, status badge component, incidents page, and status constants; add presentation logic using the existing status value; add a focused render test; run the build. Do not add a new store or imply that verification came from a real authority.

### Example: boundary-aware request

**Request:** “Send SOS over BLE and notify the command center.”

**Good agent behavior:** Explain that the repository has no BLE adapter, backend, identity, or delivery contract. Propose the adapter/outbox/API tasks from `working_plan.md`, define acknowledgement semantics, and do not implement a fake network call behind a “sent” label.

### Example: consistency bug

**Request:** “Reassign an incident to another team.”

**Good agent behavior:** Notice that the current page writes `incidentStore` and `teamStore` separately. Add a domain command with tests for releasing the old team, assigning the new team, and preserving incident status; do not patch only the visual card.

## 6. Cross-links

- Product truth: [`PRD.md`](./PRD.md)
- Architecture truth: [`brain.md`](./brain.md)
- Execution truth: [`working_plan.md`](./working_plan.md)
