# ResQMesh --- Emergency SOS & Disaster Response Ecosystem

## Agent-Ready Full-Stack React + TypeScript Project Specification

> **Purpose:** This document is the single source of truth for
> rebuilding the ResQMesh application from the provided product concept
> and UI screenshots. An AI coding agent should be able to use this file
> to design, implement, run, and validate the complete frontend without
> needing the original source code.

------------------------------------------------------------------------

# 1. Project Overview

## 1.1 Product Name

**ResQMesh**

Tagline examples visible across the supplied designs:

-   Stronger Together
-   Stay Connected. Save Lives.
-   Stronger Together. Safer Forever.

The core positioning from the project pitch is:

**ResQMesh is an Emergency-SOS Ecosystem-as-a-Service for disaster
management, combining offline mesh communication, emergency alerting,
AI-assisted coordination, incident management, and drone/robotic
response.**

The platform is intended to remain useful when conventional cellular
connectivity and power infrastructure are degraded or unavailable.

The pitch specifically describes the solution as a unified ecosystem
containing:

-   **SOSnap** --- citizen emergency access
-   **Respond App** --- responder/authority triage and operations
-   **Simulation & Sync Engine** --- the AI/core coordination layer
-   BLE/Wi-Fi mesh communication
-   CRDT-based synchronization
-   Ed25519 signing
-   Drone-as-a-Service
-   Robot-as-a-Service
-   Full disaster lifecycle management

The product pitch identifies the main problem as:

> Cellular and power grids can collapse during disasters, creating
> extended blackouts and loss of SOS connectivity, while alerting, mesh
> communication, triage, and robotics are generally fragmented instead
> of operating as one unified emergency ecosystem.

The pitch cites the Assam floods as an example of large-scale
displacement and delayed rescue coordination.

------------------------------------------------------------------------

# 2. Core Problem Statement

## One-line problem statement

**During disasters, cellular/power infrastructure can fail and emergency
systems operate in silos, leaving victims and responders without
reliable SOS communication, real-time incident coordination, and unified
rescue management.**

## Problem details

The application is designed around four major pain points:

1.  **Connectivity failure**

    -   Cellular networks may become unavailable.
    -   Internet/cloud services may become unreachable.
    -   Power infrastructure may fail.
    -   Traditional cloud-first emergency applications become less
        useful.

2.  **Fragmented emergency workflows**

    -   Citizen SOS
    -   Emergency alerts
    -   Incident reporting
    -   Responder assignment
    -   Medical support
    -   Resource management
    -   Rescue robotics
    -   Reporting/logging

    are commonly handled as separate systems.

3.  **Poor coordination**

    -   Authorities need to know where incidents are.
    -   Responders need to know which team is closest and available.
    -   Resources need to be tracked.
    -   Teams need real-time communication.

4.  **Disaster-scale information overload**

    -   Multiple incidents can occur simultaneously.
    -   Incidents have different priorities.
    -   Responders need location, severity, people affected, resources,
        and team status in one place.

------------------------------------------------------------------------

# 3. Product Vision

ResQMesh should provide one integrated operational ecosystem:

``` text
Citizen / Field User
        |
        | SOS / Incident Report
        v
Offline Mesh + Internet
        |
        v
Incident & Triage Engine
        |
        +----> Map / Command Dashboard
        |
        +----> Team Assignment
        |
        +----> Resource Allocation
        |
        +----> Medical Support
        |
        +----> Drone / Robotics Response
        |
        +----> Alerts & Communication
        |
        v
Reports / Analytics / Cloud Sync
```

The system should support graceful degradation:

``` text
ONLINE
  ↓
Cloud + API + real-time sync
  ↓
DEGRADED
  ↓
Local network / BLE / Wi-Fi mesh
  ↓
OFFLINE
  ↓
Local-first operation + queued synchronization
```

The frontend must therefore be designed as a **disaster-response command
platform**, not as a generic CRUD dashboard.

------------------------------------------------------------------------

# 4. Scope of This Implementation

## Required implementation

Build a polished React + TypeScript web application matching the
supplied screenshots as closely as practical.

The implementation should include:

-   Admin/control-room dashboard
-   Responder dashboard
-   Incident management
-   Live map view
-   Team management
-   Team assignment
-   Team communication
-   Resources management
-   Medical support
-   Reports and logs
-   SOS workflow
-   Alerts/notifications
-   Profile/settings
-   Analytics
-   Offline/degraded-mode simulation
-   Incident status lifecycle
-   Mock real-time updates
-   Role-based UI
-   Responsive layout

## Important implementation assumption

The original source code is unavailable.

Therefore:

-   Build the application from scratch.
-   Treat the supplied screenshots as the **visual reference**.
-   Treat the supplied ResQMesh pitch as the **product/concept
    reference**.
-   Do not claim that a real emergency network, government integration,
    drone fleet, CRDT backend, or BLE mesh exists unless an actual
    implementation is added.
-   For the first implementation, use realistic mock services/data and
    clean interfaces so real backend integrations can be added later.

------------------------------------------------------------------------

# 5. Recommended Technology Stack

## Frontend

-   **React**
-   **TypeScript**
-   **Vite**
-   **Tailwind CSS**
-   **shadcn/ui** or equivalent accessible component primitives
-   **Lucide React** for icons
-   **React Router**
-   **TanStack Query** for server-state architecture
-   **Zustand** for client/application state
-   **React Hook Form**
-   **Zod** for validation

## Mapping

Preferred:

-   **MapLibre GL JS** or **React Map GL**
-   OpenStreetMap-compatible map tiles during development

Fallback:

-   Leaflet + React Leaflet

The map page must visually resemble the supplied Pune command-center
screenshot.

## Charts

Use:

-   Recharts

for:

-   incident trends
-   response time
-   resource usage
-   resolution rates
-   incident category distribution

## Notifications

Use toast notifications for UI feedback and a persistent notification
center for emergency alerts.

## Data

Initial version:

-   TypeScript mock data
-   localStorage / IndexedDB for local persistence
-   simulated API service layer

Optional production backend:

-   Node.js
-   Express or Fastify
-   PostgreSQL
-   Redis
-   WebSocket / Socket.IO

## Offline support

The frontend architecture should be PWA-friendly:

-   Service Worker
-   IndexedDB
-   local-first state
-   queued mutations
-   retry/sync mechanism

The actual BLE/Wi-Fi mesh can initially be represented by a simulation
adapter.

------------------------------------------------------------------------

# 6. Application Architecture

Use a modular architecture.

``` text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── store/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── maps/
│   ├── incidents/
│   ├── teams/
│   ├── resources/
│   ├── reports/
│   ├── alerts/
│   └── sos/
│
├── features/
│   ├── dashboard/
│   ├── incidents/
│   ├── map/
│   ├── teams/
│   ├── resources/
│   ├── medical/
│   ├── reports/
│   ├── communication/
│   ├── sos/
│   ├── analytics/
│   └── settings/
│
├── pages/
│   ├── DashboardPage.tsx
│   ├── IncidentsPage.tsx
│   ├── MapPage.tsx
│   ├── TeamsPage.tsx
│   ├── AssignTeamPage.tsx
│   ├── CommunicationPage.tsx
│   ├── ResourcesPage.tsx
│   ├── MedicalPage.tsx
│   ├── ReportsPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── AlertsPage.tsx
│   ├── ProfilePage.tsx
│   └── SettingsPage.tsx
│
├── services/
│   ├── api/
│   ├── mock/
│   ├── sync/
│   ├── mesh/
│   └── notifications/
│
├── hooks/
├── lib/
├── types/
├── constants/
├── data/
└── styles/
```

------------------------------------------------------------------------

# 7. User Roles

The UI must support role-aware navigation.

## 7.1 Administrator / Control Room

Primary responsibilities:

-   Monitor all incidents
-   View live map
-   Assign teams
-   Manage resources
-   Monitor alerts
-   Review reports
-   View analytics
-   Communicate with responders
-   Manage system settings

Screenshot examples use:

-   Administrator
-   Admin User
-   Control Room

## 7.2 Responder

Primary responsibilities:

-   View assigned incidents
-   View nearby incidents
-   Navigate to incident
-   Update incident status
-   Communicate with team
-   View available resources
-   Access medical support
-   Report field status
-   Send/receive alerts

The supplied responder sidebar contains:

