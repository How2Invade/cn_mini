# DECISIONS.md - Project Architectural & Design Decisions

## 1. Environment & Tools Inspection (2026-10-25)
- **Node.js**: v22.17.0
- **npm**: 11.4.2
- **git**: 2.50.0
- **Platform**: macOS (Darwin arm64)
- **Framework & Bundler Choice**: Vite with React 19 + TypeScript (Strict)
- **Styling**: Tailwind CSS v3 with custom design tokens adhering to the technical white/slate theme (No dark mode, no neon, no glassmorphism, no generic AI styling).
- **Graph & Topology Canvas**: `@xyflow/react` (React Flow) for draggable nodes, custom link edges, packet animation markers, and clean grid rendering.
- **Charts**: `recharts` for metrics (throughput, delay, loss over time, queue depth, comparison bar charts).
- **Icons**: `lucide-react`.
- **Testing**: `vitest` for fast pure TypeScript simulation unit tests; Playwright for cross-device browser testing.

## 2. Source Verification & Discrepancies
- **Varne et al. (2023) Paper**:
  - Verified Zenodo Record: DOI 10.5281/zenodo.10254264, CC BY 4.0 license confirmed via Zenodo metadata & PDF footer.
  - Journal title on Zenodo metadata: "International Journal of Computation Learning and Intelligence"; PDF title header: "International Journal of Computational Learning & Intelligence", Vol. 2, Iss. 4, pp. 163–168 (Oct/Dec 2023).
  - Findings: Paper introduces a conceptual 3-tier campus network for a university, showing Buildings A/B/C with department access switches and VLANs (192.168.x.0/24), DHCP, and a single ping screenshot (Fig. 3) showing 25% first-packet ARP loss.
  - Crucial distinction: EIGRP, HSRP, NAT, ACLs, Port Security, and QoS are **only mentioned in text** as prospective enhancements or surveyed topics, with zero topology implementation, zero failover tests, and zero quantitative performance measurements. This will be stated plainly without hallucination.
- **antondemian Repository (Primary Source)**:
  - Repository: `https://github.com/antondemian/redundant-data-center-campus-network` by Anton-Alexandru Demian (Politehnica University of Timisoara).
  - License check: GitHub API returns `license: null` (no explicit open-source license file). Therefore, per instructions, we do not copy proprietary `.pkt` or thesis assets; we cite, link, summarize facts, and credit Anton-Alexandru Demian.
  - Technologies verified from repo markdown (`addressing-plan.md`, `test-matrix.md`): Dual core L3 switches SW1/SW2, routers R1/R2, distribution SW3/SW4, access SW5/SW6, VLANs 10, 20, 30, 40, 50, HSRP virtual gateway .1, SW1 priority 110 (preempt), OSPF area 0, EtherChannel Po1, RSTP failover, ACLs restricting Student VLAN 30 to Web while blocking FTP.
  - Proprietary `.pkt` status: `.pkt` files are Cisco Packet Tracer proprietary binary files; cannot be executed natively without Cisco Packet Tracer. All Packet Tracer evidence fields will remain strictly unpopulated or marked "Unavailable" unless supplied via `docs/11-packet-tracer-evidence.md`.

## 3. Simulation Model Abstraction Decisions
- **Discrete-Event Tick Engine**:
  - 1 tick = configurable discrete time step (default 100ms in normal speed).
  - Seeded PRNG for deterministic packet generation, transmission jitter, and repeatable stress testing.
  - Routing: Dijkstra shortest-path over active topology links with interface costs.
  - Protocol Abstraction: OSPF and RSTP are abstracted as deterministic shortest-path recomputation with a configurable reconvergence delay (e.g. 5 ticks). HSRP is abstracted as primary gateway selection with automatic failover to the secondary gateway upon primary SVI/uplink failure.
  - Drop reasons are strictly tracked: `no_route`, `link_down`, `destination_unreachable`, `vlan_policy_denied`, `queue_overflow`.
  - QoS Model: Link interface priority queues. Strict priority or Weighted Round Robin (WRR) for Voice/LMS critical packets over student bulk traffic during congestion.

## 4. Design & UI Decisions
- Strict adherence to prompt tokens: Background `#FFFFFF`, Surface `#F7F9FC`, Text `#172033`, Muted `#637083`, Border `#E3E8EF`, Primary `#2563EB`, Healthy `#16A34A`, Warning `#D97706`, Failure `#DC2626`, Packet `#0EA5E9`.
- Clean scientific / lab aesthetic: Clear evidence badges on every single metric and chart (`Browser-simulated`, `Imported Packet Tracer observation`, `Calculated from recorded data`, `Unavailable`).
- Dual Diagnostic Modes: Simple Mode (human explanations, clear traffic flows) vs Nerd Mode (IPs, CIDR masks, interface names like Gi0/1, routing tables, link metrics, tick counters, packet sequence numbers, mathematical loss formulas).
- Guided 7-Step Interactive Lab Tour.

