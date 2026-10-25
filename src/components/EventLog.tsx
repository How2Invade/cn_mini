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
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-700">ERR</span>;
      case 'warning':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-700">WARN</span>;
      case 'success':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700">OK</span>;
      case 'info':
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">INFO</span>;
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Deterministic Event Audit Log</h3>
            <p className="text-xs text-slate-500">Live tick chronological packet transitions and state events</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none"
            >
              <option value="all">All Severities</option>
              <option value="error">Errors Only</option>
              <option value="warning">Warnings Only</option>
              <option value="success">Success Only</option>
            </select>
          </div>

          <button
            onClick={exportJSON}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs flex items-center gap-1 transition-all"
            title="Export Events to JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <EvidenceBadge type="Browser-simulated" />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100 font-mono text-xs">
        {filteredEvents.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No events logged yet. Inject traffic or step the simulation to record events.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.id} className="p-2.5 hover:bg-slate-50/80 flex items-start gap-2.5 transition-colors">
              <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">T{evt.tick}</span>
              {getSeverityBadge(evt.severity)}
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 shrink-0">
                {evt.type}
              </span>
              <span className="text-slate-700 flex-1 leading-snug break-words">
                {evt.description}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
