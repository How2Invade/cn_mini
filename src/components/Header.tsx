import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EvidenceBadge } from './EvidenceBadge';
import { Network, Terminal, Eye, Presentation } from 'lucide-react';

export const Header: React.FC = () => {
  const { isNerdMode, toggleNerdMode, isPresentationMode, togglePresentationMode } = useSimulation();

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand & Titles */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Smart Adaptive Campus Network Simulator
              </h1>
              <EvidenceBadge type="Browser-simulated" />
            </div>
            <p className="text-xs text-slate-500">
              Traffic Optimization, Redundancy & Failure Management Laboratory
            </p>
          </div>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Nerd Mode Toggle */}
          <button
            onClick={toggleNerdMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all border ${
              isNerdMode
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle between Simple Human View and Deep Technical Telemetry"
          >
            {isNerdMode ? <Terminal className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isNerdMode ? 'Nerd Mode: ON' : 'Simple Mode'}</span>
          </button>

          {/* Presentation Mode Toggle */}
          <button
            onClick={togglePresentationMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              isPresentationMode
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Presentation Mode (Keyboard: P)"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Presentation Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