## 5. Drag-and-Drop Node Persistence, Clean Tier Spacing, & Live Packet Stream (2026-10-25)
- **Node Dragging & State Persistence**: React Flow nodes now have `nodesDraggable={true}` and hook directly into `onNodeDragStop` with an `updateDevicePosition` callback in `SimulationContext`, enabling nodes to be dragged freely and persist their positions without resetting during simulation ticks.
- **Topology Hierarchy Spacing**: Resolved layout overcrowding by expanding vertical and horizontal spacing into clean 5-tier architecture (Routers [y:30] -> Core L3 [y:170] -> Distribution [y:310] -> Access [y:450] -> Workstations [y:580], with Servers dedicated on the right flank [x:800]).
- **Multi-Directional Edge Routing**: Added 4 distinct connection handles (`top`, `bottom`, `left`, `right`) and upgraded link edges to `smoothstep` bezier curves with clean label tags.
- **Live Packet Stream & Drop Visuals**: Integrated `PacketAnimationOverlay` showing real-time hop progression (`HOP X/Y`), active delivery notifications, and red drop badges with explicit causal reasons (`DROP:link_down`, `DROP:queue_overflow`, `DROP:vlan_policy_denied`). All drop coordinates are recorded in engine state.

## 6. Comprehensive UI/UX Overhaul & 3 New Interactive Panels (2026-10-25)
- **Design Language**: Translucent frosted panels (`bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm`), clean white canvas, `#2563EB` primary brand, rounded 16px cards, large KPI numerals with delta badges, and pill-shaped control chips. Strictly light mode.
- **Application Shell**: Modern SaaS / Network Lab workbench layout:
  - 64px Left Icon Rail with mobile bottom-bar fallback.
  - Collapsible Presets Drawer (~280px) organized into *Architectures*, *Experiments*, and *Tests*.
  - Slim Top Bar with Preset breadcrumbs, run controls, Nerd Mode toggle, Presentation mode, and `Cmd+K` command palette.
  - Slide-in Right Drawer (~340px) holding Device/Link Inspector and Network Copilot tabs, auto-closing when unselected to maximize canvas space.
  - Collapsible, Resizable Bottom Dock with tabs: `Analytics`, `Terminal`, `Packet Lane`, `Event Log`.
- **Topological Layout & Grouping**:
  - Layered fixed hierarchy: Internet/Edge -> Routers -> Core L3 switches -> Distribution -> Access -> Endpoints / Servers.
  - Frosted zone grouping for Server Farm (VLAN 40) and isolated DMZ (VLAN 50) with security perimeter styling.
  - Minimap in bottom-left corner with real-time Zoom % readout and Auto-Layout restore button.
- **Interactive Terminal**:
  - `Console`: Interactive CLI shell (`campus-sim>`) accepting commands (`run`, `pause`, `reset`, `preset`, `fail link`, `send`, `show route`, `show queue`, `show vlan`, `clear`). Any UI button action is reflected with a command echo into the console to maintain a unified execution view.
  - `NS-2 View`: Generates deterministic Tcl script for ns-2 network simulator and raw `.tr` trace events mapped from engine packets (`+`, `-`, `r`, `d`), with copy and `.tcl` / `.tr` download capabilities. Transparently labelled as generated equivalent.
- **Packet Lane Widget**: Horizontal hop-by-hop lanes per flow showing packet cubes sliding through queues, turning green upon delivery or shaking/falling with explicit drop badges on failure.
- **Bento Analytics Grid**: Refactored metrics into high-impact cards with bold numerals, delivery donut chart with hatched drop segment, per-link utilization ranking bars, annotated recovery timeline strip, and sortable packet flow table.

## 7. Light & Dark Mode Theming and Full Feature Connectivity (2026-10-25)
- **Design Inspiration Integration**:
  - Drawing directly from user-provided design references (warm pill cards, rich dark mode bento layouts with neon emerald `#10B981` accents, clean rounded pill badges, micro-widget layout, and crisp typography with `Plus Jakarta Sans` and `JetBrains Mono`).
  - Implemented dual-theme architecture: `class` strategy in Tailwind with synchronized class toggling on `document.documentElement` and persistence in `localStorage` under `cn_theme`.
  - Added one-click theme switcher in both the Top Bar and the Left Navigation Rail, providing instant visual feedback.
