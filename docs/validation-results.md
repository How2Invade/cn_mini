# Validation & Test Results

## 1. Unit Testing (Vitest)
- **Suite:** `src/simulation/__tests__/engine.test.ts`
- **Result:** 8 tests passed, 0 failed.
  - `Preset 1: Research Paper Baseline initializes correctly` (PASS)
  - `Dijkstra: calculates correct shortest path on baseline` (PASS)
  - `Preset 2: Enhanced network prefers SW1 over SW2 due to lower cost` (PASS)
  - `Link Failure: reroutes through alternate path SW2 when primary SW1 uplink fails` (PASS)
  - `Packet Accounting Invariant: generated == delivered + dropped + in_flight` (PASS)
  - `Determinism: two runs with identical inputs produce identical logs and metrics` (PASS)
  - `Security: Student access to FTP is blocked by ACL policy with vlan_policy_denied` (PASS)
  - `QoS Strict Priority: Voice/LMS traffic preempts buffer over Best-Effort` (PASS)

## 2. End-to-End Browser Testing (Playwright)
- **Suite:** `tests/app.spec.ts`
- **Target URL:** `http://localhost:4173`
- **Viewports Tested:**
  - Desktop 1920x1080 (PASS)
  - Laptop 1366x768 (PASS)
  - Mobile 390x844 (PASS)
- **Results:** 3/3 passed across all viewports with zero console runtime errors and responsive layout.

## 3. Production Static Build Verification
- **Command:** `npm run build`
- **Bundler:** Vite v6.4.5 + TypeScript Strict (`tsc`)
- **Outcome:** Static assets generated cleanly in `dist/` with gzip compression (~263 kB JS, ~7 kB CSS).