-   Dashboard
-   Incidents
-   Map View
-   Team
-   Resources
-   Medical Support
-   Reports & Logs
-   Settings
-   Profile

## 7.3 Citizen

Citizen functionality should be simpler:

-   Send SOS
-   Report incident
-   Share location
-   View emergency instructions
-   Receive alerts
-   View shelter/safe-zone information

The pitch refers to this citizen-facing component as **SOSnap**.

------------------------------------------------------------------------

# 8. Global UI Design System

The UI should closely follow the supplied screenshots.

## 8.1 Visual style

Overall style:

-   Clean
-   Modern
-   Government/emergency operations dashboard
-   Professional
-   Minimal
-   High information density without looking cluttered
-   Large whitespace
-   Rounded cards
-   Soft borders
-   Subtle shadows
-   Strong blue primary actions
-   Red emergency actions
-   Green success/available states
-   Amber warning states

Avoid:

-   overly dark cyberpunk UI
-   excessive gradients
-   glassmorphism everywhere
-   gaming-style dashboards
-   excessive animations

## 8.2 Primary palette

Use a consistent design token system.

Suggested:

``` text
Primary Navy:       #0B2A6F
Primary Blue:       #165DDB
Emergency Red:      #E53935
Warning Amber:      #F59E0B
Success Green:      #16A34A
Info Blue:          #2563EB
Text Primary:       #17233C
Text Secondary:     #64748B
Background:         #F7F9FC
Surface:            #FFFFFF
Border:             #E5EAF1
```

Do not hard-code these everywhere. Define CSS variables/design tokens.

## 8.3 Typography

Use:

-   Inter
-   or another modern sans-serif

Hierarchy:

-   Page title: 28--32px, semibold/bold
-   Section heading: 18--22px
-   Card title: 16--18px
-   Body: 14--15px
-   Metadata: 12--13px

## 8.4 Cards

Cards should have:

-   white background
-   12--18px radius
-   subtle border
-   very soft shadow
-   20--28px padding

## 8.5 Buttons

Primary:

-   blue background
-   white text
-   rounded 8--10px

Danger:

-   red background
-   white text

Secondary:

-   white background
-   blue/navy text
-   border

## 8.6 Status badges

Examples:

``` text
High Priority     → red/pale red
Medium Priority   → amber/pale amber
Low Priority      → blue/green depending on context
Available         → green
In Use            → amber
En Route          → red/pink
Resolved          → green
Submitted         → green
Draft             → amber
Offline           → gray/red
```

------------------------------------------------------------------------

# 9. Global Application Layout

The desktop application should use:

``` text
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Top Header                                        │
│         ├───────────────────────────────────────────────────┤
│         │                                                   │
│         │              Main Content Area                    │
│         │                                                   │
│         │                                                   │
└─────────────────────────────────────────────────────────────┘
```

## Sidebar

Width:

-   approximately 240--260px desktop

Contents vary by role.

Sidebar should include:

-   logo
-   navigation
-   active route indicator
-   optional SOS card at bottom
-   support/help card where appropriate

Active navigation:

-   pale blue background
-   blue icon
-   blue/dark text
-   left/right accent depending on design

## Top bar

Include:

-   page title / breadcrumb area where appropriate
-   search field
-   filter button
-   notification bell
-   unread badge
-   profile avatar
-   user name
-   role
-   dropdown

------------------------------------------------------------------------

# 10. Dashboard

Route:

``` text
/dashboard
```

## Purpose

Give control-room staff a high-level view of the disaster-response
situation.

## Required dashboard sections

### A. KPI cards

Include:

-   Total Incidents
-   High Priority
-   In Progress
-   Resolved
-   Average Response Time

Example screenshot values:

``` text
Total Incidents: 24
High Priority: 8
In Progress: 10
Resolved: 6
Average Response Time: 12 min
```

These are demo values only.

### B. Incident overview

Display:

-   active incidents
-   priority
-   location
-   time
-   people affected
-   assigned team
-   status

### C. Map preview

Show:

-   incident markers
-   responder markers
-   resource markers
-   cluster counts

### D. Alerts

Show critical alerts.

### E. Response activity

Show a timeline:

``` text
09:20 Team Alpha assigned
09:24 Drone dispatched
09:28 Medical unit arrived
09:35 Incident stabilized
```

------------------------------------------------------------------------

# 11. Map View

Route:

``` text
/map
```

This is one of the most important screens.

The supplied screenshot shows a **Pune-focused real-time incident map**.

## 11.1 Layout

Desktop:

``` text
┌──────────────┬──────────────────────────────┬─────────────────────┐
│ Sidebar      │                              │ Active Incidents    │
│              │         LIVE MAP             │                     │
│              │                              │ Incident cards      │
│              │                              │                     │
│              │                              │                     │
│              ├──────────────────────────────┤                     │
│              │ Selected incident details    │                     │
│              ├──────────────────────────────┤                     │
│              │ KPI cards                    │                     │
└──────────────┴──────────────────────────────┴─────────────────────┘
```

## 11.2 Map

Default location:

**Pune, Maharashtra, India**

The reference screenshot contains areas such as:

-   Pimpri-Chinchwad
-   Baner
-   Hinjawadi
-   Aundh
-   Kothrud
-   Kharadi
-   Shivajinagar
-   Hadapsar
-   Kondhwa
-   NIBM

The actual map should be interactive.

## 11.3 Map markers

Use different marker styles:

### High priority

Red:

-   warning triangle
-   cluster number

### Medium priority

Orange:

-   warning/incident icon
-   cluster number

### Low priority

Blue/green:

-   incident/resource icon

## 11.4 Map controls

Include:

-   locate/current location
-   zoom in
-   zoom out
-   layers
-   marker filtering

## 11.5 Search

Top search:

``` text
Search location, incident or area...
```

Should support:

-   incident name
-   location
-   incident ID
-   resource
-   team

## 11.6 Layers

Dropdown:

``` text
☑ Incidents
☑ Responders
☑ Teams
☑ Resources
☐ Shelters
☐ Hospitals
☐ Drone Coverage
☐ Mesh Nodes
```

## 11.7 Active incidents panel

Right side panel.

Example cards:

### Heavy Rainfall

``` text
High Priority
Kothrud, Pune
10 min ago
3.2 km
```

### Traffic Blockage

``` text
Medium Priority
Pimple Saudagar, Pune
25 min ago
5.6 km
```

### Road Accident

``` text
Low Priority
Hadapsar, Pune
40 min ago
7.8 km
```

### Power Outage

``` text
Low Priority
Kondhwa, Pune
1 hr ago
9.4 km
```

Clicking an incident selects it on the map.

## 11.8 Selected incident bottom panel

Display:

-   priority
-   incident title
-   location
-   time
-   distance
-   description
-   category
-   actions
-   assigned team

Buttons:

``` text
View Details
Share Alert
```

------------------------------------------------------------------------

# 12. Incidents

Route:

``` text
/incidents
```

The supplied screenshot shows a clean list-based incident management
screen.

## Header

``` text
Incidents
Track and manage all reported incidents in real-time.
```

Search:

``` text
Search incidents...
```

Filter icon.

## Tabs

``` text
All (12)
High (4)
Medium (5)
Low (3)
```

Counts should be calculated dynamically.

## Sort

Dropdown:

``` text
Most Recent
Oldest
Highest Priority
Nearest
Most Affected
```

## Incident card

Each row/card contains:

-   incident icon
-   priority badge
-   title
-   location
-   time
-   people affected
-   distance
-   arrow to details

Example:

``` text
Heavy Rainfall
High Priority
Kothrud, Pune

10 min ago | 12 people affected | 3.2 km away
```

## Incident statuses

Support:

``` text
Reported
Verified
Assigned
En Route
On Site
In Progress
Resolved
Closed
Cancelled
```

------------------------------------------------------------------------

# 13. Incident Details

Route:

``` text
/incidents/:incidentId
```

## Header

Show:

-   incident title
-   incident ID
-   priority
-   status
-   created time
-   location

## Main sections

### Incident information

-   category
-   description
-   location
-   coordinates
-   reported by
-   people affected
-   severity

### Live status

Timeline:

``` text
Reported
   ↓
Verified
   ↓
Team Assigned
   ↓
En Route
   ↓
On Site
   ↓
Resolved
```

### Assigned team

Display:

-   team name
-   members
-   distance
-   status
-   ETA

### Resources

