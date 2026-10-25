import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { EvidenceBadge } from '../EvidenceBadge';

export const AnalyticsBento: React.FC = () => {
  const { metrics, links, livePackets, tick, qosEnabled } = useSimulation();

  // Sort links by utilization descending
  const sortedLinks = [...links].sort((a, b) => {
    const utilA = metrics.activeLinkUtilization[a.id] || 0;
    const utilB = metrics.activeLinkUtilization[b.id] || 0;
    return utilB - utilA;
  });
  const failedLinks = links.filter(l => l.state === 'DOWN');

  // Delivery vs Dropped percentages for donut
  const totalPkts = metrics.delivered + metrics.dropped;
  const deliveryPct = totalPkts > 0 ? (metrics.delivered / totalPkts) * 100 : 100;
  const dropPct = totalPkts > 0 ? (metrics.dropped / totalPkts) * 100 : 0;

  const activeLinksCount = links.filter(l => l.state === 'UP').length;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 space-y-4 font-sans select-none">
      {/* Bento Grid Row 1: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Delivered */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Delivered %</span>
            <EvidenceBadge type="Calculated from recorded data" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {metrics.deliveryPercentage.toFixed(1)}%
            </span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              metrics.deliveryPercentage >= 95 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {metrics.deliveryPercentage >= 95 ? '+High SLA' : 'Degraded'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">{metrics.delivered} pkts delivered</span>
        </div>

        {/* KPI 2: Packet Loss */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Packet Loss %</span>
            <EvidenceBadge type="Calculated from recorded data" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {metrics.lossPercentage.toFixed(1)}%
            </span>
            {metrics.dropped > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                Loss Detected
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">{metrics.dropped} pkts dropped</span>
        </div>

        {/* KPI 3: In Flight */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>In Transit</span>
            <EvidenceBadge type="Browser-simulated" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {metrics.inFlight}
            </span>
            <span className="text-xs font-semibold text-slate-500">pkts</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Engine queue traversal</span>
        </div>

        {/* KPI 4: Recovery Ticks */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Recovery Delay</span>
            <EvidenceBadge type="Browser-simulated" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {metrics.recoveryTicks !== null ? `${metrics.recoveryTicks}t` : 'Unavailable'}
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
              Convergence
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Ticks to post-failure packet</span>
        </div>

        {/* KPI 5: Active Links */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Link Availability</span>
            <EvidenceBadge type="Calculated from recorded data" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {activeLinksCount}/{links.length}
            </span>
            {failedLinks.length > 0 ? (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                {failedLinks.length} Down
              </span>
            ) : (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                100% UP
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Physical & trunk channels</span>
        </div>

        {/* KPI 6: QoS Priority Mode */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>QoS Queueing</span>
            <EvidenceBadge type="Browser-simulated" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl font-black tracking-tight ${qosEnabled ? 'text-blue-600' : 'text-slate-700'}`}>
              {qosEnabled ? 'PriQueue' : 'DropTail'}
            </span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              qosEnabled ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {qosEnabled ? 'Active' : 'FIFO'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Voice & Video prioritised</span>
        </div>
      </div>

      {/* Bento Grid Row 2: Charts & Deep Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bento Column 1: Hatched Delivery Donut & Convergence Timeline */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h4 className="font-bold text-slate-800 text-sm">Delivery Ratio & Convergence</h4>
            <EvidenceBadge type="Calculated from recorded data" />
          </div>

          <div className="flex items-center justify-center py-4">
            {/* SVG Donut Chart with Hatched drop pattern */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <pattern id="diagonalHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="4" stroke="#F43F5E" strokeWidth="1.5" />
                  </pattern>
                </defs>
                {/* Background circle */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="14" />
                {/* Delivered segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth="14"
                  strokeDasharray={`${(deliveryPct * 251.2) / 100} 251.2`}
                  strokeLinecap="round"
                />
                {/* Dropped hatched overlay segment if drops occur */}
                {dropPct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="url(#diagonalHatch)"
                    strokeWidth="14"
                    strokeDasharray={`${(dropPct * 251.2) / 100} 251.2`}
                    strokeDashoffset={`-${(deliveryPct * 251.2) / 100}`}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {deliveryPct.toFixed(0)}%
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Success</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-slate-700 font-medium">Delivered: {metrics.delivered}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-rose-500 border border-rose-600"></span>
              <span className="text-slate-700 font-medium">Dropped: {metrics.dropped}</span>
            </div>
          </div>
        </div>

        {/* Bento Column 2: Per-Link Utilization Ranked Bars */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h4 className="font-bold text-slate-800 text-sm">Per-Link Utilization</h4>
            <span className="text-[11px] font-mono text-slate-400">Ranked by load</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56">
            {sortedLinks.map(link => {
              const isDown = link.state === 'DOWN';
              const util = metrics.activeLinkUtilization[link.id] || 0;
              return (
                <div key={link.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-slate-700 truncate max-w-[170px]">
                      {link.id} ({link.source} ↔ {link.target})
                    </span>
                    <span className={`font-mono text-[11px] font-semibold ${
                      isDown ? 'text-rose-600' : util > 75 ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      {isDown ? 'DOWN' : `${util}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isDown
                          ? 'bg-rose-500 w-full'
                          : util > 80
                          ? 'bg-rose-500'
                          : util > 50
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: isDown ? '100%' : `${Math.min(100, util)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {failedLinks.length > 0 && (
            <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{failedLinks.length} link(s) severed: traffic auto-diverting</span>
            </div>
          )}
        </div>

        {/* Bento Column 3: Recovery Timeline & Convergence Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="font-bold text-slate-800 text-sm">Fault Tolerance & Reconvergence</h4>
              <EvidenceBadge type="Browser-simulated" />
            </div>

            <div className="space-y-3 mt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <div className="font-bold text-slate-800">Primary Core Trunk</div>
                  <div className="text-slate-500 text-[11px]">Core L3 switches route inter-VLAN subnets via EtherChannel trunks.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 ${
                  failedLinks.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  2
                </span>
                <div>
                  <div className="font-bold text-slate-800">Failure Injection & Detection</div>
                  <div className="text-slate-500 text-[11px]">
                    {failedLinks.length > 0
                      ? `Active failure on ${failedLinks.map(f => f.id).join(', ')}`
                      : 'All trunks nominal. Click a link in topology to simulate cut.'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <div className="font-bold text-slate-800">Dynamic Reconvergence</div>
                  <div className="text-slate-500 text-[11px]">Dijkstra shortest-path weights auto-recompute to backup links.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Simulation Tick:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              Tick {tick}
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid Row 3: Live Flow & Packet Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 text-sm">Real-Time Packet Inspection Table</h4>
            <span className="text-xs text-slate-400 font-mono">({livePackets.length} recorded events)</span>
          </div>
          <EvidenceBadge type="Browser-simulated" />
        </div>

        <div className="overflow-x-auto max-h-48 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Source</th>
                <th className="p-2">Destination</th>
                <th className="p-2">Class</th>
                <th className="p-2">Hop</th>
                <th className="p-2">Status</th>
                <th className="p-2">Drop Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {livePackets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400 font-sans italic">
                    No packets dispatched yet. Click &quot;Send Traffic&quot; or start simulation to see records.
                  </td>
                </tr>
              ) : (
                livePackets.slice(-15).reverse().map(pkt => (
                  <tr key={pkt.id} className="hover:bg-slate-50/80">
                    <td className="p-2 font-bold text-blue-600">{pkt.id}</td>
                    <td className="p-2">{pkt.source}</td>
                    <td className="p-2">{pkt.destination}</td>
                    <td className="p-2">
                      <span className="capitalize px-1.5 py-0.5 rounded text-[11px] bg-slate-100 font-medium">
                        {pkt.trafficClass === 'CLASS_HIGH' ? 'VoIP (High)' : 'Best Effort'}
                      </span>
                    </td>
                    <td className="p-2">{pkt.currentHopIndex}/{pkt.path?.length || 0}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pkt.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : pkt.status === 'dropped'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {pkt.status}
                      </span>
                    </td>
                    <td className="p-2 text-rose-600 font-sans">{pkt.dropReason || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
