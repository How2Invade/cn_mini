import React from 'react';
import { EvidenceBadge } from './EvidenceBadge';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const ComparisonView: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Baseline (Paper) vs. Enhanced (Demian-Derived) Architecture Comparison
          </h3>
          <p className="text-xs text-slate-500">
            Side-by-side resilience, failure domain, and traffic optimization capabilities
          </p>
        </div>
        <EvidenceBadge type="Calculated from recorded data" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Architectural Domain</th>
              <th className="p-3 w-1/3">Research Paper Baseline (Varne et al.)</th>
              <th className="p-3 w-1/3 text-blue-700">Enhanced Dual-Core (Our Simulator)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-600">
            <tr className="hover:bg-slate-50/50">
              <td className="p-3 font-semibold text-slate-800">Core Layer Redundancy</td>
              <td className="p-3 flex items-center gap-1.5 text-red-600">
                <X className="w-4 h-4 shrink-0" />
                <span>Single Router (Single Point of Failure)</span>
              </td>
              <td className="p-3 text-emerald-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Dual Multilayer Switches (SW1/SW2) + Dual Routers</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50">
              <td className="p-3 font-semibold text-slate-800">Default Gateway Resilience</td>
              <td className="p-3 flex items-center gap-1.5 text-slate-500">
                <X className="w-4 h-4 shrink-0 text-red-500" />
                <span>Static Single SVI Gateway; no failover</span>
              </td>
              <td className="p-3 text-emerald-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>HSRP Virtual Gateway (.1) with Priority 110 Preempt</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50">
              <td className="p-3 font-semibold text-slate-800">Distribution Uplinks</td>
              <td className="p-3 flex items-center gap-1.5 text-red-600">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Single link; link cut produces 100% black hole</span>
              </td>
              <td className="p-3 text-emerald-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Dual cross-connected uplinks + EtherChannel Po1</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50">
              <td className="p-3 font-semibold text-slate-800">Dynamic Routing Protocol</td>
              <td className="p-3 text-slate-500">
                <span>EIGRP only mentioned in text; not configured</span>
              </td>
              <td className="p-3 text-blue-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>OSPF Area 0 shortest-path calculation (Dijkstra)</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50">
              <td className="p-3 font-semibold text-slate-800">Traffic Optimization & QoS</td>
              <td className="p-3 text-slate-500">
                <span>Absent from topology evaluation</span>
              </td>
              <td className="p-3 text-emerald-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Strict Priority Queueing for Voice/LMS over bulk traffic</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50">
              <td className="p-3 font-semibold text-slate-800">Access Security & ACLs</td>
              <td className="p-3 text-slate-500">
                <span>Only mentioned as objective</span>
              </td>
              <td className="p-3 text-emerald-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>ACL_VLAN30_IN permits Web, blocks FTP & DMZ direct</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