Display resources assigned to incident.

### Communication

Quick link to team communication.

### Actions

-   Assign Team
-   Escalate
-   Send Alert
-   Add Resource
-   Update Status
-   Resolve Incident

------------------------------------------------------------------------

# 14. Assign Team

Route:

``` text
/incidents/:incidentId/assign
```

The supplied screenshot provides the visual reference.

## Header

``` text
Assign Team
Select the best team or responder to assign to this incident.
```

Search:

``` text
Search team or responder...
```

## Nearby Teams

Show teams near incident location.

Example:

### Team Alpha

``` text
5 Members
Ambulance · First Aid
Available
1.2 km
```

### Team Bravo

``` text
4 Members
Rescuer · Medic
Available
2.8 km
```

### Team Charlie

``` text
6 Members
Rescuer · Driver · First Aid
En Route
4.5 km
```

## Available responders

Each responder:

-   avatar
-   name
-   role
-   availability
-   phone action

Example roles:

-   Medic
-   Rescuer
-   Driver
-   First Aid
-   Drone Operator
-   Field Officer
-   Technical Analyst

## Assignment logic

Default recommendation score:

``` text
score =
  distance_weight +
  availability_weight +
  skill_match_weight +
  resource_match_weight +
  current_workload_weight
```

For mock frontend:

-   prioritize available
-   then skill match
-   then distance
-   then workload

Do not claim this is an AI model unless implemented as one.

## Final action

Large full-width button:

``` text
Assign to Incident
```

After assignment:

-   update incident
-   mark team as assigned/en route
-   create activity log
-   create notification
-   update map

------------------------------------------------------------------------

# 15. Team Management

Route:

``` text
/teams
```

## Team cards/table

Fields:

-   team name
-   team ID
-   members
-   specialties
-   status
-   current incident
-   current location
-   distance
-   equipment

Statuses:

``` text
Available
Assigned
En Route
On Site
Busy
Offline
```

## Team detail

Show:

-   members
-   roles
-   live location
-   current mission
-   equipment
-   communication
-   activity
-   availability

------------------------------------------------------------------------

# 16. Team Communication

Route:

``` text
/team
/communication
```

The supplied screenshot shows a two-column communication interface.

## Left column

Selected team:

``` text
Team Alpha
5 members
```

Search members.

Member list:

``` text
Rahul Patil
Team Lead
●

Sneha Sharma
Coordinator
●

Arjun More
Drone Operator
●

Priya Desai
Field Officer
●

Vikram Singh
Technical Analyst
●
```

Use status dots:

-   green = online
-   amber = away
-   gray = offline

## Right column

Chat messages.

Example:

``` text
Rahul Patil
09:20 AM

We are 2 km away from the site.
Moving in 5 minutes.
```

``` text
Sneha Sharma
09:21 AM

Understood. Keep us updated.
```

User message:

``` text
Please check water levels near the bridge.
```

Responder:

``` text
Arjun More
09:23 AM

Drone is ready for aerial assessment.
```

## Bottom composer

Include:

-   attachment
-   text input
-   emoji
-   microphone
-   send button

## Voice call

Top-right:

``` text
Voice Call
```

For demo implementation, opening a mock call dialog is sufficient.

------------------------------------------------------------------------

# 17. Resources

Route:

``` text
/resources
```

The supplied screenshot shows a resource management table.

## Header

``` text
Resources
Manage and track all available resources
```

Primary button:

``` text
+ Add Resource
```

## Tabs

``` text
All
Equipment
Vehicles
Medical
```

## Table columns

``` text
Resource
Category
Available
In Use
Total
Status
Actions
```

## Demo resources

### Rescue Boat

``` text
Equipment
Available: 2
In Use: 1
Total: 3
Status: In Use
```

### Inflatable Boat

``` text
Equipment
Available: 3
In Use: 0
Total: 3
Status: Available
```

### Drone

``` text
Equipment
Available: 2
In Use: 0
Total: 2
Status: Available
```

### Ambulance

``` text
Vehicles
Available: 1
In Use: 1
Total: 2
Status: In Use
```

### Water Pump

``` text
Equipment
Available: 4
In Use: 0
Total: 4
Status: Available
```

### Life Jacket

``` text
Equipment
Available: 12
In Use: 0
Total: 12
Status: Available
```

## Resource actions

-   View Details
-   Assign
-   Release
-   Edit
-   Mark unavailable
-   Delete

------------------------------------------------------------------------

# 18. Resource Details

Route:

``` text
/resources/:resourceId
```

Show:

-   resource name
-   category
-   quantity
-   available quantity
-   in-use quantity
-   condition
-   current location
-   assigned incident
-   maintenance history
-   last inspection
-   responsible team

------------------------------------------------------------------------

# 19. Medical Support

Route:

``` text
/medical
```

This is a responder-facing module.

Include:

-   nearby hospitals
-   available beds
-   ambulances
-   medical teams
-   blood/medical resource availability
-   patient transport requests
-   emergency medical incidents

Suggested cards:

``` text
Nearby Hospitals
Available Ambulances
Medical Teams
Critical Patients
```

Hospital entries should include:

-   hospital name
-   distance
-   emergency availability
-   estimated travel time
-   beds
-   phone/contact
-   navigation

For demo data, clearly mark entries as simulated.

------------------------------------------------------------------------

# 20. SOS System

SOS is a primary feature.

## 20.1 Global SOS button

The supplied UI includes a persistent emergency card near the bottom of
the sidebar.

Example:

``` text
SOS
Emergency
Help is one tap away

[ Send SOS ]
```

Responder version:

``` text
Emergency SOS
Send immediate alert

[ Activate SOS ]
```

## 20.2 SOS flow

Clicking SOS must open a confirmation/action interface.

Suggested flow:

``` text
1. Confirm emergency
2. Capture current location
3. Select incident type
4. Optional short description
5. Add photo/audio if available
6. Send SOS
7. Show transmission status
```

## 20.3 Offline SOS

If network is unavailable:

``` text
SOS queued for mesh transmission
```

Show:

-   local node ID
-   queue state
-   nearby mesh nodes
-   retry count

When connectivity returns:

``` text
SOS synchronized successfully
```

## 20.4 Emergency states

``` text
Sending
Sent
Mesh Relay
Queued Offline
Acknowledged
Responder Assigned
Resolved
```

------------------------------------------------------------------------

# 21. Mesh Network Simulation

The actual product concept relies on BLE/Wi-Fi mesh.

The frontend should provide a simulation layer.

## Mesh node

``` ts
interface MeshNode {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  status: "online" | "offline" | "degraded";
  signalStrength: number;
  batteryLevel: number;
  connectedNodes: string[];
}
```

## Mesh simulation

Allow the demo to simulate:

-   internet available
-   internet unavailable
-   mesh available
-   mesh degraded
-   total offline
-   reconnection
-   synchronization

## UI indicator

Top bar can show:

``` text
● Connected
```

or

``` text
◐ Mesh Mode
```

or

``` text
! Offline — Queued
```

## Important

Do not fake a real BLE network.

Create an abstraction:

``` ts
interface CommunicationTransport {
  send(message: Message): Promise<SendResult>;
  getStatus(): TransportStatus;
}
```

Implement:

``` text
InternetTransport
MeshSimulationTransport
OfflineQueueTransport
```

Later a native/real mesh adapter can implement the same interface.

------------------------------------------------------------------------

# 22. CRDT / Sync Simulation

The pitch specifies CRDT synchronization.

Frontend architecture should prepare for conflict-free local changes.

Example operation:

``` ts
interface SyncOperation {
  id: string;
  entity: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: unknown;
  timestamp: number;
  deviceId: string;
}
```

Use an operation queue.

Flow:

``` text
Local action
    ↓
Store locally
    ↓
Create sync operation
    ↓
Try network
    ↓
Success → mark synced
    ↓
Failure → keep queued
    ↓
Reconnect
    ↓
Sync queue
```

A complete production CRDT implementation is outside the first frontend
scope unless explicitly required.

------------------------------------------------------------------------

# 23. Security Model

The product pitch mentions **Ed25519 signing**.

The frontend should represent secure message metadata but should not
implement cryptography incorrectly.

Recommended abstraction:

``` ts
interface MessageSigner {
  sign(payload: string): Promise<string>;
  verify(payload: string, signature: string): Promise<boolean>;
}
```

For the frontend demo:

