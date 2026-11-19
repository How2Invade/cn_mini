import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { EvidenceBadge } from './EvidenceBadge';

interface FAQItem {
  q: string;
  a: string;
}

export const ProfessorFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'Q1: Is this data from a live Cisco Packet Tracer instance?',
      a: 'No. This web application is a standalone, browser-based discrete-event simulation engine built with pure TypeScript and React. It is not connected to Cisco Packet Tracer, does not execute Cisco IOS, and does not read live hardware telemetry. Every metric produced is explicitly labeled [Browser-simulated].',
    },
    {
      q: 'Q2: What is actually "adaptive" in this simulator?',
      a: 'In this simulation, "adaptive" refers specifically to deterministic algorithmic reactions to network topology state: (1) dynamic shortest-path recalculation (Dijkstra) upon link failure after a protocol convergence delay, and (2) active queue management and strict priority QoS scheduling that dynamically preserves critical traffic classes during buffer saturation.',
    },
    {
      q: 'Q3: How does your routing model differ from real OSPF?',
      a: 'Real OSPF involves exchange of Hello packets, Link-State Advertisements (LSAs), Designated Router (DR/BDR) elections, Dijkstra SPF calculations, and FIB installation in hardware TCAM. Our simulator abstracts this process by calculating the global shortest-path graph directly, but enforces an explicit, configurable reconvergence delay (ΔT_conv) during which routing is suspended, dropping in-flight packets to realistically mirror protocol convergence latency.',
    },
    {
      q: 'Q4: How does your gateway redundancy model differ from Cisco HSRP?',
      a: 'Real HSRP sends periodic UDP multicast hellos (224.0.0.2 / 224.0.0.102) between routers to negotiate Active and Standby virtual IP ownership. In our model, we track configured HSRP priorities (SW1: 110, SW2: 100) and virtual IP mappings (192.168.x.1). If SW1 or its uplink fails, the simulation engine automatically shifts the virtual gateway binding to SW2 after the configured reconvergence timer.',
    },
    {
      q: 'Q5: What does the research paper (Varne et al., 2023) actually contribute?',
      a: 'The Varne et al. paper presents a conceptual three-tier campus network design (Core, Distribution, Access) segmented by department VLANs with DHCP. However, our verification of the published PDF reveals that protocols such as EIGRP, HSRP, and QoS are only listed in text; the paper contains zero failure injection tests, zero redundancy measurements, and only a single ping screenshot with an initial 25% ARP resolution delay. We represent this design faithfully as our single-path Baseline preset.',
    },
    {
      q: 'Q6: What does the antondemian repository contribute?',
      a: "Anton-Alexandru Demian's bachelor's thesis repository provides the concrete enterprise topology, VLAN addressing plan (192.168.10.0/24 through 50.0/24), HSRP gateway configuration, OSPF transit links, RSTP uplinks, EtherChannel bonding, and extended ACL rules. We used these exact device names, subnets, and routing costs to build our Enhanced Dual-Core preset.",
    },
    {
      q: 'Q7: What does this web application add beyond the paper and the GitHub repository?',
      a: '1. A zero-install, interactive visual laboratory that allows immediate hands-on experimentation without proprietary Cisco software.\n2. Real-time discrete-event packet flow animation, buffer queue visibility, and dynamic link failure injection.\n3. An active QoS priority queueing simulation demonstrating packet preservation under congestion.\n4. Side-by-side resilience comparison between single-path and dual-core redundant topologies.\n5. A deterministic Network Copilot explaining causality and routing decisions.',
    },
    {
      q: 'Q8: Why do first packets sometimes drop in the ping test?',
      a: 'In real networks (and in Cisco Packet Tracer Fig. 3), the first ICMP request is frequently dropped while Address Resolution Protocol (ARP) resolves the MAC address of the default gateway or destination. In our simulation, drops are explicitly tagged with causal reasons: no_route, link_down, vlan_policy_denied, or queue_overflow.',
    },
    {
      q: 'Q9: Can this simulation handle packet loops?',
      a: 'The simulation engine verifies graph connectivity and loop-free shortest paths using Dijkstra algorithm. When users add or toggle links in arbitrary ways, our topology validator detects potential Layer 2 broadcast loops and highlights alternate ports in blocking state, mimicking Rapid Spanning Tree Protocol (RSTP).',
    },
    {
      q: 'Q10: How are packet drops and loss percentages calculated?',
      a: 'Loss percentage is computed strictly as: Loss % = (Total Dropped Packets / Total Generated Packets) * 100. To guarantee scientific integrity and prevent false transient values, this metric is finalized only when all in-flight packets have reached either a delivered or dropped state. There is zero double counting.',
    },
    {
      q: 'Q11: What are the primary limitations of this simulation?',
      a: '1. It is a discrete-time abstraction (1 tick = ~100-250ms), not an analog or cycle-accurate ASIC hardware simulator.\n2. It does not emulate full Cisco IOS syntax or the complete binary packet headers (TCP windowing, SYN/ACK handshakes, MTU fragmentation).\n3. Bandwidth and latency are modeled as packet units per tick rather than continuous analog megabits per second.',
    },
    {
      q: 'Q12: Why did you provide both Simple Mode and Nerd Mode?',
      a: 'Simple Mode allows students or non-specialists to quickly grasp high-level network topology, link failure impact, and packet routing. Nerd Mode exposes professional network engineering diagnostic telemetry: exact IP/CIDR masks, interface names (e.g. Gi0/1), VLAN IDs, forwarding tables, link metrics, buffer queue depths, and mathematical formulas.',
    },
  ];

  return (
    <div className="bg-paper-raised dark:bg-ink-raised border border-paper-line dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-emerald-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Common questions about simulation mechanics, protocols, and architecture</p>
          </div>
        </div>
        <EvidenceBadge type="Calculated from recorded data" compact />
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-paper-line dark:border-slate-800 rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left px-4 py-3.5 bg-stone-50 dark:bg-slate-900/80 hover:bg-stone-100 dark:hover:bg-slate-800/80 flex items-center justify-between gap-2 text-xs font-semibold text-slate-900 dark:text-white transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="p-4 bg-paper-raised dark:bg-[#121315] text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-stone-100 dark:border-slate-800 whitespace-pre-line">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3.5 bg-stone-100 dark:bg-slate-900 rounded-xl border border-paper-line dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <AlertCircle className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800 dark:text-white">Simulation Mechanics:</span> All packet traversal, shortest-path calculation, and convergence delays execute deterministically in the client-side discrete-event engine with explicit causal drop tracing.
        </div>
      </div>
    </div>
  );
};
