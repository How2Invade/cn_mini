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

interface RailItemProps {
  label: string;
  title: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

const RailItem: React.FC<RailItemProps> = ({ label, title, icon, active, onClick }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={title}
    className={`relative w-full h-12 flex flex-col items-center justify-center gap-1 transition-colors ${
      active
        ? 'text-slate-950 dark:text-slate-50'
        : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
    }`}
  >
    {active && <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-signal-500" />}
    {icon}
    <span className={`text-[10px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
  </button>
);

/** Small schematic mark: two core switches feeding one access layer */
const BrandMark: React.FC = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
    <rect width="32" height="32" rx="6" className="fill-slate-900 dark:fill-slate-100" />
    <g stroke="#E2621E" strokeWidth="2" fill="none">
      <path d="M10 9v6M22 9v6M10 15h12M16 15v8" />
    </g>
    <g className="fill-slate-100 dark:fill-slate-900">
      <rect x="7" y="6" width="6" height="4" rx="1" />
      <rect x="19" y="6" width="6" height="4" rx="1" />
      <rect x="13" y="22" width="6" height="4" rx="1" />
    </g>
  </svg>
);

export const LeftRail: React.FC<LeftRailProps> = ({
  currentSection,
  setSection,
  isPresetsOpen,
  setIsPresetsOpen,
  onOpenDockTab
}) => {
  const { isDarkMode, toggleTheme } = useSimulation();
  const iconCls = 'w-[18px] h-[18px] stroke-[1.6]';

  const go = (section: RailSection) => {
    setIsPresetsOpen(false);
    setSection(section);
  };
  const dock = (tab: 'analytics' | 'terminal' | 'packet_lane' | 'event_log') => {
    setIsPresetsOpen(false);
    onOpenDockTab(tab);
  };

  return (
    <aside
      className="w-[64px] bg-paper dark:bg-ink border-r border-paper-line dark:border-ink-line flex flex-col items-center justify-between shrink-0 select-none z-30"
      aria-label="Navigation Rail"
    >
      <div className="flex flex-col items-center w-full">
        <button
          onClick={() => go('simulator')}
          title="Redundant Data Center Campus Network"
          className="h-14 w-full flex items-center justify-center border-b border-paper-line dark:border-ink-line mb-2"
        >
          <BrandMark />
        </button>

        <RailItem
          label="Topology"
          title="Campus topology canvas"
          icon={<Network className={iconCls} />}
          active={currentSection === 'simulator' && !isPresetsOpen}
          onClick={() => go('simulator')}
        />
        <RailItem
          label="Presets"
          title="Network scenarios and presets"
          icon={<Layers className={iconCls} />}
          active={currentSection === 'simulator' && isPresetsOpen}
          onClick={() => {
            setSection('simulator');
            setIsPresetsOpen(prev => !prev);
          }}
        />
        <RailItem label="Metrics" title="Analytics grid" icon={<Activity className={iconCls} />} onClick={() => dock('analytics')} />
        <RailItem label="Terminal" title="Diagnostic shell and NS-2 generator" icon={<Terminal className={iconCls} />} onClick={() => dock('terminal')} />
        <RailItem label="Lanes" title="Packet hop lanes" icon={<Radio className={iconCls} />} onClick={() => dock('packet_lane')} />
        <RailItem
          label="Lab Tour"
          title="7-step guided lab tour"
          icon={<Compass className={iconCls} />}
          active={currentSection === 'demo'}
          onClick={() => go('demo')}
        />
      </div>

      <div className="flex flex-col items-center w-full pt-2 pb-3 border-t border-paper-line dark:border-ink-line">
        <RailItem
          label="Compare"
          title="Baseline vs enhanced comparison"
          icon={<Scale className={iconCls} />}
          active={currentSection === 'comparison'}
          onClick={() => go('comparison')}
        />
        <RailItem
          label="Research"
          title="Citations and NS-2 architecture"
          icon={<BookOpen className={iconCls} />}
          active={currentSection === 'research'}
          onClick={() => go('research')}
        />
        <RailItem
          label="FAQ"
          title="Frequently asked questions"
          icon={<HelpCircle className={iconCls} />}
          active={currentSection === 'faq'}
          onClick={() => go('faq')}
        />

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="mt-2 w-9 h-9 rounded-lg border border-paper-line dark:border-ink-line flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 stroke-[1.6]" /> : <Moon className="w-4 h-4 stroke-[1.6]" />}
        </button>
      </div>
    </aside>
  );
};
