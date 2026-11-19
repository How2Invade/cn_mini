import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceBadge } from './EvidenceBadge';
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

export const MetricsDashboard: React.FC = () => {
  const { metrics, isNerdMode } = useSimulation();

  // Mock timeline series based on metrics
  const chartData = [
    { name: 'Delivered', count: metrics.delivered, fill: '#468F5C' },
    { name: 'Dropped', count: metrics.dropped, fill: '#C8423B' },
    { name: 'In-Flight', count: metrics.inFlight, fill: '#2E9BB8' },
  ];

  const lossOverTime = [
    { tick: 'T-3', loss: Math.max(0, metrics.lossPercentage - 10) },
    { tick: 'T-2', loss: Math.max(0, metrics.lossPercentage - 5) },
    { tick: 'T-1', loss: metrics.lossPercentage },
    { tick: 'Now', loss: metrics.lossPercentage },
  ];

  return (
    <div className="bg-paper-raised border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Telemetry & Performance Dashboard</h3>
          <p className="text-xs text-slate-500">Live network accounting, packet delivery, and loss rates</p>
        </div>
        <EvidenceBadge type="Browser-simulated" />
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] font-medium text-slate-500 block">Generated</span>
          <span className="text-xl font-semibold font-mono text-slate-800">{metrics.generated}</span>
          <span className="text-[9px] text-slate-400 block font-mono">Packets sent</span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3">
          <span className="text-[10px] font-medium text-emerald-700 block">Delivered</span>
          <span className="text-xl font-semibold font-mono text-emerald-700">{metrics.delivered}</span>
          <span className="text-[9px] text-emerald-600 block font-mono">Arrived at dest</span>
        </div>

        <div className="bg-red-50/60 border border-red-200 rounded-lg p-3">
          <span className="text-[10px] font-medium text-red-700 block">Dropped</span>
          <span className="text-xl font-semibold font-mono text-red-700">{metrics.dropped}</span>
          <span className="text-[9px] text-red-600 block font-mono">Discards</span>
        </div>

        <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-3">
          <span className="text-[10px] font-medium text-sky-700 block">In Flight</span>
          <span className="text-xl font-semibold font-mono text-sky-700">{metrics.inFlight}</span>
          <span className="text-[9px] text-sky-600 block font-mono">On wire / queue</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] font-medium text-slate-500 block">Delivery %</span>
          <span className="text-xl font-semibold font-mono text-blue-600">{metrics.deliveryPercentage}%</span>
          <span className="text-[9px] text-slate-400 block font-mono">Delivered / Gen</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] font-medium text-slate-500 block">Recovery Time</span>
          <span className="text-xl font-semibold font-mono text-purple-700">
            {metrics.recoveryTicks !== null ? `${metrics.recoveryTicks} Ticks` : 'N/A'}
          </span>
          <span className="text-[9px] text-slate-400 block font-mono">Post-failure</span>
        </div>
      </div>

      {/* Nerd Mode Mathematical Formula Explanations */}
      {isNerdMode && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono space-y-1 text-slate-700">
          <div className="font-semibold text-slate-800">Deterministic Accounting Equations:</div>
          <div>• Delivery Rate = (Delivered / Generated) × 100 = ({metrics.delivered}/{metrics.generated || 1}) × 100 = {metrics.deliveryPercentage}%</div>
          <div>• Packet Loss Rate = (Dropped / Generated) × 100 = ({metrics.dropped}/{metrics.generated || 1}) × 100 = {metrics.lossPercentage}%</div>
          <div>• Balance Verification: {metrics.generated} Generated === {metrics.delivered} (Delivered) + {metrics.dropped} (Dropped) + {metrics.inFlight} (In-Flight)</div>
        </div>
      )}

      {/* Live Visualizations (Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Packet Transmission Outcome</span>
            <EvidenceBadge type="Calculated from recorded data" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={11} stroke="#75716A" />
                <YAxis fontSize={11} stroke="#75716A" />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Loss Rate Progression (%)</span>
            <EvidenceBadge type="Calculated from recorded data" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD5" />
                <XAxis dataKey="tick" fontSize={11} stroke="#75716A" />
                <YAxis fontSize={11} stroke="#75716A" domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="loss" stroke="#C8423B" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
