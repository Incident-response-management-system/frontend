# Project Implementation Tasks: IRMS Next.js App

This document outlines the division of implementation tasks between **SAMKIEL** and **Tobi (Co-Developer)** for the Next.js frontend (integrating with a remote backend URL).

---

## 👤 SAMKIEL — Core Operations (More agency features)

### Phase 1: Architecture & Foundations
- `[x]` Scaffold Next.js 16 application structure (pages, components, styles, middleware).
- `[x]` Configure TailwindCSS & `shadcn/ui` theme variables (Warm Cream, Deep Ink, Dashboard Paper, and semantic states).
- `[x]` Setup Axios / Fetch clients with custom configurations for the remote Backend URL.
- `[x]` Secure agency routing using Next.js Middleware.

### Phase 2: Core Map Component & Pin Drop Hook
- `[x]` Implement base Map component using Leaflet.
- `[x]` Construct dynamic incident map marker graphics based on status state rules.
- `[x]` Implement standard map interaction event boundaries (click-to-place-pin, dynamic custom HTML markers).

### Phase 3: Agency Operations Dashboard
- `[x]` **Overview Tab:** Setup stats strip with daily Comparative Deltas and Bezier sparkline charts.
- `[x]` **Map Tab:** Build dispatcher map view to visualize all live coordinate markers within their radius.
- `[x]` **Reports Tab:** Set up the global operations queue with search, pagination, and multi-field filters.
- `[x]` **Incident Detail Panel:** Design the sliding case assessment side-drawer, assignee routes, and status dropdowns.

### Phase 4: Live Event Handlers
- `[x]` Integrate WebSockets/Pusher to handle real-time incoming dispatches without browser reload.
- `[x]` Wire Dispatch Detail status updates directly to remote Backend API.

---

## 👤 Tobi — Public Portal, Forms & Caching (More citizen features)

### Phase 1: Auth Shells & Signin/Signup
- `[ ]` Build visual two-tone layout shells (`AuthShell`, `CitizenAuthShell`).
- `[ ]` Code Citizen Signup and Login forms with validator states.
- `[ ]` Code Agency Signup and Login forms, including the Service Radius Range Slider.
- `[ ]` Build HTTP auth interceptors to inject Bearer tokens for all protected requests.

### Phase 2: Citizen Incident Report Flow
- `[x]` Build reporting bottom sheet layout centering on custom Map coordinates.
- `[ ]` Build the interactive Incident Type Selector Grid.
- `[ ]` Implement description rich textareas and dynamic file upload inputs with attachment previews.
- `[ ]` Create the success screen displaying reference tracking codes and clipboard actions.

### Phase 3: Citizen Dashboard & Status Stepper
- `[ ]` Build `MyReportsScreen` showing citizen reporting history and status filters (All, Open, Resolved).
- `[ ]` Implement `StatusStepper` timeline matching the canonical status stepper transitions.
- `[ ]` Create detail drawer displaying agency dispatch assignment and citizen note updaters.

### Phase 4: Offline Fallback & Session Caching
- `[ ]` Implement IndexedDB and browser Service Workers to allow offline reporting.
- `[ ]` Configure secure cookies to sync reporting reference codes on session-only browsers.

---

## 🤝 Integration Checklist (Shared Work)

- `[x]` Align coordinate payload structure between the Map pin-drop event and the report submission form.
- `[ ]` Connect dispatcher status-update actions to citizen stepper progress timeline triggers.
- `[ ]` Perform joint end-to-end user-flow validation testing citizen-to-dispatcher.
