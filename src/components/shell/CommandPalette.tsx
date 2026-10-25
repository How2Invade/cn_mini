import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { PRESETS } from '../../simulation/presets';
import { RailSection } from './LeftRail';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: RailSection) => void;
  onOpenDockTab: (tab: 'analytics' | 'terminal' | 'packet_lane') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  onOpenDockTab
}) => {
  const [query, setQuery] = useState('');
  const { setPreset, toggleRun, stepOnce, resetCurrent, autoLayoutPreset } = useSimulation();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'act-run', title: 'Run / Pause Simulation', icon: '▶', run: () => { toggleRun(); onClose(); } },
    { id: 'act-step', title: 'Step 1 Tick Forward', icon: '⏭', run: () => { stepOnce(); onClose(); } },
    { id: 'act-reset', title: 'Reset Topology & Counters', icon: '↺', run: () => { resetCurrent(); onClose(); } },
    { id: 'act-autolayout', title: 'Auto-Layout Topology Nodes', icon: '📐', run: () => { autoLayoutPreset(); onClose(); } },
    { id: 'nav-analytics', title: 'Open Analytics Bento Grid', icon: '📊', run: () => { onOpenDockTab('analytics'); onClose(); } },
    { id: 'nav-terminal', title: 'Open Terminal Shell & NS-2 View', icon: '⌨️', run: () => { onOpenDockTab('terminal'); onClose(); } },
    { id: 'nav-packetlane', title: 'Open Packet Flow Lanes', icon: '⇄', run: () => { onOpenDockTab('packet_lane'); onClose(); } },
    { id: 'nav-compare', title: 'Go to Baseline vs Enhanced Comparison', icon: '⚖️', run: () => { onSelectSection('comparison'); onClose(); } },
    { id: 'nav-research', title: 'Go to Research & Attribution Page', icon: '📚', run: () => { onSelectSection('research'); onClose(); } },
    { id: 'nav-faq', title: 'Go to Professor Viva Defense FAQ', icon: '🎓', run: () => { onSelectSection('faq'); onClose(); } },
  ];

  const filteredPresets = PRESETS.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search input header */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3">
          <span className="text-slate-400 text-lg">🔍</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, preset, or section name..."
            className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent font-medium"
          />
          <kbd className="text-[11px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {/* Actions */}
          {filteredActions.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                Actions & Navigation
              </span>
              <div className="space-y-1">
                {filteredActions.map(act => (
                  <button
                    key={act.id}
                    onClick={act.run}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-xs font-semibold text-slate-800 hover:text-blue-700 flex items-center gap-2.5 transition"
                  >
                    <span>{act.icon}</span>
                    <span>{act.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Presets */}
          {filteredPresets.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                Switch Scenario Preset
              </span>
              <div className="space-y-1">
                {filteredPresets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPreset(p.id);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-xs flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-2">
                      <span>🗂️</span>
                      <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                        {p.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {p.devices.length} nodes
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredPresets.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs italic">
              No matching actions or presets found for &quot;{query}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
