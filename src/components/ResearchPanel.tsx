import React from 'react';
import { ExternalLink, BookOpen, GitFork, Award } from 'lucide-react';
import { EvidenceBadge } from './EvidenceBadge';

export const ResearchPanel: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-800">Research & Academic Attribution</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Full academic citations, source verification status, and clear delineation of deliverables.
        </p>
      </div>

      {/* 3-Way Deliverables Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
            <BookOpen className="w-4 h-4" />
            <span>1. Research Foundation</span>
          </div>
          <div className="font-semibold text-xs text-slate-800">
            Varne et al. (REVA University, 2023)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Provided conceptual 3-tier campus layout, building access switches, departmental VLAN segmentation (192.168.x.0/24), and initial ping baseline.
          </p>
          <div className="text-[11px] text-amber-700 font-mono bg-amber-50 p-2 rounded border border-amber-200">
            *Verification Fact: Protocols like EIGRP, HSRP, and QoS were only mentioned in survey text without Packet Tracer topology tests.
          </div>
        </div>

        <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-200 space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
            <GitFork className="w-4 h-4" />
            <span>2. Packet Tracer Implementation</span>
          </div>
          <div className="font-semibold text-xs text-slate-800">
            Anton-Alexandru Demian (2023)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Source of our Enhanced Campus Network: dual core multilayer switches (SW1/SW2), HSRP gateway redundancy, OSPF Area 0, EtherChannel Po1, and ACL_VLAN30_IN.
          </p>
          <div className="text-[11px] text-indigo-800 font-mono bg-indigo-50 p-2 rounded border border-indigo-200">
            *Verification Fact: Anton Demian’s bachelor's thesis contains verified screenshots of HSRP and RSTP failover in Packet Tracer.
          </div>
        </div>

        <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <Award className="w-4 h-4" />
            <span>3. Our Simulator Extensions</span>
          </div>
          <div className="font-semibold text-xs text-slate-800">
            Independent Web Network Laboratory
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Built this pure TypeScript discrete-event simulation engine, live React Flow interactive canvas, strict priority QoS scheduling, deterministic Copilot, and side-by-side resilience analysis.
          </p>
          <div className="text-[11px] text-emerald-800 font-mono bg-emerald-50 p-2 rounded border border-emerald-200">
            *Honesty Rule: Zero Cisco hardware emulation. Strictly discrete-event graph mathematics in the browser.
          </div>
        </div>
      </div>

      {/* Verification Matrix Table */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-800">Topological Verification Matrix</h3>
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-2.5">Area</th>
                <th className="p-2.5">Source Foundation</th>
                <th className="p-2.5">Our Implementation</th>
                <th className="p-2.5">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">Campus Topology</td>
                <td className="p-2.5">Varne et al. (Baseline) / Demian (Dual-Core)</td>
                <td className="p-2.5 font-mono">React Flow interactive graph with 13 devices</td>
                <td className="p-2.5"><EvidenceBadge type="Imported Packet Tracer observation" /></td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">VLAN Segmentation</td>
                <td className="p-2.5">VLANs 10, 20, 30, 40, 50 (Demian addressing plan)</td>
                <td className="p-2.5 font-mono">Mapped SVIs, endpoints, and subnet prefixes</td>
                <td className="p-2.5"><EvidenceBadge type="Imported Packet Tracer observation" /></td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">Gateway Redundancy</td>
                <td className="p-2.5">HSRP group 10-50 (SW1 priority 110, SW2 100)</td>
                <td className="p-2.5 font-mono">Simulated primary/backup gateway selection</td>
                <td className="p-2.5"><EvidenceBadge type="Browser-simulated" /></td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">Dynamic Routing</td>
                <td className="p-2.5">OSPF Area 0 over 10.0.x.x /30 transit links</td>
                <td className="p-2.5 font-mono">Dijkstra shortest path with tie-breaking</td>
                <td className="p-2.5"><EvidenceBadge type="Browser-simulated" /></td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">Traffic QoS & Scheduling</td>
                <td className="p-2.5">Mentioned in paper; absent in Packet Tracer test matrix</td>
                <td className="p-2.5 font-mono">Active strict priority queueing & tail drop</td>
                <td className="p-2.5"><EvidenceBadge type="Browser-simulated" /></td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">Hardware Metrics</td>
                <td className="p-2.5">Unpublished raw Packet Tracer latency timers</td>
                <td className="p-2.5 font-mono">Awaiting author import (docs/11)</td>
                <td className="p-2.5"><EvidenceBadge type="Unavailable" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Bibliographic Citations */}
      <div className="pt-2 border-t border-slate-100 text-xs space-y-2">
        <h4 className="font-semibold text-slate-700">Official Bibliographic References (IEEE Style):</h4>
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 font-mono text-[11px] space-y-2">
          <div>
            [1] P. N. Varne, J. Priyanka, S. Shetty V, T. A. K, and N. C. Gowda, "Campus Network Design and Implementation using Cisco Packet Tracer," <em>International Journal of Computational Learning & Intelligence</em>, vol. 2, no. 4, pp. 163–168, Oct. 2023. DOI: <a href="https://doi.org/10.5281/zenodo.10254264" target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">10.5281/zenodo.10254264 <ExternalLink className="w-3 h-3" /></a> (Licensed under CC BY 4.0).
          </div>
          <div>
            [2] A.-A. Demian, "Redundant Data Center–Campus Network," Bachelor's Thesis, Politehnica University of Timisoara, 2023. GitHub: <a href="https://github.com/antondemian/redundant-data-center-campus-network" target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">antondemian/redundant-data-center-campus-network <ExternalLink className="w-3 h-3" /></a>.
          </div>
        </div>
      </div>
    </div>
  );
};
