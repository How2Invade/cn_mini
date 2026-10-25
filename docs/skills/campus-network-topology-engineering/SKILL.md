---
name: campus-network-topology-engineering
description: Guidelines for managing network topology models, stable node IDs, link states, and Dijkstra pathfinding with deterministic tie-breaking.
---

# Campus Network Topology Engineering Skill

This skill defines the architectural rules for modeling campus network topologies cleanly and deterministically.

## Key Principles:
1. **Single Source of Truth**: All device and link definitions reside in the simulation engine model, never in UI component state.
2. **Stable Identifiers**: Use semantic, immutable device IDs (e.g. `R1`, `SW1`, `SW3`, `PC-STUD`, `SRV-WEB`). Links are identified by sorted endpoint pairs (`L_SW1_SW3`).
3. **Deterministic Routing**:
   - Compute shortest paths with Dijkstra's algorithm using configured interface costs.
   - Deterministic tie-breaking: when path costs are equal, choose the next hop with the lexicographically smaller device ID.
4. **VLAN Boundary Integrity**:
   - Devices in different VLANs can only communicate through a Layer 3 routing interface (SVI or Router).
   - Direct L2 connections across disparate VLANs without a trunk/router must fail.
5. **State Separation**:
   - Network state (link up/down, queue occupancy, routing tables) is strictly separated from animation rendering state (coordinates, SVG bezier paths, particle progress).
