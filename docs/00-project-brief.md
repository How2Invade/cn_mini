# 00 - Project Brief

- **Project Title:** Smart Adaptive Campus Network Simulator for Traffic Optimization and Failure Management
- **Audience:** Computer Science / Computer Engineering faculty, network engineering students, and evaluators.
- **Goal:** Provide an interactive, high-fidelity browser laboratory demonstrating how campus networks handle segmentation, traffic flows, link failures, dynamic rerouting, queue congestion, and QoS prioritization without requiring Cisco Packet Tracer installation.
- **Three Core Deliverables:**
  1. A deterministic, pure TypeScript discrete-event simulation engine with unit tests.
  2. A clean, responsive, white-and-slate interactive laboratory web app with dual visual inspection modes (Simple and Nerd), animated packets, charts, and copilot diagnostics.
  3. Clear, honest academic attribution comparing the research paper, the open-source Packet Tracer project, and our simulation contributions.
- **Scope & Boundaries:**
  - In-Scope: Layer 2 VLAN segmentation, Layer 3 inter-VLAN routing, shortest-path calculation (Dijkstra), reconvergence delay abstraction (OSPF/RSTP), default gateway failover abstraction (HSRP), packet queueing, tail drop, strict priority QoS scheduling, live metrics and charts.
  - Out-of-Scope (Non-Goals): Full Cisco IOS emulation, running proprietary `.pkt` files inside the browser, connecting to physical hardware, proprietary external LLM requirements.
