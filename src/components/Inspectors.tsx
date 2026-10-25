import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceBadge } from './EvidenceBadge';
import { Server, Link as LinkIcon, AlertTriangle } from 'lucide-react';

export const Inspectors: React.FC = () => {
  const {
    devices,
    links,
    selectedDeviceId,
    selectedLinkId,
    toggleLinkState,
    isNerdMode
  } = useSimulation();

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);
  const selectedLink = links.find(l => l.id === selectedLinkId);

  // If nothing is selected, default to SW1 or first device so panel is always informative and alive
  const effectiveDevice = selectedDevice || (!selectedLink ? (devices.find(d => d.id === 'SW1') || devices[0]) : undefined);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
      {/* Device Inspector */}
      {effectiveDevice && (
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">{effectiveDevice.name}</h3>
            </div>
            <EvidenceBadge type="Browser-simulated" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Device ID</span>
              <span className="font-mono font-semibold text-slate-700">{effectiveDevice.id}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Type</span>
              <span className="capitalize font-semibold text-slate-700">{effectiveDevice.type}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">IP Address</span>
              <span className="font-mono font-semibold text-slate-700">{effectiveDevice.ip || 'Not configured'}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Default Gateway</span>
              <span className="font-mono font-semibold text-slate-700">{effectiveDevice.gateway || 'Not configured'}</span>
            </div>
          </div>

          {effectiveDevice.hsrpPriority !== undefined && (
            <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded text-xs flex justify-between items-center">
              <div>
                <span className="font-semibold text-indigo-900">HSRP Role:</span>{' '}
                <span className="font-mono text-indigo-700">
                  {effectiveDevice.isHsrpActive ? 'ACTIVE (Preferred)' : 'STANDBY (Backup)'}
                </span>
              </div>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-800">
                Priority: {effectiveDevice.hsrpPriority}
              </span>
            </div>
          )}

          {/* Nerd Mode Interfaces Table */}
          {isNerdMode && (
            <div className="mt-3">
              <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Simulated Interface Table:</span>
                <span className="text-[10px] font-mono text-slate-400">{effectiveDevice.interfaces.length} Ports</span>
              </div>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="p-1.5">Intf</th>
                      <th className="p-1.5">IP/Mask</th>
                      <th className="p-1.5">VLAN</th>
                      <th className="p-1.5">MAC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {effectiveDevice.interfaces.map((intf) => (
                      <tr key={intf.name}>
                        <td className="p-1.5 font-bold text-blue-600">{intf.name}</td>
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
        <div className="pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">Link: {selectedLink.id}</h3>
            </div>
            <button
              onClick={() => toggleLinkState(selectedLink.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                selectedLink.state === 'UP'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{selectedLink.state === 'UP' ? 'Sever Link (Down)' : 'Restore Link (Up)'}</span>
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Endpoints</span>
              <span className="font-mono font-semibold text-slate-700">
                {selectedLink.source} ↔ {selectedLink.target}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">State</span>
              <span className={`font-mono font-bold ${
                selectedLink.state === 'UP' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {selectedLink.state}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Metric Cost</span>
              <span className="font-mono font-semibold text-slate-700">{selectedLink.cost}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Queue Occupancy</span>
              <span className="font-mono font-semibold text-slate-700">
                {selectedLink.queue.length} / {selectedLink.queueLimit} pkts
              </span>
            </div>
          </div>

          {isNerdMode && (
            <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
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
