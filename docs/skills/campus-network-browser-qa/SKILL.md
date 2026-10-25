---
name: campus-network-browser-qa
description: End-to-end Playwright and Vitest validation rules, assertion checklists, and cross-device testing standards.
---

# Campus Network Browser QA Skill

This skill defines the testing protocols to guarantee robust, zero-error delivery of the network simulator.

## QA Checkpoints:
1. **Unit Test Coverage**:
   - Dijkstra path computation and tie-breaking.
   - Packet accounting invariants: `generated == delivered + dropped + in_flight`.
   - Explicit causal drop tagging (`no_route`, `link_down`, `vlan_policy_denied`, `queue_overflow`).
   - QoS strict priority preemption vs FIFO tail-drop.
   - Deterministic reproducibility under identical PRNG seed.
2. **Browser Responsiveness**:
   - Test at standard resolutions: `1920x1080` (Desktop), `1366x768` (Laptop), and `390x844` (Mobile).
   - Verify zero horizontal page scrolling at all viewports.
   - Verify touch targets $\ge 44\text{px}$.
3. **Runtime & Accessibility Audit**:
   - Zero console errors or unhandled exceptions.
   - Contrast ratio $\ge 4.5:1$ (WCAG AA).
   - Keyboard navigation: Accessible focus rings on all interactive buttons, inputs, and toggles.
   - Clean interval teardown on preset change or component unmount.
