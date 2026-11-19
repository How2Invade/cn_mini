import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { CheckCircle2, XCircle, Send, Radio, ChevronDown, ChevronUp } from 'lucide-react';

export const PacketAnimationOverlay: React.FC = () => {
  const { livePackets, tick, isRunning } = useSimulation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (livePackets.length === 0) return null;

  const visiblePackets = livePackets.slice(-4);
  const inTransitCount = livePackets.filter(p => p.status === 'in_transit' || p.status === 'queued').length;

  return (
    <div className="absolute top-13.5 right-3 z-20 pointer-events-auto transition-all">
      {/* Sleek Pill Header Badge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-paper-raised dark:bg-ink-raised/95 px-3.5 h-8.5 rounded-xl border border-paper-line dark:border-slate-800 shadow-2xs text-xs font-medium text-slate-800 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 transition"
      >
        <Radio className={`w-3.5 h-3.5 ${isRunning ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
        <span className="font-semibold text-[11px]">
          {inTransitCount > 0 ? `${inTransitCount} In Flight` : 'Packet Stream'}
        </span>
        <span className="font-mono text-[10px] text-slate-400">T:{tick}</span>
        {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
      </button>

      {/* Expandable Stream Details */}
      {isExpanded && (
        <div className="mt-2 bg-paper-raised dark:bg-ink-raised/95 border border-paper-line dark:border-slate-800 shadow-xl rounded-2xl p-3 w-72 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {visiblePackets.map((pkt) => {
              const isDelivered = pkt.status === 'delivered';
              const isDropped = pkt.status === 'dropped';

              return (
                <div
                  key={pkt.id}
                  className={`p-2 rounded-xl border text-[10px] font-mono flex items-center justify-between gap-1 transition-all ${
                    isDelivered
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : isDropped
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                      : 'bg-stone-50 dark:bg-slate-800/60 border-paper-line dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isDelivered ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : isDropped ? (
                      <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                    ) : (
                      <Send className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                    <span className="font-semibold truncate">{pkt.id}</span>
                    <span className="text-slate-400 truncate">
                      {pkt.source}→{pkt.destination}
                    </span>
                  </div>

                  <div className="shrink-0 font-semibold">
                    {isDropped ? (
                      <span className="text-rose-600 dark:text-rose-400">DROP</span>
                    ) : isDelivered ? (
                      <span className="text-emerald-600 dark:text-emerald-400">OK</span>
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400">
                        HOP {pkt.currentHopIndex}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
