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
