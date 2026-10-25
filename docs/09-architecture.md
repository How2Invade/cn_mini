# 09 - Software Architecture & Technology Stack

## Technology Stack & Pinned Versions
- **Node.js**: v22.17.0
- **Package Manager**: npm 11.4.2
- **Framework**: React 19 + TypeScript (Strict mode enabled)
- **Bundler & Dev Server**: Vite 6.x
- **Styling**: Tailwind CSS v3 with technical white-and-slate tokens
- **Interactive Canvas**: `@xyflow/react` (React Flow)
- **Charts**: `recharts`
- **Icons**: `lucide-react`
- **Unit & Integration Testing**: `vitest`
- **Browser Automation & End-to-End**: `@playwright/test`

## Folder Structure
```
cn_web_app/
├── docs/                      # Reference documentation & specs (00 to 11)
│   ├── 00-project-brief.md
│   ├── 01-source-facts.md
│   ├── ...
│   ├── 11-packet-tracer-evidence.md  # Unpopulated per instructions
│   └── professor-qa.md
│   └── skills/                # Project workflow skills
├── src/
│   ├── simulation/            # PURE TypeScript Simulation Engine (No React)
│   │   ├── types.ts           # Device, Link, Packet, Event, Metric interfaces
│   │   ├── graph.ts           # Dijkstra algorithm with deterministic tie-breaking
│   │   ├── engine.ts          # Discrete-event tick loop, packet lifecycle, QoS
│   │   ├── presets.ts         # Preset 1-8 network topologies and scenarios
│   │   └── __tests__/         # Pure engine unit tests (Vitest)
│   ├── components/            # UI Presentation Layer
│   │   ├── Header.tsx         # Title, modes, evidence tags, presentation toggle
│   │   ├── PresetsBar.tsx     # Scenario selector pills
│   │   ├── TopologyCanvas.tsx # React Flow canvas with custom nodes and animated edges
│   │   ├── CustomNodes.tsx    # Router, Switch, Server, PC visual components
│   │   ├── ControlPanel.tsx   # Run, pause, step, speed, traffic generation, failure injection
│   │   ├── Inspectors.tsx     # Device & Link inspector panels (Simple/Nerd view)
│   │   ├── MetricsDashboard.tsx # Cards & Recharts visualizations with evidence badges
│   │   ├── EventLog.tsx       # Filterable event audit log
│   │   ├── Copilot.tsx        # Deterministic diagnostic explainability
│   │   ├── GuidedDemo.tsx     # 7-step interactive scenario walkthrough
│   │   ├── ComparisonView.tsx # Side-by-side Baseline vs. Enhanced matrix
│   │   ├── ResearchPanel.tsx  # Academic attribution, DOI links, 3-way split
│   │   ├── ProfessorFAQ.tsx   # 12 evaluative questions and honest answers
│   │   └── Footer.tsx         # Legal notices, CC BY 4.0, Demian credit
│   ├── context/               # State management (connecting engine to React)
│   │   └── SimulationContext.tsx
│   ├── App.tsx                # Main single-page application layout
│   ├── index.css              # Custom styling tokens and scrollbar resets
│   └── main.tsx               # App entrypoint
├── tests/                     # Playwright browser integration tests
├── AGENTS.md                  # Project rules & constraints
├── DECISIONS.md               # Logged architectural and technical decisions
├── PROGRESS.md                # Task checklist & milestone completion
└── README.md                  # Project overview, installation, testing commands
```

## Layer Boundaries
1. **Engine Layer (`src/simulation/`)**:
   - Zero React dependencies. Zero DOM dependencies.
   - Operates on immutable or cleanly managed state structures.
   - Can be executed in headless Node.js CLI or test runners with 100% determinism.
2. **Presentation Layer (`src/components/`)**:
   - Reads simulation state snapshots emitted per tick or action.
   - Never mutates engine internals directly; dispatches command actions (`step()`, `injectFailure()`, `generateTraffic()`).
