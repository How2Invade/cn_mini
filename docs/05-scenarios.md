# 05 - Simulation Scenarios

This document details the 8 built-in simulation scenarios, their initial states, injection steps, expected outcomes, and success criteria.

## Preset 1: Research Paper Baseline
- **Description:** Single-path hierarchical campus network reflecting Varne et al. (2023).
- **Initial State:** Core router `R-CORE`, single distribution switch `SW-DIST`, access switches `SW-ACC-A` and `SW-ACC-B`. All links operational.
- **Action:** Send traffic from `PC-STUD` to `SRV-CAMPUS`.
- **Expected Outcome:** 100% delivery along the single available path.
- **Success Criteria:** Packets traverse `PC-STUD` -> `SW-ACC-B` -> `SW-DIST` -> `SRV-CAMPUS`.

## Preset 2: Enhanced Campus Network
- **Description:** Dual-core redundant architecture based on Anton-Alexandru Demian's design.
- **Initial State:** Dual core switches `SW1`/`SW2` with HSRP, dual routers `R1`/`R2`, distribution switches `SW3`/`SW4`.
- **Action:** Send traffic from `PC-STUD` to `SRV-WEB`.
- **Expected Outcome:** Packets choose primary path through `SW1` (HSRP Active).
- **Success Criteria:** Primary path highlighted, 100% delivery, standby path via `SW2` identified.

## Preset 3: Normal Student Traffic
- **Description:** Steady-state student traffic flow accessing the internal web portal.
- **Initial State:** Enhanced network fully healthy.
- **Action:** Stream 20 packets from `PC-STUD` to `SRV-WEB` at 2 pkts/tick.
- **Expected Outcome:** Smooth transmission, zero queue drops, 100% delivery rate.

## Preset 4: Primary-Link Failure
- **Description:** Real-time link failure comparison between baseline and enhanced networks.
- **Action:** Disconnect the primary uplink while continuous traffic is flowing.
- **Expected Outcome:**
  - In Baseline: Total permanent outage (100% packet drop, `no_route`).
  - In Enhanced: Temporary drop during reconvergence window (5 ticks), followed by automatic rerouting through `SW2` with full recovery.
- **Success Criteria:** Quantitative recovery time calculated; loss during reconvergence isolated.

## Preset 5: Recovery After Failure
- **Description:** Restoring a severed link and observing topology reconvergence back to primary.
- **Action:** Re-enable disabled primary link.
- **Expected Outcome:** Physical restoration happens at tick $T_r$, followed by shortest-path reversion to `SW1` after route refresh. Zero packets lost during clean reversion.

## Preset 6: Traffic Congestion & QoS
- **Description:** High offered load on an access-distribution bottleneck with competing traffic classes.
- **Action:** Send concurrent bursts of `CLASS_HIGH` (Voice/LMS) and `CLASS_BEST_EFFORT` (Bulk).
  - Test A: QoS disabled (FIFO). Both classes suffer tail-drop once queue hits 10 packets.
  - Test B: QoS enabled (Strict Priority). `CLASS_HIGH` maintains 100% delivery while `CLASS_BEST_EFFORT` buffers and tail-drops.
- **Success Criteria:** Side-by-side metric proving differential loss rates.

## Preset 7: VLAN Isolation & ACL Policy
- **Description:** Security zoning enforcement based on `ACL_VLAN30_IN`.
- **Action:**
  - Case A: `PC-STUD` sends HTTP traffic to `SRV-WEB` (`192.168.40.10:80`). Expected: Allowed.
  - Case B: `PC-STUD` attempts FTP to `SRV-FTP` (`192.168.40.12:21`) or probes Management VLAN. Expected: Dropped with `vlan_policy_denied`.

## Preset 8: Server Unavailable
- **Description:** Destination endpoint failure.
- **Action:** Server service disabled or host offline; traffic dispatched to destination IP.
- **Expected Outcome:** Packet reaches the final gateway/switch, but drops at egress with `destination_unreachable`.