-   use a mock signer
-   clearly isolate it in `services/security`
-   never store private keys in ordinary localStorage
-   never expose private signing material in UI

Production implementation should use a secure backend/native
cryptographic layer.

------------------------------------------------------------------------

# 24. Alerts & Notifications

Route:

``` text
/alerts
```

Global notification bell:

-   show unread count
-   dropdown with latest alerts
-   mark as read
-   mark all as read

Alert priorities:

``` text
Critical
High
Medium
Low
Info
```

Examples:

``` text
Heavy rainfall reported in Kothrud
Team Alpha assigned to incident
Drone assessment started
Flooding detected near Mula River Basin
Power outage reported in Aundh
```

Critical alerts should be visually distinct.

------------------------------------------------------------------------

# 25. Reports & Logs

Route:

``` text
/reports
```

The supplied screenshot calls this **Reports & Logs**.

Header:

``` text
Reports & Logs
View, track and manage all incident reports and activity logs.
```

Primary button:

``` text
+ Create New Report
```

## Tabs

``` text
All
Incident Reports
Activity Logs
```

## Table columns

``` text
Report Title
Date & Time
Location
Submitted By
Status
Actions
```

## Demo reports

### Heavy Rainfall -- Kothrud

``` text
ID: REP-2025-0001
29 May 2025, 09:45 AM
Kothrud, Pune
Siddhi Pawar
Citizen
Submitted
```

### Flooding -- Mula River Basin

``` text
ID: REP-2025-0002
29 May 2025, 08:30 AM
Mula River Basin, Pune
Siddhi Pawar
Citizen
Submitted
```

### Road Blocked -- Chinchwad

``` text
ID: REP-2025-0003
28 May 2025, 07:15 PM
Chinchwad, Pune
Amit Kale
Citizen
Draft
```

### Power Outage -- Aundh

``` text
ID: REP-2025-0004
28 May 2025, 06:00 PM
Aundh, Pune
Siddhi Pawar
Citizen
Submitted
```

### Community Drill -- Baner

``` text
ID: REP-2025-0005
27 May 2025, 10:00 AM
Baner, Pune
Siddhi Pawar
Citizen
Submitted
```

These should be treated as UI seed data, not live records.

------------------------------------------------------------------------

# 26. Activity Logs

Every major operation should create a log event.

Examples:

``` text
Incident created
Incident priority changed
Team assigned
Responder accepted assignment
Resource assigned
SOS sent
SOS acknowledged
Message sent
Report submitted
Incident resolved
Mesh synchronization completed
```

Example model:

``` ts
interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
```

------------------------------------------------------------------------

# 27. Analytics

Route:

``` text
/analytics
```

The pitch identifies KPIs such as:

-   SOS delivery latency
-   mesh uptime
-   response-time reduction
-   pilot-to-contract rate

For the product UI, include operational analytics:

## KPI cards

-   Average response time
-   SOS delivery latency
-   Incidents resolved
-   Active responders
-   Resource utilization
-   Mesh availability

## Charts

### Incidents over time

Line chart.

### Incidents by category

Bar/donut chart.

### Response time

Line/bar chart.

### Incident resolution

Stacked bar or area chart.

### Resource utilization

Bar chart.

------------------------------------------------------------------------

# 28. Search

Global search should be available.

Search across:

-   incidents
-   teams
-   responders
-   resources
-   reports
-   locations

Search result format:

``` text
Incident
Heavy Rainfall
Kothrud, Pune
High Priority
```

``` text
Team
Team Alpha
5 members
Available
```

------------------------------------------------------------------------

# 29. Filters

Reusable filter system.

Filters:

-   priority
-   status
-   category
-   date
-   location
-   assigned team
-   resource
-   distance

Filter components should work consistently across:

-   incidents
-   reports
-   resources
-   teams
-   map

------------------------------------------------------------------------

# 30. Responsive Design

Desktop is the primary reference because the supplied screenshots are
desktop/control-room screens.

Still support:

## Tablet

-   collapsible sidebar
-   two-column layouts become stacked

## Mobile

-   bottom navigation or hamburger
-   SOS button remains highly visible
-   cards become full-width
-   map panel becomes overlay/drawer
-   tables become cards

Emergency functionality must remain usable on small screens.

------------------------------------------------------------------------

# 31. Accessibility

Must support:

-   keyboard navigation
-   visible focus states
-   semantic HTML
-   accessible labels
-   sufficient contrast
-   screen-reader labels for icons
-   confirmation for destructive operations
-   no color-only status communication

SOS should have:

-   accessible label
-   keyboard support
-   confirmation step
-   clear success/failure feedback

------------------------------------------------------------------------

# 32. Animations

Use subtle animations only.

Allowed:

-   card hover
-   modal fade
-   drawer slide
-   toast
-   notification pulse
-   map marker pulse for critical incident

Avoid:

-   excessive page transitions
-   distracting continuous animation
-   large loading animations

Emergency alerts may use a short pulse but must not cause visual
overload.

------------------------------------------------------------------------

# 33. Component Library

Build reusable components.

## Layout

``` text
AppShell
Sidebar
TopBar
PageHeader
Breadcrumbs
ResponsiveSidebar
```

## Cards

``` text
StatCard
IncidentCard
TeamCard
ResourceCard
AlertCard
ReportCard
```

## Data

``` text
DataTable
StatusBadge
PriorityBadge
EmptyState
LoadingState
ErrorState
```

## Forms

``` text
SearchInput
FilterDropdown
DateRangePicker
Select
Textarea
FileUpload
```

## Emergency

``` text
SOSButton
SOSCard
SOSModal
EmergencyBanner
ConnectionStatus
MeshStatus
```

## Maps

``` text
IncidentMarker
ResponderMarker
ResourceMarker
MapLegend
MapControls
LayerControl
IncidentMapPanel
```

## Communication

``` text
TeamMemberList
ChatMessage
ChatComposer
VoiceCallDialog
```

------------------------------------------------------------------------

# 34. State Management

Use Zustand for global client state.

Suggested stores:

``` text
authStore
incidentStore
teamStore
resourceStore
alertStore
communicationStore
meshStore
sosStore
uiStore
```

Do not put every local UI state into Zustand.

Use component state for:

-   modal open/close
-   temporary form values
-   local dropdown state

Use TanStack Query for remote/server state if a backend is added.

------------------------------------------------------------------------

# 35. TypeScript Domain Models

## Incident

``` ts
type IncidentPriority = "high" | "medium" | "low";

type IncidentStatus =
  | "reported"
  | "verified"
  | "assigned"
  | "en-route"
  | "on-site"
  | "in-progress"
  | "resolved"
  | "closed"
  | "cancelled";

interface Incident {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  locationName: string;
  reportedAt: string;
  reportedBy: string;
  peopleAffected: number;
  distanceKm?: number;
  assignedTeamId?: string;
  assignedResponderIds?: string[];
}
```

## Team

``` ts
type TeamStatus =
  | "available"
  | "assigned"
  | "en-route"
  | "on-site"
  | "busy"
  | "offline";

interface Team {
  id: string;
  name: string;
  memberIds: string[];
  specialties: string[];
  status: TeamStatus;
  latitude: number;
  longitude: number;
  currentIncidentId?: string;
}
```

## Responder

``` ts
interface Responder {
  id: string;
  name: string;
  role: string;
  teamId?: string;
  status: "available" | "busy" | "offline";
  phone?: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
}
```

## Resource

``` ts
interface Resource {
  id: string;
  name: string;
  category: "equipment" | "vehicle" | "medical";
  available: number;
  inUse: number;
  total: number;
  status: "available" | "in-use" | "unavailable";
  location?: string;
  assignedIncidentId?: string;
}
```

## Report

``` ts
interface Report {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  submittedBy: string;
  submitterRole: string;
  status: "submitted" | "draft" | "reviewed" | "archived";
  category: string;
}
```

## Alert

``` ts
interface Alert {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low" | "info";
  createdAt: string;
  read: boolean;
  location?: string;
  incidentId?: string;
}
```

------------------------------------------------------------------------

# 36. Mock Data Requirements

The first version must run without a backend.

Create realistic seeded data.

Minimum:

``` text
12+ incidents
6+ teams
10+ responders
6+ resources
5+ reports
10+ alerts
5+ mesh nodes
```

Include Pune locations.

Use consistent coordinates.

Do not generate random data on every page load because relationships
will break.

