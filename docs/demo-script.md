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

### Step 3: Dispatch Student Traffic, Observe Packet Lane & Terminal Console
- In the top bar, click `Send Traffic` (or press `Cmd+K` and run `Send Traffic`).
- In the bottom dock, select the `Packet Lane` tab: observe the horizontal flow lane with hop boxes (`PC-STUD` -> `SW6` -> `SW4` -> `SW1` -> `SRV-WEB`). Packets slide along queues in real time, turning green with `✓` upon delivery.
- Switch to the `Terminal & NS-2` dock tab: notice that every UI click echoes its corresponding CLI command (`campus-sim> send PC-STUD SRV-WEB 1 CLASS_BEST_EFFORT`) and outputs live engine events.
- In the interactive terminal prompt, type `show route SW1`, `show queue L_SW1_SW4`, and `ping PC-STUD SRV-WEB`. Observe zero-fabrication real engine data output.

### Step 4: NS-2 / NAM Equivalent Script & Trace Generation
- In the Terminal tab, switch to the `NS-2 Script & Trace View` sub-tab.
- Point to the generated `campus_simulation.tcl` script: highlight duplex-link bandwidth, queue limits, link-fail schedules, and NAM hooks.
- Point to the 12-column standard trace file stream (`+`, `-`, `r`, `d`): demonstrate how live engine packet transitions map deterministically to NS-2 trace lines.
- Note the prominent honesty disclaimer: *"Generated NS-2 equivalent: not executed by this app"*. Click `Download .tcl` and `Download .tr` to show export capabilities.

### Step 5: Switch to Nerd Mode
- Click `Simple Mode` in the top bar (or press `M`).
- Observe that Nerd Mode unlocks:
  - Exact IP/mask interfaces and HSRP priority in the Device Inspector.
  - Link buffer capacity and queue limits on each link.
  - Deterministic accounting equations in the Bento Analytics Grid proving `Generated === Delivered + Dropped + In-Flight`.

### Step 6: Inject Primary Link Failure (Preset 4 Comparison)
- On the canvas, click on primary distribution link `L_SW1_SW4` (or type `fail link L_SW1_SW4` in the terminal).
- The link immediately turns red with dashed lines (`LINK DOWN ✕`).
- Network Copilot warns that reconvergence is active (5 ticks).
- In the `Packet Lane` tab, observe packets in flight turn red, shake, and fall with drop badge `DROP:link_down`.
- Step the simulation forward 5 ticks: the engine completes reconvergence and automatically recalculates the route via alternate core switch `SW2`.
- Subsequent packets are delivered via `SW2` with full recovery! Note the measured `Recovery Time: 5 Ticks`.

### Step 7: Restore the Link & Observe Reversion
- Select the failed link and click to restore it (or type `restore link L_SW1_SW4` in the terminal).
- The link transitions back to operational.
- Dispatch new traffic: Dijkstra recalculates and cleanly reverts to the lowest-cost primary path through `SW1`.

### Step 8: Bento Analytics Grid Inspection
- In the bottom dock, select `Analytics Grid`:
  - Review large-format KPI cards with delta badges (`Delivered %`, `Packet Loss %`, `In Transit`, `Recovery Delay`).
  - Point to the Delivery Donut chart featuring a hatched pattern for dropped packets.
  - Inspect the Per-Link Utilization ranking bars and the Real-Time Packet Inspection Table with sortable columns.

### Step 9: Navigation Rail & Full-Page Views
- In the left 64px rail, click `Compare`: review the side-by-side Architectural Comparison between single-core baseline and dual-core enhanced campus.
- Click `Research`: review the 3-Way Split, academic citations (Varne et al. 2023 & Anton-Alexandru Demian), and verification matrix.
- Click `Viva/FAQ`: review the 12 critical evaluator questions and guided scenario walk-throughs.
- Press `P` to demonstrate Fullscreen Presentation Mode for lab defense.

