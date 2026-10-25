# 06 - Design System Tokens & Aesthetics

## Aesthetic Principles
- **Aesthetic Tone:** Clean, bright, academic, technical network laboratory.
- **Strictly Prohibited:** Dark modes, dark neon themes, heavy gradients, glassmorphism, generic AI dashboard look, stock illustrations.
- **Strictly Required:** Precision typography, explicit evidence badges, sharp borders, structured data grids, high contrast (WCAG AA).

## Color Tokens
| Token | Hex Value | Usage |
|---|---|---|
| `bg-main` | `#FFFFFF` | Primary canvas & page background |
| `surface-main` | `#F7F9FC` | Card & inspector surfaces |
| `surface-subtle` | `#EDF2F7` | Muted headers, tab backgrounds |
| `text-primary` | `#172033` | Primary body text, titles, values |
| `text-muted` | `#637083` | Subtitles, labels, secondary metadata |
| `border-subtle` | `#E3E8EF` | Card outlines, dividers, table borders |
| `border-strong` | `#CBD5E1` | Interactive borders, focus states |
| `primary` | `#2563EB` | Active buttons, brand accents, primary routes |
| `primary-hover` | `#1D4ED8` | Hover state for primary buttons |
| `healthy` | `#16A34A` | Up status, delivered packets, 0% loss |
| `warning` | `#D97706` | Queue pressure, reconvergence delay, standby route |
| `failure` | `#DC2626` | Severed links, dropped packets, outage states |
| `packet-accent` | `#0EA5E9` | Animated packet dots, in-flight markers |
| `secondary-accent`| `#7C3AED`| Admin traffic, secondary core paths |

## Typography
- **Primary Body Font:** Inter / IBM Plex Sans (modern, readable, crisp).
- **Monospace Font:** JetBrains Mono / Fira Code / ui-monospace.
  - *Usage Rule:* Monospace is strictly reserved for: IP addresses, subnet masks, interface names (e.g. `Gi0/1`), VLAN tags, packet tracking IDs, hex hashes, formulas, and simulated diagnostic logs.

## Grid & Container
- Max container width: `1440px`.
- Consistent page gutters: `24px` on desktop, `16px` on tablet/mobile.
- Responsive breakpoints:
  - Phone: `390px` to `640px` (single column, scrollable canvas/inspector drawers).
  - Laptop: `1366px x 768px` (balanced two-panel layout, compact canvas).
  - Projector / Large Desktop: `1920px x 1080px` (three-column high-density lab view).
