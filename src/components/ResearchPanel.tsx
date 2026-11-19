import React from 'react';
import { ExternalLink, BookOpen, GitFork, Award } from 'lucide-react';
import { EvidenceBadge } from './EvidenceBadge';

export const ResearchPanel: React.FC = () => {
  return (
    <div className="bg-paper-raised dark:bg-ink-raised border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Research & Academic Attribution</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Full academic citations, source verification status, and clear delineation of deliverables.
            </p>
          </div>
        </div>
      </div>

      {/* 3-Way Deliverables Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-blue-700 dark:text-sky-400 font-semibold text-xs">
            <BookOpen className="w-4 h-4" />
            <span>1. Research Foundation</span>
          </div>
          <div className="font-semibold text-xs text-slate-900 dark:text-white">
            Varne et al. (REVA University, 2023)
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Provided conceptual 3-tier campus layout, building access switches, departmental VLAN segmentation (192.168.x.0/24), and initial ping baseline.
          </p>
          <div className="text-[11px] text-amber-800 dark:text-amber-300 font-mono bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
            *Verification Fact: Protocols like EIGRP, HSRP, and QoS were only mentioned in survey text without Packet Tracer topology tests.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold text-xs">
            <GitFork className="w-4 h-4" />
            <span>2. Packet Tracer Implementation</span>
          </div>
          <div className="font-semibold text-xs text-slate-900 dark:text-white">
            Anton-Alexandru Demian (2023)
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Source of our Enhanced Campus Network: dual core multilayer switches (SW1/SW2), HSRP gateway redundancy, OSPF Area 0, EtherChannel Po1, and ACL_VLAN30_IN.
          </p>
          <div className="text-[11px] text-indigo-800 dark:text-indigo-300 font-mono bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
            *Verification Fact: Anton Demian’s bachelor's thesis contains verified screenshots of HSRP and RSTP failover in Packet Tracer.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
            <Award className="w-4 h-4" />
            <span>3. Our Simulator Extensions</span>
          </div>
          <div className="font-semibold text-xs text-slate-900 dark:text-white">
            Independent Web Network Laboratory
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Built this pure TypeScript discrete-event simulation engine, live React Flow interactive canvas, strict priority QoS scheduling, deterministic Copilot, and side-by-side resilience analysis.
          </p>
          <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            *Honesty Rule: Zero Cisco hardware emulation. Strictly discrete-event graph mathematics in the browser.
          </div>
        </div>
      </div>

      {/* Verification Matrix Table */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Topological Verification Matrix</h3>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3">Area</th>
                <th className="p-3">Source Foundation</th>
                <th className="p-3">Our Implementation</th>
                <th className="p-3">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">Campus Topology</td>
                <td className="p-3">Varne et al. (Baseline) / Demian (Dual-Core)</td>
                <td className="p-3 font-mono">React Flow interactive graph with 13 devices</td>
                <td className="p-3"><EvidenceBadge type="Imported Packet Tracer observation" /></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">VLAN Segmentation</td>
                <td className="p-3">VLANs 10, 20, 30, 40, 50 (Demian addressing plan)</td>
                <td className="p-3 font-mono">Mapped SVIs, endpoints, and subnet prefixes</td>
                <td className="p-3"><EvidenceBadge type="Imported Packet Tracer observation" /></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">Gateway Redundancy</td>
                <td className="p-3">HSRP group 10-50 (SW1 priority 110, SW2 100)</td>
                <td className="p-3 font-mono">Simulated primary/backup gateway selection</td>
                <td className="p-3"><EvidenceBadge type="Browser-simulated" /></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">Dynamic Routing</td>
                <td className="p-3">OSPF Area 0 over 10.0.x.x /30 transit links</td>
                <td className="p-3 font-mono">Dijkstra shortest path with tie-breaking</td>
                <td className="p-3"><EvidenceBadge type="Browser-simulated" /></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">Traffic QoS & Scheduling</td>
                <td className="p-3">Mentioned in paper; absent in Packet Tracer test matrix</td>
                <td className="p-3 font-mono">Active strict priority queueing & tail drop</td>
                <td className="p-3"><EvidenceBadge type="Browser-simulated" /></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">Hardware Metrics</td>
                <td className="p-3">Unpublished raw Packet Tracer latency timers</td>
                <td className="p-3 font-mono">Awaiting author import (docs/11)</td>
                <td className="p-3"><EvidenceBadge type="Unavailable" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Bibliographic Citations */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300">Official Bibliographic References (IEEE Style):</h4>
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] space-y-2">
          <div>
            [1] P. N. Varne, J. Priyanka, S. Shetty V, T. A. K, and N. C. Gowda, "Campus Network Design and Implementation using Cisco Packet Tracer," <em>International Journal of Computational Learning & Intelligence</em>, vol. 2, no. 4, pp. 163–168, Oct. 2023. DOI: <a href="https://doi.org/10.5281/zenodo.10254264" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-sky-400 underline inline-flex items-center gap-0.5">10.5281/zenodo.10254264 <ExternalLink className="w-3 h-3" /></a> (Licensed under CC BY 4.0).
          </div>
          <div>
            [2] A.-A. Demian, "Redundant Data Center–Campus Network," Bachelor's Thesis, Politehnica University of Timisoara, 2023. GitHub: <a href="https://github.com/antondemian/redundant-data-center-campus-network" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-sky-400 underline inline-flex items-center gap-0.5">antondemian/redundant-data-center-campus-network <ExternalLink className="w-3 h-3" /></a>.
          </div>
        </div>
      </div>
    </div>
  );
};