Seed deterministic data.

------------------------------------------------------------------------

# 37. Demo Scenario

The app should support a complete demonstration.

## Scenario

### Step 1 --- Heavy rainfall

A high-priority rainfall incident is created in Kothrud.

### Step 2 --- Incident appears

It appears:

-   on dashboard
-   on map
-   incidents list
-   alert center

### Step 3 --- Triage

Control room opens incident.

They see:

``` text
12 people affected
High Priority
Kothrud, Pune
```

### Step 4 --- Team assignment

Open:

``` text
Assign Team
```

Team Alpha is recommended because it is nearby and available.

### Step 5 --- Assignment

Click:

``` text
Assign to Incident
```

System updates:

-   incident → assigned
-   team → assigned
-   responder notifications
-   activity log
-   map

### Step 6 --- Communication

Team Alpha receives a message.

Responder replies:

``` text
We are 2 km away from the site.
Moving in 5 minutes.
```

### Step 7 --- Drone

Drone operator starts aerial assessment.

### Step 8 --- Resource

A rescue boat is assigned.

### Step 9 --- Incident resolution

Team updates:

``` text
On Site
→ In Progress
→ Resolved
```

### Step 10 --- Report

System generates/updates an incident report.

This should demonstrate the entire ecosystem.

------------------------------------------------------------------------

# 38. Offline Demo Scenario

The product must demonstrate why ResQMesh is different.

## Step 1

Turn off simulated internet.

Top bar:

``` text
Offline — Mesh Mode
```

## Step 2

Citizen presses:

``` text
Send SOS
```

## Step 3

SOS becomes:

``` text
Queued for Mesh Relay
```

## Step 4

Simulated mesh node receives it.

Status:

``` text
Mesh Relay 1/3
```

## Step 5

Control room receives the event.

## Step 6

Internet returns.

Queued events synchronize.

Status:

``` text
Synced
```

This is a crucial product demonstration.

------------------------------------------------------------------------

# 39. Navigation Map

## Admin

``` text
/dashboard
/incidents
/incidents/:id
/incidents/:id/assign
/map
/teams
/teams/:id
/communication
/resources
/resources/:id
/medical
/reports
/analytics
/alerts
/settings
/profile
```

## Responder

``` text
/dashboard
/incidents
/map
/team
/resources
/medical
/reports
/settings
/profile
```

## Citizen

``` text
/home
/sos
/incidents/report
/alerts
/shelters
/profile
```

------------------------------------------------------------------------

# 40. Routing Rules

Use React Router.

Protected routes:

``` text
<Route element={<ProtectedRoute />}>
```

Role protection:

``` text
<RequireRole roles={["admin", "control-room"]}>
```

Unknown route:

``` text
404 Not Found
```

Unauthorized:

``` text
403 Access Denied
```

------------------------------------------------------------------------

# 41. Authentication

For demo:

-   login screen
-   mock users
-   role selection

Example users:

``` text
Admin User
Role: Administrator

Priya Sharma
Role: Control Room

Rahul Patil
Role: Responder

Siddhi Pawar
Role: Citizen
```

Use mock authentication initially.

Architecture should allow replacement with:

-   Supabase Auth
-   Auth0
-   custom JWT backend

without rewriting the UI.

------------------------------------------------------------------------

# 42. Settings

Route:

``` text
/settings
```

Sections:

## Account

-   name
-   email
-   phone
-   profile photo

## Notifications

-   critical alerts
-   incident assignment
-   team messages
-   report updates

## Emergency

-   location sharing
-   SOS preferences
-   emergency contact

## Connectivity

-   offline mode
-   mesh mode
-   sync behavior

## Appearance

-   light mode
-   compact mode

The reference design is primarily light mode.

------------------------------------------------------------------------

# 43. Profile

Route:

``` text
/profile
```

Show:

-   avatar
-   name
-   role
-   location
-   contact information
-   team
-   availability
-   recent activity

------------------------------------------------------------------------

# 44. Error Handling

Every major feature must have:

## Loading

Skeleton UI.

## Empty

Example:

``` text
No active incidents
Everything looks clear.
```

## Error

Example:

``` text
Unable to load incidents.
Try again.
```

## Offline

Example:

``` text
You're offline.
Changes will be synchronized when connectivity returns.
```

------------------------------------------------------------------------

# 45. Toast Messages

Use concise messages.

Examples:

``` text
Team Alpha assigned successfully.
```

``` text
SOS sent successfully.
```

``` text
SOS queued for mesh transmission.
```

``` text
Incident status updated.
```

``` text
Resource assigned.
```

``` text
Report submitted.
```

``` text
Changes synchronized.
```

------------------------------------------------------------------------

# 46. Tables and Pagination

Use reusable table component.

Requirements:

-   sorting
-   pagination
-   filtering
-   row actions
-   responsive fallback

For demo:

``` text
10–25 items per page
```

------------------------------------------------------------------------

# 47. Map Interaction Requirements

The map must support:

-   click marker
-   hover marker
-   selected marker
-   marker clustering
-   zoom
-   pan
-   current location
-   filtering
-   layers

Clicking a marker should:

1.  select incident
2.  open detail panel
3.  highlight marker
4.  update selected incident state

------------------------------------------------------------------------

# 48. Emergency Priority Rules

Use a clear visual hierarchy.

## Critical

Examples:

-   trapped people
-   major flood
-   structural collapse
-   missing people
-   medical emergency

Visual:

-   red
-   high visibility
-   notification sound optional

## High

Examples:

-   heavy rainfall
-   active flooding
-   major accident

## Medium

Examples:

-   road blockage
-   localized hazard

## Low

Examples:

-   power outage
-   non-critical infrastructure report

------------------------------------------------------------------------

# 49. AI / Simulation Engine

The pitch describes a **Simulation & Sync Engine** as the core brain.

The frontend should expose AI-ready interfaces.

Possible future capabilities:

-   incident severity classification
-   responder recommendation
-   resource recommendation
-   route optimization
-   incident clustering
-   flood-risk prediction
-   demand forecasting
-   response-time prediction

For initial implementation:

Create:

``` ts
interface ResponseRecommendation {
  incidentId: string;
  recommendedTeamId?: string;
  recommendedResources: string[];
  reason: string;
  confidence: number;
}
```

Example:

``` text
Recommended Team: Team Alpha

Reason:
Closest available team with ambulance and first-aid capability.

Confidence:
92%
```

Do not present fabricated AI accuracy as a real model metric. Clearly
label simulated recommendations as demo/AI simulation.

------------------------------------------------------------------------

# 50. Robotics / Drone Module

The pitch positions:

-   Drone-as-a-Service
-   Robot-as-a-Service

The frontend should be prepared to represent these.

## Drone

Display:

-   drone ID
-   status
-   battery
-   location
-   mission
-   altitude
-   operator
-   live feed placeholder

Statuses:

``` text
Available
Preparing
Dispatched
In Flight
Returning
Offline
```

## Robot

Display:

-   robot ID
-   status
-   battery
-   mission
-   location
-   operator
-   payload

The initial implementation may use simulated telemetry.

------------------------------------------------------------------------

# 51. Shelter Module

Even if not shown in the supplied screenshots, the pitch includes the
disaster lifecycle:

``` text
SOS → Triage → Dispatch → Shelter → Cloud Sync
```

Prepare the data model and route for future shelter support.

Shelter fields:

``` ts
interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  facilities: string[];
  status: "open" | "full" | "closed";
}
```

------------------------------------------------------------------------

# 52. API Service Layer

Do not call APIs directly from UI components.

Use:

``` text
services/api/
```

Example:

``` ts
incidentService.getIncidents()
incidentService.getIncident(id)
incidentService.createIncident(data)
incidentService.updateIncident(id, data)
incidentService.assignTeam(id, teamId)

teamService.getTeams()
resourceService.getResources()
alertService.getAlerts()
reportService.getReports()
```

Start with mock implementations.

------------------------------------------------------------------------

# 53. Mock API

Implement a small artificial API layer.

Example:

``` ts
const mockDelay = (ms = 400) =>
  new Promise(resolve => setTimeout(resolve, ms));
```

Each service should:

-   simulate latency
-   return typed data
-   simulate occasional errors if demo mode is enabled

Do not place `setTimeout` logic inside page components.

------------------------------------------------------------------------

# 54. Real-Time Simulation