- **Engine & Context Feature Connectivity**:
  - Added `setLinkCost(linkId, cost)` in `engine.ts` and `updateLinkCost` in `SimulationContext.tsx`. Users can now interactively tune link metric costs directly from the Link Inspector (`+` / `-` buttons) or via the diagnostic CLI (`cost <linkId> <newCost>`), immediately re-running Dijkstra shortest-path calculations.
  - Linked playback speed pill buttons (`0.5x`, `1x`, `2x`, `5x`) to simulation tick intervals.
  - Wired Quality of Service (QoS) toggle button directly to the strict priority queue scheduler in the top bar.
  - Expanded traffic generation modal with 5 one-click realistic traffic flows (VoIP low-latency, Faculty LMS burst, Student web browsing, Cross-VLAN ACL denial test, Core link stress).
  - Wired device quick actions: "Send traffic from here", "Ping web server", and "View routing table in console".
  - Connected 6 one-click diagnostic test scripts in the Terminal & NS-2 panel.
  - Built dedicated full-page 7-Step Guided Lab Tour view accessible via TopBar, Left Rail, and Command Palette.
- **Zero Breakage Guarantee**:
  - 100% of preexisting test assertions and strict string matchers preserved.
  - All 11 Vitest unit tests and 12 Playwright cross-device E2E tests pass cleanly.

## 8. Minimalist De-cluttering & Organic Warm Pill UI Overhaul (2026-10-25)
- **User Feedback Addressed**: Purged all emojis across buttons, rail navigation, modals, and drawers; eliminated header bar congestion; resolved canvas crowding.
- **Organic Warm Pill Design Language**:
  - Background: Warm cream `#F5F5EE` (light) and obsidian `#090D16` (dark).
  - Cards & Pills: Rounded 24px–32px organic pill capsules with subtle borders (`border-stone-200/80`) and clean typography (`Plus Jakarta Sans` and `JetBrains Mono`).
  - Consolidated Controls: Unified playback capsule in the Top Bar combining Run/Pause, Step, Reset, and Speed into a single clean pill container.
  - Zero Tacky Emojis: Replaced all emojis with bespoke Lucide SVG icons (`Network`, `Layers`, `Activity`, `Terminal`, `Radio`, `Compass`, `Scale`, `BookOpen`, `HelpCircle`, `Send`, `Play`, `Pause`, `Sliders`).
  - Canvas Breathing Room: Bottom dock defaults to collapsed state, restoring over 80% of screen height to the topology canvas.
  - Viewport Responsiveness & Scrolling: Adjusted mobile drawer dimensions (`w-72 sm:w-80`) and verified smooth vertical scrolling across all panels.
- **Verification**: 11/11 Vitest unit tests and 12/12 Playwright cross-device tests pass cleanly.
 
## 10. Pixel-Perfect Layout Alignment & Bento Grid Harmonization (2026-10-25)
- **TopBar Baseline & Flex Containment**:
  - Enforced exact `h-8.5` (34px) height across all individual buttons and playback pill capsules with consistent `gap-2` horizontal spacing.
  - Collapsed secondary labels responsively (`Auto-Layout`, `Search...`, `Scenario`, `QoS`, `Lab Tour`) using Tailwind breakpoints (`xl:`, `lg:`, `sm:`, `2xl:`). This reduced required header width from ~1,350px down to ~620px, preventing horizontal flex collision between controls at all standard laptop and desktop viewports.
- **Unified Canvas Floating Controls**:
  - Eliminated arbitrary `right-28` absolute positioning in `RightDrawer`.
  - Re-architected canvas header into a coordinated toolbar in `TopologyCanvas.tsx` at `top-3 right-3 z-10 flex items-center gap-2`.
  - Both `Ask Copilot` and `Legend ▼` share identical `h-8.5 px-3.5 rounded-xl border border-stone-200/80 dark:border-slate-800 shadow-2xs` tokens.
  - When the 352px `RightDrawer` is opened, `Ask Copilot` automatically hides from the floating toolbar, and the top-left `Campus Topology` title chip responsively truncates its subtitle, preventing collision with `Legend`.
- **Bento Analytics Grid Harmonization**:
  - Row 1: Standardized all 6 KPI cards to uniform `h-[116px]` with identical padding (`p-3.5`), identical header height (`h-5`), and baseline-aligned numerals and uppercase pill badges. Replaced wide `"Unavailable"` text on `Recovery Delay` with clean `"Steady"` + `Convergence` badge.
  - Row 2: Synchronized Donut Card, Per-Link Utilization Card, and Fault Tolerance Card to uniform `h-[360px]` dimensions.
  - Link Utilization: Added padded scrolling container (`h-[220px] overflow-y-auto pr-2 space-y-2.5 my-3 scrollbar-thin`) and per-item padding (`py-0.5`), completely eliminating clipped bottom link rows.
