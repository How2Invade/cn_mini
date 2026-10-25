# 03 - Network Model Specification

This document specifies the exact devices, interfaces, IP addresses, VLANs, link capacities, costs, and baseline states for the simulation presets.

## Preset 1: Research Paper Baseline (Single-Path Conceptual Campus)
- **Concept:** Conceptual representation of Varne et al. (2023) hierarchical campus network with no core redundancy.
- **Devices:**
  - `R-CORE`: Gateway Router (`192.168.1.1/24`, SVIs for departmental VLANs)
  - `SW-DIST`: Distribution Switch
  - `SW-ACC-A`: Access Switch Building A (Admin / HR)
  - `SW-ACC-B`: Access Switch Building B (Students / Labs)
  - `PC-ADMIN`: `192.168.20.10/24`, Gateway `192.168.20.1`, VLAN 20
  - `PC-STUD`: `192.168.30.10/24`, Gateway `192.168.30.1`, VLAN 30
  - `SRV-CAMPUS`: Campus Web Server `192.168.40.10/24`, Gateway `192.168.40.1`, VLAN 40
- **Links:**
  - `L_CORE_DIST`: `R-CORE` <-> `SW-DIST` (Capacity: 10 pkts/tick, Cost: 1, Queue: 20)
  - `L_DIST_ACCA`: `SW-DIST` <-> `SW-ACC-A` (Capacity: 5 pkts/tick, Cost: 2, Queue: 15)
  - `L_DIST_ACCB`: `SW-DIST` <-> `SW-ACC-B` (Capacity: 5 pkts/tick, Cost: 2, Queue: 15)
  - `L_DIST_SRV`: `SW-DIST` <-> `SRV-CAMPUS` (Capacity: 10 pkts/tick, Cost: 1, Queue: 20)
  - `L_ACCA_PC`: `SW-ACC-A` <-> `PC-ADMIN` (Capacity: 5 pkts/tick, Cost: 5, Queue: 10)
  - `L_ACCB_PC`: `SW-ACC-B` <-> `PC-STUD` (Capacity: 5 pkts/tick, Cost: 5, Queue: 10)
- **Vulnerability:** If `L_CORE_DIST` fails or distribution switch fails, the entire campus suffers total black-hole outage (0% delivery).

---

## Preset 2: Enhanced Campus Network (Dual-Core Redundant Campus)
- **Source:** Direct structural modeling of Anton-Alexandru Demian's topology.
- **Devices:**
  - `R1`: Border Router 1 (`10.0.0.1/30` to R2, `10.0.1.1/30` to SW1, `10.0.1.5/30` to SW2)
  - `R2`: Border Router 2 (`10.0.0.2/30` to R1, `10.0.1.9/30` to SW1, `10.0.1.13/30` to SW2)
  - `SW1`: Core L3 Multilayer Switch 1 (HSRP Active Priority 110, SVI `192.168.x.2`)
  - `SW2`: Core L3 Multilayer Switch 2 (HSRP Standby Priority 100, SVI `192.168.x.3`)
  - `SW3`: Campus Distribution Switch 3 (North Campus / Admin)
  - `SW4`: Campus Distribution Switch 4 (South Campus / Student Labs)
  - `SW5`: Access Switch 5 (Admin Office)
  - `SW6`: Access Switch 6 (Student Computer Lab)
  - `PC-ADMIN`: Admin workstation, `192.168.20.10/24`, Gateway `192.168.20.1` (VLAN 20)
  - `PC-STUD`: Student workstation, `192.168.30.10/24`, Gateway `192.168.30.1` (VLAN 30)
  - `SRV-WEB`: Data Center Web Server, `192.168.40.10/24`, Gateway `192.168.40.1` (VLAN 40)
  - `SRV-FTP`: Data Center FTP Server, `192.168.40.12/24`, Gateway `192.168.40.1` (VLAN 40)
  - `SRV-DMZ`: Public Web DMZ Server, `192.168.50.10/24`, Gateway `192.168.50.1` (VLAN 50)
- **Interconnect Links:**
  - `L_R1_R2`: R1 <-> R2 (Cost: 10, Capacity: 20)
  - `L_R1_SW1`: R1 <-> SW1 (Cost: 2, Capacity: 20)
  - `L_R1_SW2`: R1 <-> SW2 (Cost: 5, Capacity: 20)
  - `L_R2_SW1`: R2 <-> SW1 (Cost: 5, Capacity: 20)
  - `L_R2_SW2`: R2 <-> SW2 (Cost: 2, Capacity: 20)
  - `L_PO1_SW1_SW2`: EtherChannel Po1 (SW1 <-> SW2) (Cost: 1, Capacity: 30)
  - `L_SW1_SW3`: SW1 <-> SW3 (Primary Distribution Link, Cost: 2)
  - `L_SW2_SW3`: SW2 <-> SW3 (Alternate Distribution Link, Cost: 4)
  - `L_SW1_SW4`: SW1 <-> SW4 (Primary Distribution Link, Cost: 2)
  - `L_SW2_SW4`: SW2 <-> SW4 (Alternate Distribution Link, Cost: 4)
  - `L_SW3_SW5`: SW3 <-> SW5 (Access Trunk, Cost: 3)
  - `L_SW4_SW6`: SW4 <-> SW6 (Access Trunk, Cost: 3)
  - `L_SW1_DC`: SW1 <-> Data Center Bus (Cost: 1)
  - `L_SW2_DC`: SW2 <-> Data Center Bus (Cost: 2)
  - `L_SW5_ADMIN`: SW5 <-> `PC-ADMIN` (Cost: 5)
  - `L_SW6_STUD`: SW6 <-> `PC-STUD` (Cost: 5)
- **Path Selection & Failover Dynamics:**
  - Normal Student -> Web Server: `PC-STUD` -> `SW6` -> `SW4` -> `SW1` -> `SRV-WEB` (Lowest cost = 5 + 3 + 2 + 1 = 11).
  - Primary Link Failure (`L_SW1_SW4` disabled): Recomputes via `SW2` -> `SRV-WEB` (New cost = 5 + 3 + 4 + 2 = 14) after configured reconvergence delay.
