import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { TrafficClass } from '../../simulation/types';

const CLASS_COLORS: Record<TrafficClass, { bg: string; text: string; border: string; label: string }> = {
  CLASS_HIGH: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', label: 'VoIP (High EF)' },
  CLASS_BEST_EFFORT: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Best Effort' }
};

export const PacketLanePanel: React.FC = () => {
  const { livePackets, devices } = useSimulation();

  // Group recent packets into flow lanes (by source-destination pair)
  const recentFlows = React.useMemo(() => {
    const flowsMap = new Map<string, typeof livePackets>();
    // Take the last 60 packets
    const slice = livePackets.slice(-60);
    slice.forEach(pkt => {
      const key = `${pkt.source} → ${pkt.destination}`;
      if (!flowsMap.has(key)) {
        flowsMap.set(key, []);
      }
      flowsMap.get(key)!.push(pkt);
    });
    return Array.from(flowsMap.entries());
  }, [livePackets]);

  const getDeviceType = (id: string) => {
    const d = devices.find(dev => dev.id === id);
    return d ? d.type : 'node';
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden font-sans select-none">
      {/* Top lane bar / Legend */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800">Real-Time Packet Flow Lanes</span>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Active Flows: {recentFlows.length}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-400"></span>
            <span className="text-slate-600 font-medium">VoIP / High (EF)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-400"></span>
            <span className="text-slate-600 font-medium">Best Effort (Data)</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="inline-block w-3 h-3 text-emerald-600 font-bold">✓</span>
            <span className="text-slate-600">Delivered</span>
            <span className="inline-block w-3 h-3 text-rose-600 font-bold ml-1">✕</span>
            <span className="text-slate-600">Dropped</span>
          </div>
        </div>
      </div>

      {/* Lanes display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {recentFlows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-2">
              ⇄
            </div>
            <h5 className="font-semibold text-slate-800 text-sm">No Active Packet Flow Lanes</h5>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Click <strong>&quot;Send Traffic&quot;</strong> in the top bar or run the simulation to observe live packet traversals across switches and queues.
            </p>
          </div>
        ) : (
          recentFlows.map(([flowKey, packets]) => {
            const deliveredCount = packets.filter(p => p.status === 'delivered').length;
            const droppedCount = packets.filter(p => p.status === 'dropped').length;
            const inFlightCount = packets.filter(p => p.status === 'in_transit' || p.status === 'queued').length;
            const latestPacket = packets[packets.length - 1];
            const hops = latestPacket?.path?.length > 0 ? latestPacket.path : [latestPacket.source, latestPacket.destination];

            return (
              <div
                key={flowKey}
                className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all"
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs font-mono">{flowKey}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({hops.length} hops)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                      ✓ {deliveredCount} delivered
                    </span>
                    {droppedCount > 0 && (
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                        ✕ {droppedCount} dropped
                      </span>
                    )}
                    {inFlightCount > 0 && (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        ● {inFlightCount} in transit
                      </span>
                    )}
                  </div>
                </div>

                {/* Horizontal Hop Path with packet representations */}
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {hops.map((hopId, idx) => {
                    const isLast = idx === hops.length - 1;
                    const devType = getDeviceType(hopId);
                    return (
                      <React.Fragment key={hopId}>
                        <div className="flex flex-col items-center min-w-[90px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400">{devType}</span>
                          <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 truncate max-w-[85px]">
                            {hopId}
                          </span>
                        </div>

                        {!isLast && (
                          <div className="flex items-center justify-center text-slate-400 px-1 font-bold">
                            ⟶
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Packet stream cards under the lane */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Packets:</span>
                  {packets.slice(-12).map((pkt) => {
                    const styling = CLASS_COLORS[pkt.trafficClass] || CLASS_COLORS.CLASS_BEST_EFFORT;
                    return (
                      <div
                        key={pkt.id}
                        title={`ID: ${pkt.id} | Class: ${styling.label} | Hop: ${pkt.currentHopIndex}/${pkt.path.length} | Status: ${pkt.status}${pkt.dropReason ? ` (${pkt.dropReason})` : ''}`}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${styling.border} ${styling.bg} ${styling.text} transition-transform ${
                          pkt.status === 'dropped' ? 'line-through !bg-rose-50 !border-rose-400 !text-rose-700 font-bold' : ''
                        }`}
                      >
                        <span>{pkt.id}</span>
                        {pkt.status === 'delivered' && <span className="text-emerald-700 font-bold">✓</span>}
                        {pkt.status === 'dropped' && <span className="text-rose-700 font-bold">✕</span>}
                        {pkt.status === 'queued' && <span className="text-amber-700 font-bold">⏳</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