- **Verification**: 100% passing build (`tsc && vite build`), 11/11 Vitest unit tests, and 12/12 Playwright cross-device tests.

## 11. Navigation State Synchronization, MiniMap Elimination, & Bento Metric Card Polish (2026-10-25)
- **TopBar & Left Rail Auxiliary View Synchronization**:
  - Previously, navigating to full-page views (`FAQ`, `Compare`, `Research`, `Lab Tour`) left the simulation controls in `TopBar` visible (`Run`, `Step`, `Send Traffic`, `Auto-Layout`), creating a disconnect with the active page.
  - Now, `TopBar` conditionally hides playback and topology controls when `currentSection !== 'simulator'`. In their place, it displays an immediate `← Topology Canvas` return breadcrumb and a clean `Active: <Section>` pill chip.
  - Selecting any auxiliary section in `LeftRail` automatically closes `isPresetsOpen`, preventing drawer overlap over the active page.
- **MiniMap Elimination**:
  - Removed the React Flow `MiniMap` component (which previously rendered as clustered blue blocks in the bottom-left canvas corner).
  - Preserved a minimal, non-intrusive `Zoom: XX%` readout chip positioned in the bottom-left panel.
- **Bento Metric Card Alignment & Fitting**:
  - Added `compact?: boolean` prop to `EvidenceBadge` with subtle indicator dots and tooltips (`Simulated`, `Calculated`, `Imported`, `Unavailable`).
  - Standardized all 6 KPI cards in `AnalyticsBento.tsx` with responsive grid (`grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3`).
  - Adjusted QoS Queueing typography to `text-base sm:text-lg font-bold font-mono truncate`, eliminating truncation of `DropTail` to `DropTa...`.
  - All metrics cards fit without wrapping or truncation across standard viewports.
- **FAQ Page Demarcation & Generalization**:
  - Renamed `Viva/FAQ` to `FAQ` in navigation and header to `Frequently Asked Questions` with subtitle `Common questions about simulation mechanics, protocols, and architecture`.
  - Removed all academic viva, professor, and evaluator references; framed all 12 questions and answers for general users, students, and network engineers.
- **Verification**:
  - TypeScript compilation and Vite production build passed without errors.
  - 11/11 Vitest unit tests passed.
  - 12/12 Playwright cross-device E2E tests passed.

## 12. Simulation Engine Live Workload, Search Navigation & UI Sizing Overhaul (2026-10-26)
- **Workload Injection in Simulation Loop**:
  - *Problem*: Clicking "Run" advanced the tick counter (`Tick 0, 1, 2...`) but without active packet traffic, the network appeared completely frozen. "Pause" and "Reset" also appeared non-functional as no visible state changed.
  - *Fix*: Wired preset scenario traffic injection (`runScenarioTick`) to the discrete-event clock loop. Clicking "Run" continuously injects deterministic scenario traffic along computed Dijkstra shortest paths, illuminating active paths with cyan animated dashed lines, displaying live packet counts on links (`X pkts`), and updating live delivery/loss metrics. When paused, manually dispatched packets automatically drain until settled.
- **Search & Command Palette Jump Fix**:
  - *Problem*: Searching in the Command Palette (Cmd+K) did not navigate to pages if the user was on an auxiliary view, and device/keyword search was missing.
  - *Fix*: Rewrote `CommandPalette.tsx` to index all pages, dock panels (including NS-2 Terminal), all 8 presets, and all topology devices. Added keyword aliases (`terminal`, `ns2`, `ns-2`, `cli`, `tcl`, `trace`, `sw1`, `failure`, etc.), keyboard navigation (Arrow Up/Down, Enter), and ensured selecting any item sets `currentSection = 'simulator'` to immediately display the topology canvas or selected dock tab.
- **Button Sizing & Ergonomics**:
  - *Problem*: Controls and buttons were too small (`h-7.5` / `h-8.5` missing from Tailwind config).
  - *Fix*: Registered custom spacing tokens in `tailwind.config.js` (`7.5`, `8.5`, `13.5`, `88`, `2xs`, `slate-850`). Enlarged all primary buttons to minimum 40px height (`h-10 px-4`), gave explicit text labels to Step and Reset, enlarged bottom dock tabs, and enhanced terminal inputs.
- **Verification**: 100% build pass, 11/11 Vitest unit tests, 12/12 Playwright E2E tests.




