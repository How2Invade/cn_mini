---
name: network-anatomy-visualization
description: Rendering rules for topology nodes, animated packets, queue bars, VLAN envelopes, and failure states in a technical 2D canvas.
---

# Network Anatomy Visualization Skill

This skill governs the visual representation of campus networks using React Flow and standard SVG/CSS.

## Visual Design Rules:
1. **Bright Scientific Lab Aesthetic**: Clean white `#FFFFFF` canvas with light surface panels (`#F7F9FC`) and crisp borders (`#E3E8EF`).
2. **Device Nodes**:
   - Distinct iconic representations for Routers (cylindrical L3), Multilayer Switches (L3 core), Switches (L2 distribution/access), Endpoints (Workstations, Servers).
   - Display node hostname, primary IP, and active VLAN badge.
   - Nerd Mode reveals MAC addresses, full interface lists (e.g. `Gi0/1`, `Fa0/24`), and active gateway state.
3. **Links & Media**:
   - Operational links: Crisp slate-grey or green with metric cost label.
   - Severed/Failed links: Bright red dashed line with an unmistakable `DOWN` indicator.
   - Standby/Blocked links (RSTP): Orange dashed line indicating alternate backup readiness.
4. **Packet Animation**:
   - Animated SVG circular tokens traversing along the exact Dijkstra computed edge path.
   - Color coded by traffic class: Light Blue (`#0EA5E9`) for bulk, Violet (`#7C3AED`) for high priority LMS/Voice.
   - Cap maximum concurrent rendered particles at 60 to prevent frame drops.
   - Full support for `prefers-reduced-motion`.