Use a mock event emitter.

Events:

``` text
INCIDENT_CREATED
INCIDENT_UPDATED
TEAM_LOCATION_UPDATED
TEAM_STATUS_UPDATED
RESOURCE_UPDATED
ALERT_CREATED
MESSAGE_RECEIVED
SOS_RECEIVED
SYNC_COMPLETED
```

Example:

``` ts
eventBus.emit("INCIDENT_CREATED", incident);
```

The UI should update automatically when these events fire.

------------------------------------------------------------------------

# 55. Notification Simulation

Every important event should be able to generate a notification.

Example:

``` text
Heavy Rainfall
High priority incident reported in Kothrud.
```

Notification count increments.

Clicking notification navigates to the related entity.

------------------------------------------------------------------------

# 56. Local Persistence

Use IndexedDB for:

-   offline incidents
-   SOS queue
-   sync operations
-   user preferences
-   draft reports
-   recent messages

localStorage is acceptable for:

-   theme
-   mock authentication
-   simple preferences

Do not use localStorage as the only offline data store.

------------------------------------------------------------------------

# 57. PWA Requirements

Prepare:

-   manifest
-   service worker
-   app icons
-   offline fallback
-   installability

Manifest:

``` text
name: ResQMesh
short_name: ResQMesh
display: standalone
theme_color: primary blue
background_color: white
```

------------------------------------------------------------------------

# 58. UI Details From Supplied Screenshots

The screenshots should be treated as visual acceptance references.

## Screenshot A --- Map View

Key details to reproduce:

-   white left sidebar
-   ResQMesh logo at top
-   highlighted Map View item
-   large map center
-   top search
-   Layers button
-   notification bell
-   profile dropdown
-   right Active Incidents panel
-   bottom selected incident panel
-   bottom KPI row
-   persistent SOS card in sidebar
-   floating map controls

## Screenshot B --- Incidents

Key details:

-   clean white page
-   sidebar
-   large "Incidents" heading
-   subtitle
-   search
-   filter
-   priority tabs
-   large horizontal incident cards
-   colored priority backgrounds
-   location/time/people/distance metadata
-   right arrow

## Screenshot C --- Resources

Key details:

-   title "Resources"
-   subtitle
-   tabs
-   blue Add Resource button
-   large table
-   resource icons
-   availability numbers
-   status badges
-   View Details buttons
-   kebab actions

## Screenshot D --- Reports & Logs

Key details:

-   title
-   subtitle
-   Create New Report button
-   tabs
-   table
-   report icon
-   title + report ID
-   date/time
-   location
-   submitted by
-   role
-   status
-   action menu

## Screenshot E --- Assign Team

Key details:

-   title "Assign Team"
-   subtitle
-   search
-   Nearby Teams section
-   Available Responders section
-   team cards
-   availability badge
-   distance
-   responder avatars
-   phone icons
-   large bottom "Assign to Incident" button

## Screenshot F --- Team Communication

Key details:

-   team list on left
-   member search
-   online status
-   central chat
-   message bubbles
-   voice call button
-   attachment/emoji/microphone controls
-   send button

## Screenshot G/H --- Responder Sidebar

Responder navigation includes:

``` text
Dashboard
Incidents
Map View
Team
Resources
Medical Support
Reports & Logs
Settings
Profile
```

The responder sidebar should also show a prominent Emergency SOS action.

------------------------------------------------------------------------

# 59. Logo

Use a ResQMesh logo placeholder if no official asset is available.

Do not redraw copyrighted/unknown logo assets inaccurately.

Recommended:

``` text
/assets/resqmesh-logo.svg
```

If no asset exists, create a simple temporary wordmark:

``` text
ResQMesh
```

with a network/mesh icon.

Keep logo usage centralized in:

``` text
components/layout/Brand.tsx
```

so it can easily be replaced.

------------------------------------------------------------------------

# 60. Iconography

Use Lucide React.

Recommended icons:

``` text
Dashboard       Home
Incidents       Bell
Map             Map
Team            Users
Resources       BriefcaseMedical / Package
Medical         Cross / Hospital
Reports         FileText
Analytics       BarChart3
Messages        MessageSquare
Settings        Settings
Profile         User
SOS             TriangleAlert / Siren
Search          Search
Layers          Layers3
Location        MapPin
Call            Phone
Send            Send
```

------------------------------------------------------------------------

# 61. Forms

All forms must have:

-   labels
-   validation
-   error state
-   submit state
-   success feedback

Incident report fields:

``` text
Incident Type
Title
Description
Location
Current Location
Priority
People Affected
Attachments
```

Resource fields:

``` text
Resource Name
Category
Total Quantity
Location
Status
Condition
```

Team fields:

``` text
Team Name
Members
Specialties
Base Location
Status
```

------------------------------------------------------------------------

# 62. Security & Privacy

Because this is an emergency platform:

-   minimize stored personal information
-   do not expose private responder data unnecessarily
-   protect admin-only routes
-   validate all inputs
-   avoid unsafe HTML rendering
-   never log sensitive SOS payloads to console in production
-   use HTTPS in production
-   use secure authentication
-   encrypt sensitive data at rest where required
-   audit emergency actions

For the demo, clearly distinguish:

``` text
SIMULATED
```

from real emergency infrastructure.

------------------------------------------------------------------------

# 63. Performance

Target:

-   fast initial load
-   lazy-load heavy pages
-   lazy-load map libraries
-   virtualize long lists if required
-   avoid unnecessary global state updates
-   debounce search
-   memoize expensive map computations
-   paginate tables

The map should not block the entire application while loading.

------------------------------------------------------------------------

# 64. Testing

Use:

-   Vitest
-   React Testing Library
-   Playwright

## Unit tests

Test:

-   priority helpers
-   incident filtering
-   team recommendation
-   resource availability
-   status transitions
-   SOS queue
-   sync queue

## Component tests

Test:

-   SOS button
-   incident card
-   status badge
-   data table
-   assignment modal
-   notification dropdown

## E2E

Critical journey:

``` text
Login
→ Dashboard
→ Open incident
→ Assign team
→ Send message
→ Assign resource
→ Update incident
→ Resolve incident
→ View report
```

Offline journey:

``` text
Offline
→ Send SOS
→ Queue SOS
→ Enable mesh
→ Receive SOS
→ Reconnect
→ Sync
```

------------------------------------------------------------------------

# 65. Status Transition Rules

Do not allow arbitrary transitions.

Recommended:

``` text
reported
  ↓
verified
  ↓
assigned
  ↓
en-route
  ↓
on-site
  ↓
in-progress
  ↓
resolved
  ↓
closed
```

Alternative:

``` text
reported → cancelled
verified → cancelled
assigned → cancelled
```

Only admin/control room should be able to force-close incidents.

------------------------------------------------------------------------

# 66. Resource Allocation Rules

Never allow:

``` text
available < 0
```

When resource assigned:

``` text
available -= quantity
inUse += quantity
```

When released:

``` text
available += quantity
inUse -= quantity
```

Validate:

``` text
0 <= available <= total
0 <= inUse <= total
available + inUse <= total
```

------------------------------------------------------------------------

# 67. Team Assignment Rules

A team cannot be assigned to multiple incompatible active incidents.

If busy:

``` text
Team unavailable
```

If available:

``` text
Assign
```

After assignment:

``` text
Available → Assigned
```

After dispatch:

``` text
Assigned → En Route
```

------------------------------------------------------------------------

# 68. UX Principle

Every screen should answer:

1.  **What is happening?**
2.  **Where is it happening?**
3.  **How serious is it?**
4.  **Who is responding?**
5.  **What resources are available?**
6.  **What should I do next?**

The UI must prioritize operational clarity over decorative design.

------------------------------------------------------------------------

# 69. Command Center Information Hierarchy

Priority order:

``` text
1. Critical emergency
2. High-priority incidents
3. Responder availability
4. Resource availability
5. Location/map
6. Communication
7. Reports/analytics
```

The most urgent action should always be visually obvious.

------------------------------------------------------------------------

# 70. Empty States

Examples:

## No incidents

``` text
No active incidents
There are currently no active incidents in your area.
```

## No resources

``` text
No resources found
Try changing your filters.
```

## No messages

``` text
No messages yet
Start a conversation with your team.
```

## No alerts

``` text
You're all caught up
No new emergency alerts.
```

------------------------------------------------------------------------

