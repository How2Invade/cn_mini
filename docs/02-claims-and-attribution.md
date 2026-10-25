# 02 - Claims and Attribution Guidelines

## Allowed vs. Forbidden Claims

### Allowed Claims
1. "This web application is a standalone, deterministic browser-based discrete-event simulation of campus network topologies and traffic dynamics."
2. "The network architecture, addressing scheme, and device inventory of the Enhanced preset are modeled directly on Anton-Alexandru Demian's open-source Cisco Packet Tracer design."
3. "The single-core hierarchical layout of the Baseline preset models the conceptual structure described in Varne et al. (2023)."
4. "Convergence delays and gateway failovers abstract OSPF, RSTP, and HSRP protocols as shortest-path graph recomputations with configured latency penalties."
5. "Strict priority QoS queueing is actively simulated in the browser engine to show packet drop avoidance under offered traffic loads."

### Strictly Forbidden Claims
1. **DO NOT** claim or imply that the web app connects to, controls, or reads live telemetry from Cisco Packet Tracer.
2. **DO NOT** claim the web app runs Cisco IOS, executes Cisco binary code, or interfaces with real enterprise switches/routers.
3. **DO NOT** credit the Varne et al. (2023) research paper with quantitative failure measurements, HSRP tests, or QoS benchmark results, as those were only mentioned in survey text.
4. **DO NOT** fabricate latency, jitter, or recovery timings as "Packet Tracer results".

## Mandatory Evidence Labels
Every single metric, chart, and table on the website must feature one of the following exact badges:
- `Browser-simulated`: Dynamically produced by our JavaScript/TypeScript simulation engine.
- `Imported Packet Tracer observation`: Verified qualitative or quantitative observation imported directly from verified Packet Tracer documentation or `docs/11-packet-tracer-evidence.md`.
- `Calculated from recorded data`: Mathematical derivation from recorded simulation runs (e.g. `loss% = dropped/generated * 100`).
- `Unavailable`: Metric is not currently supported or measured (e.g., real-hardware ASIC temperatures or raw Packet Tracer timings prior to manual import).

## Attribution Texts
- **Research Paper Citation:**
  > Varne, P. N., Priyanka, J., Shetty V, S., Tejus, A. K., & Gowda, N. C. (2023). Campus Network Design and Implementation using Cisco Packet Tracer. *International Journal of Computational Learning & Intelligence*, 2(4), 163–168. https://doi.org/10.5281/zenodo.10254264 [CC BY 4.0]
- **Packet Tracer Reference Project:**
  > Demian, A.-A. (2023). Redundant Data Center–Campus Network. Politehnica University of Timisoara. https://github.com/antondemian/redundant-data-center-campus-network
