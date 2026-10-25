import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CheckCircle2, XCircle, Send, Radio } from 'lucide-react';

export const PacketAnimationOverlay: React.FC = () => {
  const { livePackets, tick, isRunning } = useSimulation();

  if (livePackets.length === 0) return null;

  // Render recent 6 packets with high-visibility status
  const visiblePackets = livePackets.slice(-6);

  return (
    <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-3 max-w-xs w-full pointer-events-auto">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Radio className={`w-3.5 h-3.5 ${isRunning ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
          <span>Packet Live Stream</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">Tick {tick}</span>
      </div>

      <div className="space-y-1.5 max-h-36 overflow-y-auto">
        {visiblePackets.map((pkt) => {
          const isDelivered = pkt.status === 'delivered';
          const isDropped = pkt.status === 'dropped';
          const isHighPriority = pkt.trafficClass === 'CLASS_HIGH';

          return (
            <div
              key={pkt.id}
              className={`p-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-between gap-1 transition-all ${
                isDelivered
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : isDropped
                  ? 'bg-red-50/70 border-red-200 text-red-800'
                  : 'bg-sky-50/70 border-sky-200 text-sky-800'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isDelivered ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : isDropped ? (
                  <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-sky-600 shrink-0 animate-bounce" />
                )}
                <span className="font-bold truncate">{pkt.id}</span>
                <span className="text-[9px] text-slate-500 truncate">
                  {pkt.source}→{pkt.destination}
                </span>
              </div>

              <div className="shrink-0 text-right">
                {isDropped ? (
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-red-200 text-red-800">
                    DROP:{pkt.dropReason}
                  </span>
                ) : isDelivered ? (
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-200 text-emerald-800">
                    DELIVERED
                  </span>
                ) : (
                  <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                    isHighPriority ? 'bg-purple-200 text-purple-800' : 'bg-sky-200 text-sky-800'
                  }`}>
                    HOP {pkt.currentHopIndex}/{Math.max(1, pkt.path.length - 1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
