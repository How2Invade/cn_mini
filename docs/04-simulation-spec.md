# 04 - Simulation Specification

## 1. Engine Core Concepts
The simulation is a discrete-event, deterministic step engine running at a fixed tick resolution (default 100ms per tick, controllable in UI: 0.5x, 1x, 2x, 5x, or single-step).

### Determinism Rules
- RNG: A pseudo-random linear congruential generator (LCG) or Mulberry32 initialized with a constant seed (e.g., `seed = 42`).
- Dijkstra Tie-Breaking: If two equal-cost paths exist, pick the path whose next-hop node has the lexicographically smaller device ID (`id_A < id_B`).
- Identical initial seeds and event injections will always yield 100% bit-for-bit identical packet counts, drop records, and recovery ticks.

## 2. Packet Lifecycle & States
A packet traverses the following strict state transitions:
1. `CREATED`: Generated at source device on tick $T_g$.
2. `QUEUED`: Enqueued at the egress interface queue of the current node. If link queue depth $\ge \text{maxQueueLimit}$, packet transitions directly to `DROPPED` with reason `queue_overflow`.
3. `IN_TRANSIT`: Transmitted across the link at the tick boundary. Takes $1 \text{ tick}$ per hop.
4. Terminal States:
   - `DELIVERED`: Arrives at destination node successfully.
   - `DROPPED`: Discarded with an explicit drop reason.
   - `FAILED`: Route lookup failed due to network partition or black hole.

### Explicit Drop Reasons
- `no_route`: No valid Dijkstra path exists to the destination subnet.
- `link_down`: In-flight packet attempted traversal over a severed link.
- `destination_unreachable`: Node is offline or server service is disabled.
- `vlan_policy_denied`: Packet rejected by ACL rules (e.g. Student VLAN attempting FTP or DMZ direct probe).
- `queue_overflow`: Tail-drop due to link buffer exhaustion.

## 3. Failure & Reconvergence Model
- Disabling a link sets its state to `DOWN`.
- Any packets actively in-flight on that specific link at that tick are immediately dropped with reason `link_down`.
- **Reconvergence Delay ($\Delta T_{conv}$)**: Routing tables do NOT instantly heal. A configurable delay (default 5 ticks) simulates OSPF LSA propagation, SPF calculation, and RSTP topology change notification.
- Packets generated during $\Delta T_{conv}$ that would use the severed link are dropped.
- After $\Delta T_{conv}$, the engine executes Dijkstra on remaining operational links and updates all forwarding information bases (FIBs).
- **Recovery Time**: Ticks elapsed between failure injection and the first packet successfully delivered along the alternate path.

## 4. Congestion & QoS Model
- Link buffer has a finite capacity $Q_{max}$ (e.g. 10 packets).
- Two Traffic Classes:
  - `CLASS_HIGH`: Priority traffic (Voice, LMS exams, emergency alarms).
  - `CLASS_BEST_EFFORT`: Bulk traffic (Student downloads, web background assets).
- **When QoS Policy is Disabled (FIFO/Tail-Drop)**: All packets share the same queue. Once $Q \ge Q_{max}$, incoming packets are dropped regardless of priority.
- **When QoS Policy is Enabled (Strict Priority Queueing)**: High-priority packets preempt Best-Effort packets in the service order. Best-Effort packets buffer or drop first, preserving 0% loss for High-Priority streams under heavy offered load.

## 5. Metrics & Mathematical Formulas
Every metric displayed in Nerd Mode exposes its exact formula:
- **Packets Generated ($N_{gen}$)**: Total packets injected by sources.
- **Packets Delivered ($N_{del}$)**: Total packets arriving at target.
- **Packets Dropped ($N_{drop}$)**: Total packets dropped across all drop reasons.
- **Packets In-Flight ($N_{fly}$)**: $N_{gen} - (N_{del} + N_{drop})$.
- **Delivery Rate ($\%$)**:
  $$\text{Delivery \%} = \frac{N_{del}}{N_{gen}} \times 100$$
- **Packet Loss Rate ($\%$)**:
  $$\text{Loss \%} = \frac{N_{drop}}{N_{gen}} \times 100$$
  *(Note: Loss rate is finalized only when $N_{fly} = 0$).*
- **Link Utilization ($\%$)**:
  $$\text{Util \%} = \frac{\text{Current Active Traffic}}{\text{Link Bandwidth Capacity}} \times 100$$
- **Queue Occupancy ($\%$)**:
  $$\text{Queue \%} = \frac{Q_{current}}{Q_{max}} \times 100$$
