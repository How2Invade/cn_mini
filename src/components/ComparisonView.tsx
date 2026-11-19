import React from 'react';
import { EvidenceBadge } from './EvidenceBadge';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const ComparisonView: React.FC = () => {
  return (
    <div className="bg-paper-raised dark:bg-ink-raised border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Baseline (Paper) vs. Enhanced (Demian-Derived) Architecture Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Side-by-side resilience, failure domain, and traffic optimization capabilities
          </p>
        </div>
        <EvidenceBadge type="Calculated from recorded data" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-[#121315] text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">Architectural Domain</th>
              <th className="p-3.5 w-1/3">Research Paper Baseline (Varne et al.)</th>
              <th className="p-3.5 w-1/3 text-blue-700 dark:text-emerald-400">Enhanced Dual-Core (Our Simulator)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-3.5 font-semibold text-slate-900 dark:text-white">Core Layer Redundancy</td>
              <td className="p-3.5 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                <X className="w-4 h-4 shrink-0" />
                <span>Single Router (Single Point of Failure)</span>
              </td>
              <td className="p-3.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Dual Multilayer Switches (SW1/SW2) + Dual Routers</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-3.5 font-semibold text-slate-900 dark:text-white">Default Gateway Resilience</td>
              <td className="p-3.5 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <X className="w-4 h-4 shrink-0 text-rose-500" />
                <span>Static Single SVI Gateway; no failover</span>
              </td>
              <td className="p-3.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>HSRP Virtual Gateway (.1) with Priority 110 Preempt</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-3.5 font-semibold text-slate-900 dark:text-white">Distribution Uplinks</td>
              <td className="p-3.5 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Single link; link cut produces 100% black hole</span>
              </td>
              <td className="p-3.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Dual cross-connected uplinks + EtherChannel Po1</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-3.5 font-semibold text-slate-900 dark:text-white">Dynamic Routing Protocol</td>
              <td className="p-3.5 text-slate-500 dark:text-slate-400">
                <span>EIGRP only mentioned in text; not configured</span>
              </td>
              <td className="p-3.5 text-blue-700 dark:text-sky-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-sky-400" />
                  <span>OSPF Area 0 shortest-path calculation (Dijkstra)</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-3.5 font-semibold text-slate-900 dark:text-white">Traffic Optimization & QoS</td>
              <td className="p-3.5 text-slate-500 dark:text-slate-400">
                <span>Absent from topology evaluation</span>
              </td>
              <td className="p-3.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Strict Priority Queueing for Voice/LMS over bulk traffic</span>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-3.5 font-semibold text-slate-900 dark:text-white">Access Security & ACLs</td>
              <td className="p-3.5 text-slate-500 dark:text-slate-400">
                <span>Only mentioned as objective</span>
              </td>
              <td className="p-3.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
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
