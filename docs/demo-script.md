# Demo Script & Professor Walkthrough

This script provides an exact 10-step sequence for presenting the simulator to a computer-engineering professor or evaluator.

---

### Step 1: Open the Application & Launch Simulator
- Open `http://localhost:4173` (or `npm run dev` at `http://localhost:5173`).
- Point to the Hero section: Note the explicit subtitle and the prominent `[Browser-simulated]` evidence badge.
- Click `Launch Simulator Workspace` to smoothly scroll down to the canvas.

### Step 2: Explain Enhanced Dual-Core Topology & Addressing Plan
- Observe Preset 2 (Enhanced Campus Network loaded by default).
- Highlight the 3-tier structure:
  - Routing layer: Border routers `R1` and `R2` connected via transit subnet `10.0.0.0/30`.
  - Core layer: Multilayer switches `SW1` (HSRP Active, priority 110) and `SW2` (HSRP Standby, priority 100) bonded by EtherChannel `Po1`.
  - Distribution switches `SW3` (North) and `SW4` (South).
  - Access switches `SW5` (Admin) and `SW6` (Students).
  - Data Center: Campus Web Server (`192.168.40.10`), FTP Server (`192.168.40.12`), and DMZ Web Server (`192.168.50.10`).

### Step 3: Dispatch Student Traffic & Observe Simple Mode
- In the Control Panel, ensure Source is `PC-STUD`, Destination is `SRV-WEB`, and Count is 10.
- Click `Inject Traffic`, then click `Run Simulation`.
- Watch the animated cyan packets traverse: `PC-STUD` -> `SW6` -> `SW4` -> `SW1` -> `SRV-WEB`.
- Note that the Delivery Rate reaches 100% and the Event Log records clean delivery confirmations.

### Step 4: Switch to Nerd Mode
- Click `Simple Mode` in the header (or press `M` on the keyboard).
- Observe that Nerd Mode unlocks:
  - Exact IP/mask interfaces in the Device Inspector.
  - Link buffer capacity and queue limits on each link.
  - Deterministic accounting equations in the Metrics Dashboard proving `Generated === Delivered + Dropped + In-Flight`.

### Step 5: Inject Primary Link Failure (Preset 4 Comparison)
- On the canvas, click on primary distribution link `L_SW1_SW4`.
- The link immediately turns red with dashed lines (`LINK DOWN`).
- Network Copilot warns that reconvergence is active (5 ticks).
- Inject traffic while down: notice packets in flight drop with reason `link_down`.
- Step the simulation forward 5 ticks: the engine completes reconvergence and automatically recalculates the route via alternate core switch `SW2`.
- Subsequent packets are delivered via `SW2` with full recovery! Note the measured `Recovery Time: 5 Ticks`.

### Step 6: Restore the Link
- Select the failed link and click `Restore Link (Up)` in the Inspector.
- The link transitions back to green/operational.
- Dispatch new traffic: Dijkstra recalculates and cleanly reverts to the lowest-cost primary path through `SW1`.

### Step 7: Traffic Congestion & QoS Prioritization (Preset 6)
- Switch to Preset 6 (`Traffic Congestion & QoS`).
- Explain that link `L_SW4_SW6` is throttled with a queue limit of 5 packets.
- With QoS enabled: send concurrent bursts of `Voice/LMS (Class High)` traffic. Notice high-priority traffic achieves 0% loss while best-effort bulk traffic absorbs the tail-drops.
- Toggle QoS to OFF: observe that both classes drop indiscriminately under FIFO tail-drop.

### Step 8: Open Comparison View
- Scroll down to the `Baseline (Paper) vs. Enhanced (Demian-Derived)` section.
- Review the side-by-side table: explain how the single-core baseline suffers unrecoverable black-hole failure, whereas the enhanced dual-core architecture provides high availability.

### Step 9: Open Research & Attribution Panel
- Scroll to the `Research & Academic Attribution` section.
- Explain the 3-Way Split:
  1. Varne et al. (REVA University, 2023): conceptual baseline and VLAN scheme.
  2. Anton-Alexandru Demian: concrete dual-core Packet Tracer thesis repository.
  3. Our extensions: pure TypeScript browser engine, QoS prioritization, and dynamic explainability.
- Review the verified bibliographic citations and DOIs.

### Step 10: Professor FAQ & Evaluative Transparency
- Open the `Professor FAQ` accordion.
- Review Q1, Q2, Q5, and Q11 to reiterate simulation boundaries, determinism, and scientific honesty.
