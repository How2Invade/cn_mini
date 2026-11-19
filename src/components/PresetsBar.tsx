import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { PRESETS } from '../simulation/presets';
import { Bookmark } from 'lucide-react';

export const PresetsBar: React.FC = () => {
  const { currentPreset, setPreset } = useSimulation();

  return (
    <div className="w-full bg-paper-raised border-y border-slate-200 py-2.5 px-4 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Presets:</span>
        </div>
        {PRESETS.map((p) => {
          const isActive = currentPreset.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2 border ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span>{p.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {p.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