# 71. Loading Skeletons

Use skeletons matching actual layout.

Do not show a full-page spinner for every request.

For example:

-   incident cards → card skeletons
-   resource table → row skeletons
-   dashboard KPIs → small skeletons
-   map → map placeholder with loading state

------------------------------------------------------------------------

# 72. Notification Severity UI

Critical:

``` text
red icon + red accent + strong text
```

High:

``` text
red/pink accent
```

Medium:

``` text
amber accent
```

Low:

``` text
blue/green accent
```

Info:

``` text
gray/blue accent
```

------------------------------------------------------------------------

# 73. Demo Mode

Add a development/demo mode.

Potential toggle:

``` text
Demo Mode: ON
```

Demo mode can:

-   generate incidents
-   move responders
-   change team status
-   simulate SOS
-   simulate offline mode
-   simulate sync
-   generate notifications

This is useful for presenting the project without real emergency
integrations.

------------------------------------------------------------------------

# 74. Suggested Demo Controls

A small development-only panel:

``` text
Simulation Controls

[ Create High Priority Incident ]
[ Simulate SOS ]
[ Go Offline ]
[ Enable Mesh ]
[ Reconnect ]
[ Dispatch Drone ]
[ Move Team Alpha ]
[ Resolve Selected Incident ]
```

Hide in production builds.

------------------------------------------------------------------------

# 75. Deployment

Frontend:

-   Vercel
-   Netlify
-   Cloudflare Pages
-   static hosting

Backend, if implemented:

-   Railway
-   Render
-   AWS
-   GCP
-   Azure

Database:

-   PostgreSQL

Production architecture:

``` text
React PWA
    |
    v
API Gateway
    |
    +------ PostgreSQL
    |
    +------ Redis
    |
    +------ WebSocket Service
    |
    +------ AI/Simulation Service
    |
    +------ Mesh Gateway
    |
    +------ Drone/Robot Gateway
```

------------------------------------------------------------------------

# 76. Environment Variables

Example:

``` env
VITE_API_URL=
VITE_MAP_STYLE_URL=
VITE_MAP_TILE_URL=
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_MESH_SIMULATION=true
```

Never commit secrets.

------------------------------------------------------------------------

# 77. README Requirements

The project README should explain:

-   project purpose
-   features
-   architecture
-   tech stack
-   installation
-   development
-   environment variables
-   demo users
-   offline simulation
-   map setup
-   testing
-   production considerations

------------------------------------------------------------------------

# 78. Coding Standards

Use:

-   strict TypeScript
-   ESLint
-   Prettier
-   meaningful variable names
-   small components
-   feature-oriented architecture
-   no giant page components
-   no duplicated business logic
-   no inline magic constants
-   no `any` unless unavoidable
-   typed service responses

Prefer:

``` ts
const incidents = await incidentService.getIncidents();
```

over:

``` ts
fetch("/api/incidents").then(...)
```

inside components.

------------------------------------------------------------------------

# 79. Component Design Rule

A page should compose features.

Bad:

``` text
DashboardPage.tsx
  1500+ lines
```

Good:

``` text
DashboardPage
├── DashboardHeader
├── KPIGrid
├── IncidentOverview
├── LiveMapPreview
├── ActiveAlerts
└── ResponseTimeline
```

------------------------------------------------------------------------

# 80. UX for Emergency Actions

Emergency actions must be:

-   obvious
-   fast
-   reversible where appropriate
-   clearly confirmed
-   visually distinct

Never hide SOS behind a normal menu.

The sidebar SOS card should remain visible on desktop.

On mobile, provide a fixed emergency action.

------------------------------------------------------------------------

# 81. Data Relationship Model

Basic relationship:

``` text
User
 ├── Team
 ├── Incidents reported
 └── Reports

Team
 ├── Responders
 ├── Resources
 └── Incidents

Incident
 ├── Reporter
 ├── Team
 ├── Responders
 ├── Resources
 ├── Alerts
 └── Reports

Resource
 └── Incident

Alert
 └── Incident

Report
 └── Incident
```

------------------------------------------------------------------------

# 82. Suggested File-Level Breakdown

``` text
src/
├── App.tsx
├── main.tsx
│
├── app/
│   ├── router.tsx
│   └── providers.tsx
│
├── layouts/
│   ├── AppLayout.tsx
│   └── AuthLayout.tsx
│
├── components/
│   ├── Brand.tsx
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── SOSCard.tsx
│   ├── NotificationBell.tsx
│   ├── ProfileMenu.tsx
│   └── ConnectionStatus.tsx
│
├── pages/
│   ├── DashboardPage.tsx
│   ├── IncidentsPage.tsx
│   ├── IncidentDetailsPage.tsx
│   ├── AssignTeamPage.tsx
│   ├── MapPage.tsx
│   ├── TeamsPage.tsx
│   ├── TeamDetailsPage.tsx
│   ├── CommunicationPage.tsx
│   ├── ResourcesPage.tsx
│   ├── ResourceDetailsPage.tsx
│   ├── MedicalPage.tsx
│   ├── ReportsPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── AlertsPage.tsx
│   ├── SettingsPage.tsx
│   └── ProfilePage.tsx
│
├── features/
│   ├── incidents/
│   ├── teams/
│   ├── resources/
│   ├── map/
│   ├── sos/
│   ├── communication/
│   ├── reports/
│   ├── alerts/
│   └── analytics/
│
├── services/
│   ├── api/
│   ├── mock/
│   ├── mesh/
│   ├── sync/
│   └── security/
│
├── stores/
│   ├── authStore.ts
│   ├── incidentStore.ts
│   ├── teamStore.ts
│   ├── resourceStore.ts
│   ├── alertStore.ts
│   ├── meshStore.ts
│   └── sosStore.ts
│
├── types/
│   ├── incident.ts
│   ├── team.ts
│   ├── resource.ts
│   ├── alert.ts
│   ├── report.ts
│   └── mesh.ts
│
├── data/
│   ├── incidents.ts
│   ├── teams.ts
│   ├── responders.ts
│   ├── resources.ts
│   ├── reports.ts
│   └── alerts.ts
│
└── lib/
    ├── utils.ts
    ├── geo.ts
    └── constants.ts
```

------------------------------------------------------------------------

# 83. Implementation Phases

## Phase 1 --- Foundation

Build:

-   Vite
-   React
-   TypeScript
-   Tailwind
-   routing
-   layout
-   sidebar
-   top bar
-   theme
-   mock auth

## Phase 2 --- Core Incident System

Build:

-   dashboard
-   incidents
-   incident details
-   status transitions
-   alerts

## Phase 3 --- Map

Build:

-   interactive Pune map
-   markers
-   clustering
-   layers
-   selected incident panel

## Phase 4 --- Teams

Build:

-   team list
-   responders
-   assignment
-   communication

## Phase 5 --- Resources

Build:

-   resource list
-   resource details
-   allocation

## Phase 6 --- Reports & Analytics

Build:

-   reports
-   activity logs
-   charts

## Phase 7 --- SOS + Offline

Build:

-   SOS flow
-   IndexedDB
-   offline queue
-   mesh simulation
-   sync

## Phase 8 --- Robotics / AI Simulation

Build:

-   drone states
-   robot states
-   recommendations
-   simulated telemetry

## Phase 9 --- Polish

Build:

-   responsive
-   accessibility
-   loading states
-   error states
-   animations
-   tests
-   PWA

------------------------------------------------------------------------

# 84. Definition of Done

The project is considered complete when:

-   [ ] React + TypeScript app runs locally
-   [ ] All main routes work
-   [ ] Desktop UI closely matches supplied screenshots
-   [ ] Sidebar/navigation works
-   [ ] Dashboard works
-   [ ] Incidents list works
-   [ ] Incident details work
-   [ ] Map works
-   [ ] Team assignment works
-   [ ] Team communication works
-   [ ] Resources work
-   [ ] Reports work
-   [ ] Alerts work
-   [ ] SOS flow works
-   [ ] Offline mode works
-   [ ] Mesh simulation works
-   [ ] Sync queue works
-   [ ] Role-based navigation works
-   [ ] Responsive design works
-   [ ] Loading/error/empty states exist
-   [ ] TypeScript is strict
-   [ ] No major console errors
-   [ ] Demo data is consistent
-   [ ] Critical demo flow works end-to-end

------------------------------------------------------------------------

# 85. Visual Acceptance Checklist

