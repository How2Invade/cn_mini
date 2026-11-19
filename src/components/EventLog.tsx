import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceBadge } from './EvidenceBadge';
import { ScrollText, Filter, Download } from 'lucide-react';
import { EventSeverity } from '../simulation/types';

export const EventLog: React.FC = () => {
  const { events } = useSimulation();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredEvents = events.filter((e) => {
    if (filterSeverity === 'all') return true;
    return e.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: EventSeverity) => {
    switch (severity) {
      case 'error':
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">ERR</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">WARN</span>;
      case 'success':
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">OK</span>;
      case 'info':
      default:
        return <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">INFO</span>;
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `campus-network-events-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-paper-raised dark:bg-[#121315] border-t border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 h-full flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-emerald-400">
            <ScrollText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Deterministic Event Audit Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live tick chronological packet transitions and state events</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">All Severities</option>
              <option value="error">Errors Only</option>
              <option value="warning">Warnings Only</option>
              <option value="success">Success Only</option>
            </select>
          </div>

          <button
            onClick={exportJSON}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1.5 transition-all"
            title="Export Events to JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <EvidenceBadge type="Browser-simulated" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-sans italic">
            No events logged yet. Inject traffic or step the simulation to record events.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.id} className="p-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 flex items-start gap-2.5 transition-colors">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">T{evt.tick}</span>
              {getSeverityBadge(evt.severity)}
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                {evt.type}
              </span>
              <span className="text-slate-700 dark:text-slate-200 flex-1 leading-snug break-words">
                {evt.description}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
