# 07 - UI & Layout Specification

## Page Layout Sections (Single-Page App)
1. **Header & Hero Section**:
   - Title: "Smart Adaptive Campus Network Simulator"
   - Subtitle: "An interactive laboratory for campus network traffic, redundancy, and failure recovery."
   - Action Buttons: `Launch Simulator` (smooth-scrolls to canvas), `Explore Research` (jumps to academic attribution).
   - Mode Toggle: Simple Mode vs Nerd Mode (prominently placed in header).
   - Presentation Mode Toggle: Maximizes workspace, hides auxiliary panels, enables large step-by-step presentation overlays.
   - Evidence Badge: `[Browser-simulated]` label prominently visible.

2. **Scenario Preset Bar**:
   - Quick selector pills for Presets 1–8 with brief intent badges (e.g., `Baseline Single-Path`, `Enhanced Dual-Core`, `Link Failure`, `Congestion + QoS`).
   - Reset button to restore pristine preset parameters.

3. **Simulation Workspace (Interactive Lab)**:
   - **Canvas Area (Left / Center)**:
     - React Flow graph representing nodes (Routers, Multilayer Switches, Access Switches, PCs, Servers).
     - Color-coded links: Green (Healthy), Red Dashed (Severed/Down), Orange (Standby/Alternate).
     - Link failure injection: Direct click on link or inspector action to toggle link state (UP/DOWN).
     - Animated packet overlays rendering active packets in flight along calculated paths.
   - **Sidebar / Inspectors (Right)**:
     - **Device Inspector**: Shows device type, hostname, configured interfaces, IP/mask, active SVI, HSRP role, VLAN assignment, and simulated routing table (in Nerd Mode). Unmodeled properties explicitly state "Not configured".
     - **Link Inspector**: Endpoints, physical media, bandwidth capacity, cost metric, operational state, buffer size, active queue depth, tail-drop count.
     - **Traffic Generator**: Choose Source, Destination, Packet Count (1, 10, 50, continuous), Generation Rate (pkts/sec), Traffic Class (`Voice/LMS Priority` vs `Best-Effort Bulk`), QoS switch (On/Off).
     - **Network Copilot**: Live diagnostic explanations generated dynamically from engine events (e.g. why a packet dropped, which alternate link was chosen, recovery ticks).

4. **Metrics & Visualizations Dashboard**:
   - Metrics Cards: Packets Generated, Packets Delivered, Packets Dropped, In-Flight, Delivery Rate %, Packet Loss %, Recovery Ticks.
   - Evidence Badges on every single card.
   - Charts (Recharts):
     - Throughput & Loss over time (Ticks).
     - Link Queue Occupancy & Tail Drops.
     - Baseline vs. Enhanced Comparison Bar Chart.

5. **Event Log**:
   - Chronological table of network events with tick timestamp, severity icon, source, target, event type (`PACKET_SENT`, `LINK_DOWN`, `RECONVERGED`, `PACKET_DROPPED`, `QOS_PRIORITIZED`), and causal description.
   - Live filter by severity or search term. Export to JSON/CSV.

6. **Interactive 7-Step Guided Scenario Demo**:
   - Step 1: Normal Operation
   - Step 2: Traffic Flow Commences
   - Step 3: Link Failure Injected
   - Step 4: Network Reconvergence Window
   - Step 5: Traffic Resumed via Alternate Path
   - Step 6: Baseline vs. Enhanced Resilience Comparison
   - Step 7: Summary of Simulation Scope & Non-Goals

7. **Academic Attribution & Comparison Panel**:
   - 3-Way Split: Research Foundation (Varne et al.) | Existing Packet Tracer Reference (Anton-Alexandru Demian) | Our Web Simulator Extensions.
   - Verification Status Matrix with exact bibliographic citations and working DOIs/URLs.

8. **Professor FAQ & Limitations Section**:
   - Transparent answers to the 12 key evaluative questions.

9. **Footer**:
   - License statements, open-source acknowledgments, disclaimer.
