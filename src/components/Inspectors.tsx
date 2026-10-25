import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceBadge } from './EvidenceBadge';
import { Server, Link as LinkIcon, AlertTriangle, Send, Terminal, Play, Plus, Minus } from 'lucide-react';

export const Inspectors: React.FC = () => {
  const {
    devices,
    links,
    selectedDeviceId,
    selectedLinkId,
    toggleLinkState,
    updateLinkCost,
    sendTraffic,
    executeCommand,
    isNerdMode
  } = useSimulation();

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);
  const selectedLink = links.find(l => l.id === selectedLinkId);

  // If nothing is selected, default to SW1 or first device so panel is always informative and alive
  const effectiveDevice = selectedDevice || (!selectedLink ? (devices.find(d => d.id === 'SW1') || devices[0]) : undefined);

  return (
    <div className="bg-white dark:bg-[#121824] border border-stone-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5 transition-colors duration-200 text-slate-900 dark:text-slate-100">
      {/* Device Inspector */}
      {effectiveDevice && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-emerald-400">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{effectiveDevice.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{effectiveDevice.id}</span>
              </div>
            </div>
            <EvidenceBadge type="Browser-simulated" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Device Type</span>
              <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{effectiveDevice.type}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">IP Address</span>
              <span className="font-mono font-bold text-slate-800 dark:text-emerald-400">{effectiveDevice.ip || 'Not configured'}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Default Gateway</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{effectiveDevice.gateway || 'Not configured'}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">VLAN Segment</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {effectiveDevice.vlan ? `VLAN ${effectiveDevice.vlan}` : 'Trunk / Core'}
              </span>
            </div>
          </div>

          {effectiveDevice.hsrpPriority !== undefined && (
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs flex justify-between items-center">
              <div>
                <span className="font-semibold text-indigo-900 dark:text-indigo-300">HSRP Role:</span>{' '}
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                  {effectiveDevice.isHsrpActive ? 'ACTIVE (Preferred)' : 'STANDBY (Backup)'}
                </span>
              </div>
              <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 font-bold">
                Priority: {effectiveDevice.hsrpPriority}
              </span>
            </div>
          )}

          {/* Quick Interactive Actions */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Device Quick Actions:</span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => sendTraffic(effectiveDevice.id, 'SRV-WEB', 5, 'CLASS_BEST_EFFORT')}
                className="w-full text-left px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch 5 Packets to Web Server</span>
              </button>

              <button
                onClick={() => executeCommand(`ping ${effectiveDevice.id} SRV-WEB`)}
                className="w-full text-left px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute ICMP Ping to SRV-WEB</span>
              </button>

              <button
                onClick={() => executeCommand(`show route ${effectiveDevice.id}`)}
                className="w-full text-left px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Show Routing Table in Console</span>
              </button>
            </div>
          </div>

          {/* Nerd Mode Interfaces Table */}
          {isNerdMode && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
                <span>Simulated Interface Table:</span>
                <span className="text-[10px] font-mono text-slate-400">{effectiveDevice.interfaces.length} Ports</span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-1.5">Intf</th>
                      <th className="p-1.5">IP/Mask</th>
                      <th className="p-1.5">VLAN</th>
                      <th className="p-1.5">MAC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {effectiveDevice.interfaces.map((intf) => (
                      <tr key={intf.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="p-1.5 font-bold text-blue-600 dark:text-emerald-400">{intf.name}</td>
                        <td className="p-1.5">{intf.ip ? `${intf.ip}/${intf.mask?.split('.')[0]}` : 'Unnumbered'}</td>
                        <td className="p-1.5">{intf.vlan || 'Trunk'}</td>
                        <td className="p-1.5 text-slate-400">{intf.mac.slice(0, 8)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Link Inspector */}
      {selectedLink && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Link: {selectedLink.id}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{selectedLink.source} ↔ {selectedLink.target}</span>
              </div>
            </div>
            <button
              onClick={() => toggleLinkState(selectedLink.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                selectedLink.state === 'UP'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{selectedLink.state === 'UP' ? 'Sever Link (Down)' : 'Restore Link (Up)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Link Status</span>
              <span className={`font-mono font-bold ${
                selectedLink.state === 'UP' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {selectedLink.state}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Queue Occupancy</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {selectedLink.queue.length} / {selectedLink.queueLimit} pkts
              </span>
            </div>
          </div>

          {/* Metric Cost Modifier */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-white block">Metric Cost: {selectedLink.cost}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Controls Dijkstra SPF path weight</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateLinkCost(selectedLink.id, Math.max(1, selectedLink.cost - 1))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Decrease cost"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateLinkCost(selectedLink.id, selectedLink.cost + 1)}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Increase cost"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isNerdMode && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <div>Capacity: {selectedLink.capacity} packets/tick</div>
              <div>Total Transmitted: {selectedLink.totalTransmitted}</div>
              <div>Tail Drops: {selectedLink.tailDropsCount}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
