# UI/UX Initial Audit & Defect List (Pre-Overhaul)

Audit performed on 2026-10-25 across 1366x768 and 1920x1080 viewports.
Screenshots saved: `docs/audit-1366.png`, `docs/audit-1920.png`.

## Observed Deficiencies & Clutter:
1. **Navigation Structure**:
   - The top horizontal preset scrollbar (`PresetsBar`) eats vertical screen real estate without giving clear categorical grouping (Architectures vs. Experiments vs. Security Tests).
   - The page is a single, very long vertical scroll (over 5000px high). Users have to scroll continuously between canvas, metrics, logs, guided tour, comparison, research, and FAQs.
2. **Topology Canvas & Node Layout**:
   - Devices are scattered across a fixed height box with manual dragging. While smooth, there is no automatic structured layout per preset, no minimap, no zoom indicator percentage, no auto-layout button, and no VLAN cluster containers (e.g. grouping student PCs or server farms into clear zones).
   - DMZ and Server Farm zones lack soft frosted containers with clear security boundaries.
3. **Missing Critical Simulation Views (Required by Brief)**:
   - **Terminal Component**: Currently no interactive CLI shell (`campus-sim>`) to run commands (`fail link`, `send`, `show route`, `show queue`) or view typewriter command echoes.
   - **NS-2 / NAM Equivalent Generator**: Syllabus requirement for Tcl script and NS-2 trace format (`+`, `-`, `r`, `d`) with copy/download options is completely missing.
   - **Packet Lane Widget**: No dedicated horizontal hop-by-hop queue lane showing physical packets sliding across Source -> Access -> Distribution -> Core -> Server with shake/drop/delivery animations.
4. **Analytics & Metrics Presentation**:
   - Current dashboard has simple bar/line charts without bento-grid hierarchy.
   - Missing KPI delta badges, delivery donut chart with hatched drop segment (Reference C style), per-link utilization ranking bars, annotated recovery timeline strip, and sortable packet/flow table.
5. **Right Drawer & Bottom Dock**:
   - Inspectors currently sit in a static side column that permanently consumes canvas width even when nothing is selected.
   - Event log sits way down the page instead of in a collapsible, tabbed bottom dock.

## Action Plan for Overhaul:
1. Build full modern App Shell with 64px Left Icon Rail, Collapsible Presets Panel (~280px), Slim Top Bar with Command Palette (`Cmd+K`), Slide-in Right Drawer (~340px) for Inspector + Copilot, and Resizable/Collapsible Bottom Dock (`Analytics`, `Terminal`, `Packet Lane`, `Event Log`).
2. Redesign Topology with clean tiered computed layout, VLAN cluster cards, Server Farm & DMZ frosted zones, Minimap with Zoom %, Auto-Layout, and Smoothstep Orthogonal Edges.
3. Implement Terminal with browser simulation shell (`campus-sim>`) + NS-2 View (Tcl script & trace generation + download).
4. Implement Packet Lane widget with real engine-driven horizontal flow lanes, queue slots, animated in-flight packets, and drop animations.
5. Upgrade Analytics into a light frosted Bento-Grid with Delivery Donut, Utilization Heat Bars, Recovery Timeline, and Packet Table.
6. Verify and maintain 100% passing tests.
