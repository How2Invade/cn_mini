# 01 - Source Facts (Verified vs. Unverified)

## Source 1: Research Paper
- **Citation:** Preetham N Varne, Priyanka J, Snehith Shetty V, Tejus A K, Naveen Chandra Gowda, "Campus Network Design and Implementation using Cisco Packet Tracer", *International Journal of Computational Learning & Intelligence*, Vol. 2, Issue 4, pp. 163–168, Oct/Dec 2023. DOI: 10.5281/zenodo.10254264. License: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Verified Implemented Facts in Paper:**
  - `[verified]` Proposes a hierarchical campus network model comprising Core, Distribution, and Access layers for a conceptual university campus.
  - `[verified]` Depicts campus buildings (e.g. Buildings A, B, C) with departmental access switches (Admin, HR, Finance, Business, E&C, labs).
  - `[verified]` Utilizes VLAN segmentation with `192.168.x.0/24` subnets per department.
  - `[verified]` Implements DHCP for automated IP allocation.
  - `[verified]` Includes a single ping test screenshot (Fig. 3) showing 4 ICMP packets sent, with 1 timeout (25% loss) and 3 replies (75% success), typical of initial ARP resolution in Packet Tracer.
- **Verified Absences / "Only Mentioned" in Paper:**
  - `[verified]` EIGRP, HSRP, NAT, ACLs, Port Security, QoS, Firewalls/IDS, and Wireless are mentioned in the literature survey or objective lists, but **never configured, tested, or measured**.
  - `[verified]` Completely absent: No link failure injection, no redundancy/failover test, no quantitative latency, throughput, or recovery time measurements.

---

## Source 2: Primary Packet Tracer Repository (antondemian)
- **Author & Origin:** Anton-Alexandru Demian (Bachelor's thesis, Politehnica University of Timisoara).
- **Repository URL:** `https://github.com/antondemian/redundant-data-center-campus-network`
- **License Status:** `[verified]` GitHub API returns `license: null`. No permission to redistribute proprietary assets; factual technical structures are referenced and attributed.
- **Verified Network Specifications (from `addressing-plan.md` & `README.md`):**
  - `[verified]` Devices: Routers R1, R2; Core L3 Multilayer Switches SW1, SW2; Campus Distribution Switches SW3, SW4; Campus Access Switches SW5, SW6.
  - `[verified]` VLAN 10 (Management): `192.168.10.0/24`, HSRP VIP `192.168.10.1`, SW1 SVI `.2`, SW2 SVI `.3`.
  - `[verified]` VLAN 20 (Admin): `192.168.20.0/24`, HSRP VIP `192.168.20.1`, SW1 SVI `.2`, SW2 SVI `.3`.
  - `[verified]` VLAN 30 (Students): `192.168.30.0/24`, HSRP VIP `192.168.30.1`, SW1 SVI `.2`, SW2 SVI `.3`.
  - `[verified]` VLAN 40 (Internal Servers): `192.168.40.0/24`, HSRP VIP `192.168.40.1`, SW1 SVI `.2`, SW2 SVI `.3`. Servers: Web `192.168.40.10`, DNS `.11`, FTP `.12`, Email `.13`.
  - `[verified]` VLAN 50 (DMZ): `192.168.50.0/24`, HSRP VIP `192.168.50.1`, SW1 SVI `.2`, SW2 SVI `.3`. DMZ Web Server: `192.168.50.10`.
  - `[verified]` L3 Transit Links: `10.0.0.0/30` (R1-R2), `10.0.1.0/30` (R1-SW1), `10.0.1.4/30` (R1-SW2), `10.0.1.8/30` (R2-SW1), `10.0.1.12/30` (R2-SW2).
  - `[verified]` HSRP configuration: SW1 has priority 110 with preemption (active gateway by default); SW2 has priority 100.
  - `[verified]` OSPF process 1 area 0 on L3 transit links.
  - `[verified]` Layer 2: 802.1Q trunking, Rapid PVST+, LACP EtherChannel (Port-channel1 between SW1 and SW2).
  - `[verified]` ACL policy: `ACL_VLAN30_IN` permits Student traffic to Web (`192.168.40.10` port 80/443), while denying FTP (`192.168.40.12` port 21).
  - `[verified]` Tests documented in repo: OSPF neighbor state FULL, HSRP failover upon SW1 SVI shutdown, EtherChannel member failure (Fa0/23 down, Fa0/24 up), RSTP uplink failover on SW4, ACL allow/deny tests.
  - `[verified]` Stated limitation in README: Redundancy is concentrated in routing and core/distribution layers, not end-to-end host dual-homing.
- **Unverified / Proprietary Status:**
  - `[unverified]` The binary `.pkt` file requires Cisco Packet Tracer proprietary software. No real-time programmatic bridge exists between the browser and Packet Tracer.
