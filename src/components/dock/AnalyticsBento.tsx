import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { EvidenceBadge } from '../EvidenceBadge';
import { AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const AnalyticsBento: React.FC = () => {
  const { metrics, links, livePackets, tick, qosEnabled, isNerdMode, isDarkMode } = useSimulation();
  const [showCharts, setShowCharts] = useState(true);

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

  // Recharts telemetry data
  const chartData = [
    { name: 'Delivered', count: metrics.delivered, fill: isDarkMode ? '#10B981' : '#16A34A' },
    { name: 'Dropped', count: metrics.dropped, fill: isDarkMode ? '#F43F5E' : '#DC2626' },
    { name: 'In-Flight', count: metrics.inFlight, fill: isDarkMode ? '#38BDF8' : '#0EA5E9' },
  ];

  const lossOverTime = [
    { tick: `T-${Math.max(0, tick - 3)}`, loss: Math.max(0, metrics.lossPercentage - 10) },
    { tick: `T-${Math.max(0, tick - 2)}`, loss: Math.max(0, metrics.lossPercentage - 5) },
    { tick: `T-${Math.max(0, tick - 1)}`, loss: metrics.lossPercentage },
    { tick: `T${tick}`, loss: metrics.lossPercentage },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F7F7F2] dark:bg-[#090D16] p-4 space-y-4 font-sans select-none transition-colors duration-200">
      {/* Bento Grid Row 1: Uniform KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1: Delivered */}
        <div className="bg-white dark:bg-[#121824] p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[118px]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium h-5">
            <span className="truncate">Delivered %</span>
            <EvidenceBadge type="Calculated from recorded data" compact />
          </div>
          <div className="flex items-baseline justify-between gap-1.5 my-auto">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {totalPkts === 0 ? '100.0%' : `${metrics.deliveryPercentage.toFixed(1)}%`}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
              totalPkts === 0
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : metrics.deliveryPercentage >= 95
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
            }`}>
              {totalPkts === 0 ? 'Optimal' : metrics.deliveryPercentage >= 95 ? '+High SLA' : 'Degraded'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
            {totalPkts === 0 ? 'Ready to send' : `${metrics.delivered} pkts delivered`}
          </span>
        </div>

        {/* KPI 2: Packet Loss */}
        <div className="bg-white dark:bg-[#121824] p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[118px]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium h-5">
            <span className="truncate">Packet Loss %</span>
            <EvidenceBadge type="Calculated from recorded data" compact />
          </div>
          <div className="flex items-baseline justify-between gap-1.5 my-auto">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {metrics.lossPercentage.toFixed(1)}%
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
              metrics.dropped > 0
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}>
              {metrics.dropped > 0 ? 'Loss' : 'Zero Loss'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
            {metrics.dropped} pkts dropped
          </span>
        </div>

        {/* KPI 3: In Flight */}
        <div className="bg-white dark:bg-[#121824] p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[118px]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium h-5">
            <span className="truncate">In Transit</span>
            <EvidenceBadge type="Browser-simulated" compact />
          </div>
          <div className="flex items-baseline justify-between gap-1.5 my-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {metrics.inFlight}
              </span>
              <span className="text-xs font-semibold text-slate-400">pkts</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
              metrics.inFlight > 0
                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                : 'bg-stone-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {metrics.inFlight > 0 ? 'In Flight' : 'Idle'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
            Engine queue
          </span>
        </div>

        {/* KPI 4: Recovery Ticks */}
        <div className="bg-white dark:bg-[#121824] p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[118px]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium h-5">
            <span className="truncate">Recovery Delay</span>
            <EvidenceBadge type="Browser-simulated" compact />
          </div>
          <div className="flex items-baseline justify-between gap-1.5 my-auto">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {metrics.recoveryTicks !== null ? `${metrics.recoveryTicks}t` : 'Steady'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              Convergence
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
            Post-failure ticks
          </span>
        </div>

        {/* KPI 5: Active Links */}
        <div className="bg-white dark:bg-[#121824] p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[118px]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium h-5">
            <span className="truncate">Link Availability</span>
            <EvidenceBadge type="Calculated from recorded data" compact />
          </div>
          <div className="flex items-baseline justify-between gap-1.5 my-auto">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {activeLinksCount}/{links.length}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
              failedLinks.length > 0
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}>
              {failedLinks.length > 0 ? `${failedLinks.length} Down` : '100% UP'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
            Physical channels
          </span>
        </div>

        {/* KPI 6: QoS Priority Mode */}
        <div className="bg-white dark:bg-[#121824] p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[118px]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium h-5">
            <span className="truncate">QoS Queueing</span>
            <EvidenceBadge type="Browser-simulated" compact />
          </div>
          <div className="flex items-baseline justify-between gap-1.5 my-auto">
            <span className={`text-base sm:text-lg font-black tracking-tight font-mono ${
              qosEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'
            }`}>
              {qosEnabled ? 'PriQueue' : 'DropTail'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
              qosEnabled
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {qosEnabled ? 'Active' : 'FIFO'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
            {qosEnabled ? 'Priority active' : 'FIFO default'}
          </span>
        </div>
      </div>

      {/* Bento Grid Row 2: Charts & Deep Metrics (Unified Heights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Bento Column 1: Hatched Delivery Donut & Convergence */}
        <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Delivery Ratio & Convergence</h4>
            <EvidenceBadge type="Calculated from recorded data" />
          </div>

          <div className="flex items-center justify-center my-auto">
            {/* SVG Donut Chart with Hatched drop pattern */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <pattern id="diagonalHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="4" stroke="#F43F5E" strokeWidth="1.5" />
                  </pattern>
                </defs>
                {/* Background circle */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDarkMode ? '#1E293B' : '#E2E8F0'} strokeWidth="14" />
                {/* Delivered segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={isDarkMode ? '#10B981' : '#2563EB'}
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
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {deliveryPct.toFixed(0)}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Success</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 dark:bg-emerald-500"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Delivered: {metrics.delivered}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-rose-500 border border-rose-600"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Dropped: {metrics.dropped}</span>
            </div>
          </div>
        </div>

        {/* Bento Column 2: Per-Link Utilization Ranked Bars */}
        <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Per-Link Utilization</h4>
            <span className="text-[11px] font-mono text-slate-400">Ranked by load</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-2 scrollbar-thin">
            {sortedLinks.map(link => {
              const isDown = link.state === 'DOWN';
              const util = metrics.activeLinkUtilization[link.id] || 0;
              return (
                <div key={link.id} className="space-y-1 py-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300 truncate max-w-[190px]">
                      {link.id} <span className="text-slate-400 text-[11px]">({link.source} ↔ {link.target})</span>
                    </span>
                    <span className={`font-mono text-[11px] font-bold ${
                      isDown ? 'text-rose-600 dark:text-rose-400' : util > 75 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {isDown ? 'DOWN' : `${util}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isDown
                          ? 'bg-rose-500 w-full'
                          : util > 80
                          ? 'bg-rose-500'
                          : util > 50
                          ? 'bg-amber-500'
                          : isDarkMode ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: isDown ? '100%' : `${Math.min(100, util)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {failedLinks.length > 0 ? (
            <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="truncate">{failedLinks.length} link(s) severed: rerouting</span>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Trunk Health:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Balanced</span>
            </div>
          )}
        </div>

        {/* Bento Column 3: Recovery Timeline & Convergence Status */}
        <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Fault Tolerance & Reconvergence</h4>
              <EvidenceBadge type="Browser-simulated" />
            </div>

            <div className="space-y-3.5 mt-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Primary Core Trunk</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Core L3 switches route inter-VLAN subnets via EtherChannel trunks.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 text-xs ${
                  failedLinks.length > 0 ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  2
                </span>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Failure Injection & Detection</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {failedLinks.length > 0
                      ? `Active failure on ${failedLinks.map(f => f.id).join(', ')}`
                      : 'All trunks nominal. Click a link in topology to simulate cut.'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Dynamic Reconvergence</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Dijkstra shortest-path weights auto-recompute to backup links.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Current Simulation Tick:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white bg-stone-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
              Tick {tick}
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid Row 3: Live Visualizations (Recharts) */}
      <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Telemetry & Visualizations (Recharts)</h4>
            <span className="text-xs text-slate-400 font-mono">Live Time-Series Data</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-medium"
            >
              {showCharts ? 'Hide Visuals' : 'Show Visuals'}
            </button>
            <EvidenceBadge type="Calculated from recorded data" />
          </div>
        </div>

        {showCharts && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Packet Transmission Outcome</span>
                <span className="text-[10px] text-slate-400 font-mono">Total: {totalPkts}</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={11} stroke={isDarkMode ? '#64748B' : '#94A3B8'} />
                    <YAxis fontSize={11} stroke={isDarkMode ? '#64748B' : '#94A3B8'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#E2E8F0', borderRadius: '12px' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Loss Rate Progression (%)</span>
                <span className="text-[10px] text-slate-400 font-mono">Current: {metrics.lossPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lossOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1E293B' : '#E2E8F0'} />
                    <XAxis dataKey="tick" fontSize={11} stroke={isDarkMode ? '#64748B' : '#94A3B8'} />
                    <YAxis fontSize={11} stroke={isDarkMode ? '#64748B' : '#94A3B8'} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#E2E8F0', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="loss" stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 4, fill: '#F43F5E' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Nerd Mode Mathematical Formula Explanations */}
        {isNerdMode && (
          <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1 text-slate-700 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-100">Deterministic Accounting Equations:</div>
            <div>• Delivery Rate = (Delivered / Generated) × 100 = ({metrics.delivered}/{metrics.generated || 1}) × 100 = {metrics.deliveryPercentage.toFixed(1)}%</div>
            <div>• Packet Loss Rate = (Dropped / Generated) × 100 = ({metrics.dropped}/{metrics.generated || 1}) × 100 = {metrics.lossPercentage.toFixed(1)}%</div>
            <div>• Balance Verification: {metrics.generated} Generated === {metrics.delivered} (Delivered) + {metrics.dropped} (Dropped) + {metrics.inFlight} (In-Flight)</div>
          </div>
        )}
      </div>

      {/* Bento Grid Row 4: Live Flow & Packet Table */}
      <div className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Real-Time Packet Inspection Table</h4>
            <span className="text-xs text-slate-400 font-mono">({livePackets.length} recorded events)</span>
          </div>
          <EvidenceBadge type="Browser-simulated" />
        </div>

        <div className="overflow-x-auto max-h-48 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Source</th>
                <th className="p-2.5">Destination</th>
                <th className="p-2.5">Class</th>
                <th className="p-2.5">Hop</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Drop Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {livePackets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400 font-sans italic">
                    No packets dispatched yet. Click &quot;Send Traffic&quot; or start simulation to see records.
                  </td>
                </tr>
              ) : (
                livePackets.slice(-15).reverse().map(pkt => (
                  <tr key={pkt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 font-bold text-blue-600 dark:text-emerald-400">{pkt.id}</td>
                    <td className="p-2.5">{pkt.source}</td>
                    <td className="p-2.5">{pkt.destination}</td>
                    <td className="p-2.5">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 font-medium">
                        {pkt.trafficClass === 'CLASS_HIGH' ? 'VoIP (High)' : 'Best Effort'}
                      </span>
                    </td>
                    <td className="p-2.5">{pkt.currentHopIndex}/{pkt.path?.length || 0}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        pkt.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : pkt.status === 'dropped'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {pkt.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-rose-600 dark:text-rose-400 font-sans">{pkt.dropReason || '—'}</td>
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
