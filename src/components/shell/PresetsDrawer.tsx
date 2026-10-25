import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { PRESETS } from '../../simulation/presets';
import { PresetConfig } from '../../simulation/types';
import { Network, Zap, AlertTriangle, Activity, X } from 'lucide-react';

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
        onClick={() => {
          setPreset(preset.id);
        }}
        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
          isActive
            ? 'bg-stone-50 dark:bg-slate-800/90 border-slate-900 dark:border-white shadow-sm ring-1 ring-slate-900/10 dark:ring-white/10'
            : 'bg-white dark:bg-[#151D2C] border-stone-200/80 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-stone-50/50'
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shrink-0">
              {preset.id.includes('baseline') ? (
                <Network className="w-4 h-4" />
              ) : preset.id.includes('enhanced') ? (
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : preset.id.includes('failure') ? (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              ) : (
                <Activity className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              {preset.title}
            </h4>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor}`}>
            {categoryTag}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {preset.description}
        </p>

        <div className="mt-3 pt-2 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono text-[10px]">
            {preset.devices.length} Nodes · {preset.links.length} Trunks
          </span>
          {isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetCurrent();
              }}
              title="Reset counters and layout for this scenario"
              className="text-slate-900 dark:text-white font-bold hover:underline text-[11px]"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-72 sm:w-80 bg-[#FAF9F5] dark:bg-[#0F1420] border-r border-[#E8E8E2] dark:border-slate-800/80 flex flex-col h-full shrink-0 shadow-xl z-20 select-none transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#E8E8E2] dark:border-slate-800/80 flex items-center justify-between bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur">
        <div>
          <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            Network Scenarios
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Curated campus lab topologies</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Cards List with Smooth Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                p.id.includes('baseline')
                  ? 'bg-stone-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  : 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
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
                p.id.includes('failure')
                  ? 'bg-rose-100/70 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
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
                renderPresetCard(
                  p,
                  'Edge Case',
                  'bg-blue-100/70 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
