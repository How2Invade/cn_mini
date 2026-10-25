import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { PRESETS } from '../../simulation/presets';
import { PresetConfig } from '../../simulation/types';

interface PresetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresetsDrawer: React.FC<PresetsDrawerProps> = ({ isOpen, onClose }) => {
  const { currentPreset, setPreset, resetCurrent } = useSimulation();

  if (!isOpen) return null;

  // Group presets into Architectures, Experiments, and Tests
  const architectures = PRESETS.slice(0, 2); // Baseline, Enhanced
  const experiments = PRESETS.slice(2, 4);   // Link Failure, High Traffic QoS
  const tests = PRESETS.slice(4);            // Convergence, Stress, Edge

  const renderPresetCard = (preset: PresetConfig, categoryTag: string, tagColor: string) => {
    const isActive = currentPreset.id === preset.id;
    return (
      <div
        key={preset.id}
        onClick={() => setPreset(preset.id)}
        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
          isActive
            ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-300'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base">
              {preset.id.includes('baseline') ? '🏛️' : preset.id.includes('enhanced') ? '⚡' : preset.id.includes('failure') ? '💥' : '🚀'}
            </span>
            <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition">
              {preset.title}
            </h4>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tagColor}`}>
            {categoryTag}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {preset.description}
        </p>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono">
            {preset.devices.length} Nodes · {preset.links.length} Trunks
          </span>
          {isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetCurrent();
              }}
              title="Reset counters and layout for this scenario"
              className="text-blue-600 font-semibold hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-20 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Network Scenarios</h3>
          <p className="text-[11px] text-slate-500">Curated campus lab topologies</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-xs hover:bg-slate-200/60"
        >
          ✕
        </button>
      </div>

      {/* Preset Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Category: Architectures */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Core Architectures
          </span>
          <div className="space-y-2">
            {architectures.map(p =>
              renderPresetCard(
                p,
                p.id.includes('baseline') ? 'Baseline' : 'Enhanced',
                p.id.includes('baseline') ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-700'
              )
            )}
          </div>
        </div>

        {/* Category: Experiments */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Dynamic Experiments
          </span>
          <div className="space-y-2">
            {experiments.map(p =>
              renderPresetCard(
                p,
                p.id.includes('failure') ? 'Failure Test' : 'Traffic Test',
                p.id.includes('failure') ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
              )
            )}
          </div>
        </div>

        {/* Category: Tests & Benchmarks */}
        {tests.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Diagnostic Benchmarks
            </span>
            <div className="space-y-2">
              {tests.map(p =>
                renderPresetCard(p, 'Edge Case', 'bg-blue-50 text-blue-700')
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
