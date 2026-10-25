import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceBadge } from './EvidenceBadge';
import { Sparkles, ArrowRight, CheckCircle2, AlertOctagon } from 'lucide-react';

export const Copilot: React.FC = () => {
  const { currentPreset, metrics, links, qosEnabled, isNerdMode } = useSimulation();

  const failedLink = links.find((l) => l.state === 'DOWN');
  const hasDrops = metrics.dropped > 0;

  // Rule-based deterministic diagnostic generation
  const generateDiagnosis = () => {
    if (failedLink) {
      if (currentPreset.id === 'preset-1-baseline') {
        return {
          title: 'Single-Point-of-Failure Black Hole Detected',
          what: `Primary distribution link ${failedLink.id} failed in a single-path baseline topology.`,
          why: 'The network lacks alternate Layer 2 or Layer 3 paths between student access switches and the campus core.',
          consequence: 'Total packet drop (100% loss). All subsequent transmissions will fail.',
          action: 'Switch to Preset 2 (Enhanced Dual-Core) to observe automatic rerouting and redundancy restoration.',
          isCritical: true,
        };
      } else {
        return {
          title: 'Dynamic Rerouting via Alternate Gateway / Core Switch',
          what: `Primary distribution link ${failedLink.id} is down.`,
          why: 'Dijkstra shortest-path routing converged to alternate distribution switch SW2.',
          consequence: `Traffic successfully preserved! Recovery time: ${metrics.recoveryTicks !== null ? `${metrics.recoveryTicks} ticks` : 'Calculating...'}.`,
          action: 'Click "Restore Link" on the link inspector to observe shortest-path reversion to SW1.',
          isCritical: false,
        };
      }
    }

    if (qosEnabled && currentPreset.id === 'preset-6-congestion-qos') {
      return {
        title: 'QoS Strict-Priority Queue Scheduling Active',
        what: 'Buffer contention observed on access-distribution link.',
        why: 'Strict priority queueing preempts Voice/LMS packets ahead of student bulk downloads.',
        consequence: '0% packet loss for mission-critical traffic; best-effort traffic absorbs buffer tail drops.',
        action: 'Toggle QoS switch OFF to observe equal-opportunity tail-drop failure across all traffic classes.',
        isCritical: false,
      };
    }

    if (hasDrops && metrics.dropCountsByReason.vlan_policy_denied > 0) {
      return {
        title: 'Security ACL Access Rule Enforced',
        what: 'Packet rejected at ingress switch boundary.',
        why: 'Rule ACL_VLAN30_IN strictly restricts student VLAN 30 to HTTP/HTTPS and denies FTP (port 21).',
        consequence: 'Packet discarded with reason vlan_policy_denied.',
        action: 'Select destination SRV-WEB (HTTP port 80) to test permitted traffic flow.',
        isCritical: false,
      };
    }

    return {
      title: 'Optimal Steady-State Routing',
      what: `Operating under preset: ${currentPreset.title}.`,
      why: 'All physical links are UP and operational with minimal metric costs.',
      consequence: `Current delivery rate: ${metrics.deliveryPercentage}%. Zero unmitigated buffer drops.`,
      action: 'Try severing link L_SW1_SW4 or injecting traffic bursts to stress-test the topology.',
      isCritical: false,
    };
  };

  const diag = generateDiagnosis();

  return (
    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Network Copilot Diagnostic</h3>
            <span className="text-[10px] text-slate-500 font-mono">Deterministic State Analysis</span>
          </div>
        </div>
        <EvidenceBadge type="Browser-simulated" />
      </div>

      <div className="bg-white/90 backdrop-blur rounded-lg border border-blue-100 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          {diag.isCritical ? (
            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="font-bold text-slate-800 text-sm">{diag.title}</span>
        </div>

        <p className="text-slate-600 leading-relaxed">
          <strong className="text-slate-700">Observation:</strong> {diag.what}
        </p>

        <p className="text-slate-600 leading-relaxed">
          <strong className="text-slate-700">Causality:</strong> {diag.why}
        </p>

        <p className="text-slate-600 leading-relaxed">
          <strong className="text-slate-700">Network Impact:</strong> {diag.consequence}
        </p>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-blue-700 font-medium">
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          <span>Recommended Next Action: {diag.action}</span>
        </div>

        {isNerdMode && (
          <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-[10px] font-mono text-slate-500">
            Rules Evaluated: [dijkstra_path_cost, hsrp_role_state, link_oper_state, qos_buffer_priority, vlan_acl_rules]
          </div>
        )}
      </div>
    </div>
  );
};
