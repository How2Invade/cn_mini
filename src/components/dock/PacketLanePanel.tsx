import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { TrafficClass } from '../../simulation/types';
import { CheckCircle2, XCircle, Clock, ArrowRight, Radio } from 'lucide-react';

const CLASS_COLORS: Record<TrafficClass, { bg: string; text: string; border: string; label: string }> = {
  CLASS_HIGH: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    label: 'VoIP (High EF)'
  },
  CLASS_BEST_EFFORT: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'Best Effort'
  }
};

export const PacketLanePanel: React.FC = () => {
  const { livePackets, devices } = useSimulation();

  // Group recent packets into flow lanes (by source-destination pair)
  const recentFlows = React.useMemo(() => {
    const flowsMap = new Map<string, typeof livePackets>();
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
    <div className="h-full flex flex-col bg-[#F8F6F0] dark:bg-[#0F1011] overflow-hidden font-sans select-none transition-colors duration-200">
      {/* Top lane bar / Legend */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-paper-line dark:border-ink-line bg-paper-raised dark:bg-ink-raised">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-800 dark:text-white">Real-Time Packet Flow Lanes</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-stone-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-sm border border-stone-200 dark:border-slate-700 font-mono">
            Active Flows: {recentFlows.length}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">VoIP / High (EF)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Best Effort (Data)</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 dark:border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-400">Delivered</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 ml-1.5" />
            <span className="text-slate-600 dark:text-slate-400">Dropped</span>
          </div>
        </div>
      </div>

      {/* Lanes display with smooth scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {recentFlows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-paper-raised dark:bg-ink-raised rounded-3xl border border-dashed border-stone-300 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-semibold text-xl mb-3">
              <Radio className="w-6 h-6 text-slate-400" />
            </div>
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm">No Active Packet Flow Lanes</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              Click <strong>&quot;Send Traffic&quot;</strong> in the top bar to dispatch packets across switches and queues.
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
                className="bg-paper-raised dark:bg-ink-raised rounded-3xl p-4 border border-paper-line dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-all"
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-xs font-mono">{flowKey}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({hops.length} hops)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-sm border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{deliveredCount} delivered</span>
                    </span>
                    {droppedCount > 0 && (
                      <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-sm border border-rose-200 dark:border-rose-800 font-semibold flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        <span>{droppedCount} dropped</span>
                      </span>
                    )}
                    {inFlightCount > 0 && (
                      <span className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-sm border border-blue-200 dark:border-blue-800">
                        {inFlightCount} in transit
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
                        <div className="flex flex-col items-center min-w-[95px] p-2.5 bg-stone-50 dark:bg-slate-900 border border-paper-line dark:border-slate-800 rounded-2xl">
                          <span className="text-[10px] uppercase font-semibold text-slate-400">{devType}</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-mono mt-0.5 truncate max-w-[90px]">
                            {hopId}
                          </span>
                        </div>

                        {!isLast && (
                          <div className="flex items-center justify-center text-slate-400 dark:text-slate-500 px-1">
                            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Packet stream cards under the lane */}
                <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Packets:</span>
                  {packets.slice(-12).map((pkt) => {
                    const styling = CLASS_COLORS[pkt.trafficClass] || CLASS_COLORS.CLASS_BEST_EFFORT;
                    return (
                      <div
                        key={pkt.id}
                        title={`ID: ${pkt.id} | Class: ${styling.label} | Hop: ${pkt.currentHopIndex}/${pkt.path.length} | Status: ${pkt.status}${pkt.dropReason ? ` (${pkt.dropReason})` : ''}`}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[11px] font-mono border ${styling.border} ${styling.bg} ${styling.text} transition-transform ${
                          pkt.status === 'dropped' ? 'line-through !bg-rose-50 dark:!bg-rose-950 !border-rose-400 !text-rose-700 dark:!text-rose-300 font-semibold' : ''
                        }`}
                      >
                        <span>{pkt.id}</span>
                        {pkt.status === 'delivered' && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" />}
                        {pkt.status === 'dropped' && <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 inline" />}
                        {pkt.status === 'queued' && <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 inline" />}
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
