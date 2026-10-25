import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  Network,
  Layers,
  Activity,
  Terminal,
  Radio,
  Compass,
  Scale,
  BookOpen,
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react';

export type RailSection = 'simulator' | 'comparison' | 'research' | 'faq' | 'demo';

interface LeftRailProps {
  currentSection: RailSection;
  setSection: (section: RailSection) => void;
  isPresetsOpen: boolean;
  setIsPresetsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onOpenDockTab: (tab: 'analytics' | 'terminal' | 'packet_lane' | 'event_log') => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  currentSection,
  setSection,
  isPresetsOpen,
  setIsPresetsOpen,
  onOpenDockTab
}) => {
  const { isDarkMode, toggleTheme } = useSimulation();

  return (
    <aside
      className="w-16 bg-[#F7F7F2] dark:bg-[#0B0F19] border-r border-[#E8E8E2] dark:border-slate-800/80 flex flex-col items-center py-4 justify-between shrink-0 select-none z-30 transition-colors duration-200"
      aria-label="Navigation Rail"
    >
      {/* Top: Brand Mark & Main Nav */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {/* Minimal Brand Mark */}
        <button
          onClick={() => setSection('simulator')}
          title="Smart Adaptive Campus Network Simulator"
          className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-sm tracking-tight shadow-sm hover:scale-105 active:scale-95 transition-all mb-3"
        >
          CN
        </button>

        {/* Section 1: Simulator View */}
        <button
          onClick={() => {
            setSection('simulator');
            setIsPresetsOpen(false);
          }}
          aria-label="Topology"
          title="Campus Topology Canvas"
          className={`w-full py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'simulator' && !isPresetsOpen
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Network className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Topology</span>
        </button>

        {/* Presets Drawer Toggle */}
        <button
          onClick={() => {
            setSection('simulator');
            setIsPresetsOpen(prev => !prev);
          }}
          aria-label="Presets"
          title="Network Scenarios & Presets"
          className={`w-full py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'simulator' && isPresetsOpen
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Presets</span>
        </button>

        {/* Direct Dock Shortcuts */}
        <button
          onClick={() => {
            setIsPresetsOpen(false);
            onOpenDockTab('analytics');
          }}
          aria-label="Metrics"
          title="Analytics Grid"
          className="w-full py-2.5 rounded-2xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <Activity className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Metrics</span>
        </button>

        <button
          onClick={() => {
            setIsPresetsOpen(false);
            onOpenDockTab('terminal');
          }}
          aria-label="Terminal"
          title="Diagnostic Shell & NS-2 Generator"
          className="w-full py-2.5 rounded-2xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <Terminal className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Terminal</span>
        </button>

        <button
          onClick={() => {
            setIsPresetsOpen(false);
            onOpenDockTab('packet_lane');
          }}
          aria-label="Lanes"
          title="Packet Hop Lanes"
          className="w-full py-2.5 rounded-2xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <Radio className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Lanes</span>
        </button>

        <button
          onClick={() => {
            setIsPresetsOpen(false);
            setSection('demo');
          }}
          aria-label="Lab Tour"
          title="7-Step Guided Lab Tour"
          className={`w-full py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'demo'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Compass className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Lab Tour</span>
        </button>
      </div>

      {/* Bottom: Auxiliary Pages & Theme Switcher */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2 pt-3 border-t border-[#E8E8E2] dark:border-slate-800/80">
        <button
          onClick={() => {
            setIsPresetsOpen(false);
            setSection('comparison');
          }}
          aria-label="Compare"
          title="Baseline vs Enhanced Comparison"
          className={`w-full py-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'comparison'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Scale className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Compare</span>
        </button>

        <button
          onClick={() => {
            setIsPresetsOpen(false);
            setSection('research');
          }}
          aria-label="Research"
          title="Academic Citations & NS-2 Architecture"
          className={`w-full py-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'research'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Research</span>
        </button>

        <button
          onClick={() => {
            setIsPresetsOpen(false);
            setSection('faq');
          }}
          aria-label="FAQ"
          title="Frequently Asked Questions"
          className={`w-full py-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
            currentSection === 'faq'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <HelpCircle className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[9px] mt-1 font-medium tracking-tight">FAQ</span>
        </button>

        {/* Theme Toggle Pill */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={isDarkMode ? 'Switch to Warm Light Mode' : 'Switch to Dark Mode'}
          className="mt-1 w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-xs"
        >
          {isDarkMode ? <Sun className="w-4 h-4 stroke-[1.8]" /> : <Moon className="w-4 h-4 stroke-[1.8]" />}
        </button>
      </div>
    </aside>
  );
};
