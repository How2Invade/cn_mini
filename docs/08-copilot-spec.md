# 08 - Network Copilot Specification

The Network Copilot is a deterministic, template-based diagnosis engine that analyzes live simulation state and provides human-readable explanations. It does **not** rely on third-party cloud APIs, external LLMs, or non-deterministic generators.

## Core Templates & Trigger Rules

### 1. Link Severed & Reconvergence Pending
- **Condition:** A link transitioned to `DOWN`, and current tick $T < T_{fail} + \Delta T_{conv}$.
- **Template:**
  - *What happened:* Primary link `{linkId}` ({source} <-> {target}) failed at tick `{failTick}`.
  - *Why:* Physical link severed or interface administratively shut down.
  - *Protocol state:* Abstracted routing reconvergence in progress ({ticksRemaining} ticks remaining). Packets targeted to this path will be dropped.
  - *Evidence:* Engine event `LINK_DOWN`, route cache invalidated.
  - *Suggestion:* Observe the event log to monitor packet drops during this convergence window.

### 2. Path Rerouted & Reconvergence Complete
- **Condition:** Link is `DOWN`, current tick $\ge T_{fail} + \Delta T_{conv}$, and an alternate path was found via Dijkstra.
- **Template:**
  - *What happened:* Traffic from `{source}` to `{destination}` has successfully rerouted via alternate node `{alternateHop}`.
  - *Why:* Shortest-path calculation identified `{newPath}` with total metric `{newCost}` (previous metric: `{oldCost}`).
  - *Evidence:* Delivery resumed at tick `{resumeTick}`, total recovery delay: `{recoveryTicks}` ticks.
  - *Suggestion:* Compare this recovery with the single-path Baseline preset, which exhibits 100% permanent packet loss.

### 3. Total Partition (Black Hole)
- **Condition:** Destination unreachable across all operational links.
- **Template:**
  - *What happened:* All paths between `{source}` and `{destination}` are severed.
  - *Why:* The network lacks redundant physical paths or active default gateways between these subnets.
  - *Evidence:* Dijkstra returned empty path; packets dropped with `no_route`.
  - *Suggestion:* Restore link `{linkId}` or switch to the Enhanced Dual-Core preset.

### 4. QoS Buffer Congestion & Priority Preemption
- **Condition:** Link buffer occupancy $\ge 80\%$, packets dropped with `queue_overflow`.
- **Template:**
  - *What happened:* Link `{linkId}` is congested (Queue: `{currentQueue}/{maxQueue}`).
  - *Why:* Offered traffic rate ({rate} pkts/tick) exceeds link capacity ({capacity} pkts/tick).
  - *QoS Policy Status:* `{qosEnabled ? "ENABLED: High-priority Voice/LMS packets maintained 0% loss; Best-effort packets dropped." : "DISABLED: First-in, first-out tail-drop affecting all traffic indiscriminately."}`
  - *Suggestion:* `{qosEnabled ? "Disable QoS to see how critical packets get dropped under equal load." : "Enable QoS strict priority scheduling to protect critical traffic."}`

### 5. VLAN Access Violation
- **Condition:** Packet dropped with reason `vlan_policy_denied`.
- **Template:**
  - *What happened:* Packet from `{source}` (VLAN {srcVlan}) to `{destination}` (VLAN {dstVlan}) was rejected.
  - *Why:* Access Control List rule `ACL_VLAN30_IN` prohibits student workstations from accessing FTP port 21 or administrative subnets.
  - *Evidence:* Security rule drop event logged at router/switch `{nodeId}`.
  - *Suggestion:* Test allowable web access to `{destination}` on HTTP port 80/443.