The agent must compare the implementation against the supplied
screenshots.

## Map

-   [ ] Sidebar width and spacing are similar
-   [ ] Map occupies central majority of screen
-   [ ] Active incident panel is on right
-   [ ] Search is top-center
-   [ ] Layers control exists
-   [ ] Notification/profile are top-right
-   [ ] SOS card is visible
-   [ ] Bottom incident detail panel exists
-   [ ] KPI cards exist

## Incidents

-   [ ] Page title and subtitle
-   [ ] Tabs
-   [ ] Search/filter
-   [ ] Horizontal incident cards
-   [ ] Colored priority backgrounds
-   [ ] Metadata alignment
-   [ ] Right arrow

## Resources

-   [ ] Table
-   [ ] Category tabs
-   [ ] Add Resource button
-   [ ] Availability numbers
-   [ ] Status badges
-   [ ] View Details actions

## Reports

-   [ ] Reports & Logs heading
-   [ ] Tabs
-   [ ] Create New Report
-   [ ] Report table
-   [ ] Status
-   [ ] Submitted by

## Assign Team

-   [ ] Nearby Teams
-   [ ] Available Responders
-   [ ] Distance
-   [ ] Availability
-   [ ] Phone action
-   [ ] Large Assign button

## Communication

-   [ ] Member list
-   [ ] Chat
-   [ ] Message bubbles
-   [ ] Voice Call
-   [ ] Composer
-   [ ] Send button

------------------------------------------------------------------------

# 86. Important Product Positioning

ResQMesh is not just an incident dashboard.

The product should be presented architecturally as:

``` text
Emergency SOS
      +
Offline Mesh
      +
Incident Intelligence
      +
Responder Coordination
      +
Resource Management
      +
Drone / Robotics
      +
Cloud Synchronization
```

The pitch explicitly positions the platform against fragmented solutions
where:

-   messaging exists separately
-   alerting exists separately
-   robotics exists separately

ResQMesh's differentiation is the unified ecosystem.

------------------------------------------------------------------------

# 87. Competitive Context

The pitch names examples of adjacent solutions:

``` text
Bridgefy / goTenna → messaging
Everbridge / Sachet → alerting
Skydio / Zipline → robotics
```

The intended ResQMesh edge is:

``` text
Mesh communication
+
CAP-compliant alerting
+
Triage
+
Resource coordination
+
Robotics response
+
Synchronization
```

Do not copy competitors' branding or UI.

Use these only as conceptual competitive context.

------------------------------------------------------------------------

# 88. Business Model Context

The pitch describes potential revenue through:

-   municipal SaaS
-   NGO subscriptions
-   event safety-as-a-service
-   drones-as-a-service
-   robotics-as-a-service
-   infrastructure monitoring AMC
-   hardware
-   API marketplace
-   white-label licensing

This does not need to be deeply exposed in the operational UI, but the
architecture should be extensible for multi-tenant organizations.

------------------------------------------------------------------------

# 89. Multi-Tenant Readiness

Future organization model:

``` text
Organization
 ├── Users
 ├── Teams
 ├── Resources
 ├── Incidents
 ├── Reports
 └── Settings
```

Each record should eventually support:

``` text
organizationId
```

Do not hard-code the application to one organization.

------------------------------------------------------------------------

# 90. Future Integrations

Architecture should allow future integrations with:

-   government emergency systems
-   telecom providers
-   insurers
-   municipal command centers
-   hospital systems
-   drone APIs
-   robotics APIs
-   weather APIs
-   GIS systems
-   CAP-compliant alert systems

These should be adapters/services rather than tightly coupled UI logic.

------------------------------------------------------------------------

# 91. CAP / Emergency Alert Readiness

The pitch mentions CAP-compliant alerting.

Prepare an alert model with fields such as:

``` ts
interface EmergencyAlert {
  id: string;
  identifier: string;
  sender: string;
  sentAt: string;
  status: string;
  messageType: string;
  scope: "Public" | "Restricted" | "Private";
  event: string;
  urgency: string;
  severity: string;
  certainty: string;
  headline: string;
  description: string;
  instruction?: string;
  area?: string;
}
```

A production CAP adapter can later map this to the backend.

------------------------------------------------------------------------

# 92. Geo Utilities

Create utility functions:

``` ts
calculateDistanceKm(lat1, lon1, lat2, lon2)
calculateBearing(...)
formatDistance(...)
formatETA(...)
```

Use Haversine distance for the frontend demo.

Do not use fake distance strings if coordinates are available.

------------------------------------------------------------------------

# 93. Time Utilities

Display human-friendly values:

``` text
10 min ago
25 min ago
1 hr ago
```

But retain ISO timestamps internally.

Use a consistent date/time library if necessary.

------------------------------------------------------------------------

# 94. Demo Seed Locations

Use realistic Pune-area coordinates for:

-   Kothrud
-   Aundh
-   Baner
-   Hadapsar
-   Kondhwa
-   Chinchwad
-   Pimple Saudagar
-   Mula-Mutha River Basin
-   Hinjawadi
-   Shivajinagar
-   Kharadi
-   NIBM

The UI should feel geographically coherent.

------------------------------------------------------------------------

# 95. Final Agent Instructions

When an AI coding agent receives this `project.md`, it should follow
these rules:

1.  **Build the application in React + TypeScript.**
2.  **Use the screenshots as the primary visual reference.**
3.  **Use this document as the functional reference.**
4.  **Do not assume the original source code exists.**
5.  **Use mock services first.**
6.  **Keep service interfaces clean so real APIs can replace mocks.**
7.  **Make the application fully navigable.**
8.  **Do not create static screenshots pretending to be a functioning
    app.**
9.  **All buttons shown in the UI should perform a meaningful action.**
10. **Use deterministic demo data.**
11. **Implement state changes across related screens.**
12. **Make SOS and offline behavior a first-class feature.**
13. **Do not claim simulated mesh/AI/robotics behavior is real hardware
    functionality.**
14. **Keep the UI polished and close to the supplied references.**
15. **Prioritize emergency information hierarchy and usability.**
16. **Use strict TypeScript and reusable components.**
17. **Do not put API logic directly inside visual components.**
18. **Prepare the application for future backend, mesh, AI, drone, and
    robotics integrations.**
19. **Test the complete incident → assignment → communication → resource
    → resolution workflow.**
20. **Test the offline SOS → mesh queue → reconnect → sync workflow.**

------------------------------------------------------------------------

# 96. Short Product Summary for Agents

If the agent needs the entire project in one paragraph:

**ResQMesh is a disaster-management command and emergency-SOS ecosystem
that allows citizens to send emergency alerts, responders to communicate
and coordinate, authorities to monitor incidents on a live map, assign
nearby teams, manage rescue resources, handle medical support, generate
reports, and operate in degraded/offline connectivity through a
mesh-first architecture with queued synchronization. The application
should be implemented as a polished React + TypeScript control-room PWA
matching the supplied ResQMesh screenshots, with responsive dashboards,
incident cards/tables, Pune map visualization, team assignment, team
chat, resources, reports, alerts, SOS, offline/mesh simulation, AI
recommendation simulation, and future-ready drone/robotics
integrations.**

------------------------------------------------------------------------

# 97. Source / Reference Material

The product concept is based on the supplied **ResQMesh --- RDMP** pitch
deck.

Important source-derived points include:

-   Emergency-SOS Ecosystem-as-a-Service positioning
-   Cellular/power failure problem
-   Assam flood example
-   SOSnap + Respond App + Simulation & Sync Engine
-   BLE/Wi-Fi mesh
-   CRDT synchronization
-   Ed25519 signing
-   SOS → Triage → Dispatch → Shelter → Cloud Sync lifecycle
-   Drone-as-a-Service
-   Robot-as-a-Service
-   Municipal/NGO SaaS
-   Resource/incident coordination
-   Competition/differentiation against separate messaging, alerting,
    and robotics systems

The supplied UI screenshots are the visual design reference for the
application.

------------------------------------------------------------------------

# 98. End Goal

The final result should feel like a **real emergency operations
platform**, not a college CRUD project.

The user should be able to enter the application and immediately
understand:

> **What emergencies are happening, where they are happening, how severe
> they are, which teams are responding, what resources are available,
> how responders are communicating, and whether the system can continue
> operating when connectivity fails.**

That is the core experience of **ResQMesh**.
