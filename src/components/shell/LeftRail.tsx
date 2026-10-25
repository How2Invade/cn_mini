import React from 'react';

export type RailSection = 'simulator' | 'comparison' | 'research' | 'faq';

interface LeftRailProps {
  currentSection: RailSection;
  setSection: (section: RailSection) => void;
  isPresetsOpen: boolean;
  setIsPresetsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onOpenDockTab: (tab: 'analytics' | 'terminal' | 'packet_lane') => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  currentSection,
  setSection,
  isPresetsOpen,
  setIsPresetsOpen,
  onOpenDockTab
}) => {
  return (
    <aside
      className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-3 justify-between shrink-0 select-none z-30"
      aria-label="Navigation Rail"
    >
      {/* Top Brand & Core Views */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Brand Mark */}
        <div
          title="Smart Adaptive Campus Network Simulator"
          className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-blue-200 cursor-pointer mb-2"
          onClick={() => setSection('simulator')}
        >
          CN
        </div>

        {/* Section 1: Simulator View */}
        <button
          onClick={() => setSection('simulator')}
          title="Topology & Interactive Simulator"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'simulator'
              ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="text-base">🌐</span>
          <span className="text-[9px] mt-0.5 font-medium">Topology</span>
        </button>

        {/* Presets Drawer Toggle */}
        <button
          onClick={() => setIsPresetsOpen(prev => !prev)}
          title="Network Scenarios & Presets"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
            isPresetsOpen
              ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="text-base">🗂️</span>
          <span className="text-[9px] mt-0.5 font-medium">Presets</span>
        </button>

        {/* Direct Dock Shortcuts */}
        <button
          onClick={() => onOpenDockTab('analytics')}
          title="Analytics Bento Grid"
          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <span className="text-base">📊</span>
          <span className="text-[9px] mt-0.5 font-medium">Metrics</span>
        </button>

        <button
          onClick={() => onOpenDockTab('terminal')}
          title="Interactive Terminal & NS-2"
          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <span className="text-base">⌨️</span>
          <span className="text-[9px] mt-0.5 font-medium">Terminal</span>
        </button>

        <button
          onClick={() => onOpenDockTab('packet_lane')}
          title="Packet Hop Lanes"
          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <span className="text-base">⇄</span>
          <span className="text-[9px] mt-0.5 font-medium">Lanes</span>
        </button>
      </div>

      {/* Bottom Auxiliary Pages */}
      <div className="flex flex-col items-center gap-2 w-full pt-3 border-t border-slate-100">
        {/* Comparison Page */}
        <button
          onClick={() => setSection('comparison')}
          title="Baseline vs Enhanced Comparison"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'comparison'
              ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="text-base">⚖️</span>
          <span className="text-[9px] mt-0.5 font-medium">Compare</span>
        </button>

        {/* Research & Attribution */}
        <button
          onClick={() => setSection('research')}
          title="Research Methodology, Citations & NS-2 Mapping"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'research'
              ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="text-base">📚</span>
          <span className="text-[9px] mt-0.5 font-medium">Research</span>
        </button>

        {/* Professor Viva FAQ */}
        <button
          onClick={() => setSection('faq')}
          title="Viva Defense & Technical FAQ"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'faq'
              ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="text-base">🎓</span>
          <span className="text-[9px] mt-0.5 font-medium">Viva/FAQ</span>
        </button>
      </div>
    </aside>
  );
};
