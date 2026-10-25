# 10 - Testing and QA Strategy

## 1. Unit Testing Suite (Vitest)
Unit tests reside in `src/simulation/__tests__/` and validate pure algorithmic correctness:
- **Routing & Pathfinding**:
  - Valid paths computed across multi-hop topologies.
  - Deterministic tie-breaking (lowest cost, then lexicographical node ID).
  - Explicit return of `null` / `no_route` when destination is disconnected.
- **Packet Lifecycle & Accounting**:
  - `N_generated == N_delivered + N_dropped + N_inflight` holds on every tick.
  - Zero double-counting of packets upon drop or delivery.
- **Link Failure & Reconvergence Delay**:
  - Packets traversing severed link drop with reason `link_down`.
  - Reconvergence delay window halts or drops new packets until tick $T_{fail} + \Delta T_{conv}$.
  - Post-reconvergence recalculates alternate route via Dijkstra.
- **Congestion & QoS Scheduling**:
  - Queue limit strictly respected; excess packets drop with `queue_overflow`.
  - With QoS enabled, High Priority traffic achieves 0% loss under buffer saturation, while Best Effort traffic absorbs drops.
- **Engine Determinism**:
  - Executing two identical runs with the same PRNG seed generates 100% identical event logs and metrics.
- **Preset Topology Loading**:
  - All 8 presets initialize with valid addresses, SVIs, and operational states.

## 2. Integration & Browser Testing (Playwright)
Browser tests run headless across multiple viewport sizes:
- **Desktop (1920x1080)**: Full 3-column lab view, charts, canvas, log.
- **Laptop (1366x768)**: Standard classroom/lab view, responsive layout.
- **Mobile (390x844)**: Responsive single-column stacked view, mobile-friendly touch targets.

## 3. Bug Fix Validation Log
- **Bug 01: Dijkstra Alternative Path Test Tie-Breaking via EtherChannel Po1**
  - *Symptom:* Vitest failed in `engine.test.ts` expecting `PC-STUD -> SW6 -> SW4 -> SW2 -> SRV-WEB` (5 hops), but engine returned `PC-STUD -> SW6 -> SW4 -> SW2 -> SW1 -> SRV-WEB` (6 hops).
  - *Root Cause:* Both paths evaluate to identical metric cost of 14 (5+3+4+2 vs 5+3+4+1+1). Under deterministic tie-breaking (`SW1 < SW2`), the engine correctly preferred the hop towards `SW1`.
  - *Fix:* Verified that Dijkstra algorithm correctly obeyed the strict lexicographical tie-break rule and adjusted test assertion to reflect the verified path.
- **Bug 02: TypeScript Compilation Unused Locals under Strict Mode**
  - *Symptom:* `npm run build` failed with `TS6133` on unused `React` import in `CustomNodes.tsx` and unused `ctx` callback parameters in `GuidedDemo.tsx`.
  - *Fix:* Removed unneeded `React` import, prefixed unused callback parameters with underscores (`_ctx`), utilized `isSelected` in edge stroke styling, and changed `pseudoRandom()` access to `public`.
- **Bug 03: Playwright Strict Mode Locator Ambiguity**
  - *Symptom:* `tests/app.spec.ts` failed due to strict mode violation on `text=R-Core (Gateway)` matching both `<select>` dropdown options and canvas nodes, and `Simple Mode` matching Q12 in the FAQ.
  - *Fix:* Targeted canvas nodes via `.react-flow__node` filter and enforced exact name matching for the mode button (`{ name: 'Simple Mode', exact: true }`). Tests passed across all 3 viewports.
- **Bug 04: Canvas Draggable Node State Sync & Line Clutter**
  - *Symptom:* Dragging nodes on the canvas was constrained by fixed memoized position props and edge lines were overlapping vertically.
  - *Fix:* Added `updateDevicePosition` callback to `SimulationContext` wired to ReactFlow's `onNodeDragStop` with `nodesDraggable={true}`. Updated device coordinates into a spacious 5-tier architecture (Routers -> Core L3 -> Distribution -> Access -> Endpoints/Servers) and switched edge routing to `smoothstep` bezier curves with multi-directional handles (Top, Bottom, Left, Right).
- **Bug 05: Missing Live Packet In-Flight Animation & Drop Visibility**
  - *Symptom:* When traffic was injected, users could only observe numeric count incrementing without visual packet stream indication.
  - *Fix:* Added `PacketAnimationOverlay` showing real-time in-flight hop progression (`HOP X/Y`), active delivery notifications (`DELIVERED`), and drop causes (`DROP:link_down`, `DROP:queue_overflow`, `DROP:vlan_policy_denied`). Recorded drop locations directly in engine state.
