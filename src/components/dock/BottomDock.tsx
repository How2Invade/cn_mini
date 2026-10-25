import React, { useState } from 'react';
import { AnalyticsBento } from './AnalyticsBento';
import { TerminalPanel } from './TerminalPanel';
import { PacketLanePanel } from './PacketLanePanel';
import { EventLog } from '../EventLog';
import { Activity, Terminal, Radio, ScrollText, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';

export type DockTabId = 'analytics' | 'terminal' | 'packet_lane' | 'event_log';

interface BottomDockProps {
  activeTab: DockTabId;
  setActiveTab: (tab: DockTabId) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-[#101622] border-t border-[#E8E8E2] dark:border-slate-800 transition-all duration-300 flex flex-col shadow-xl z-20 ${
        !isOpen ? 'h-14' : isMaximized ? 'h-[75vh]' : 'h-80'
      }`}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#E8E8E2] dark:border-slate-800 bg-[#F7F7F2] dark:bg-[#0B0F19] shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto min-w-0 mr-2 py-1 select-none">
          <button
            onClick={() => {
              setActiveTab('analytics');
              setIsOpen(true);
            }}
            className={`h-10 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              isOpen && activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Analytics Grid</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('terminal');
              setIsOpen(true);
            }}
            className={`h-10 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              isOpen && activeTab === 'terminal'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span>Terminal & NS-2</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('packet_lane');
              setIsOpen(true);
            }}
            className={`h-10 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              isOpen && activeTab === 'packet_lane'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-500" />
            <span>Packet Lane</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('event_log');
              setIsOpen(true);
            }}
            className={`h-10 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              isOpen && activeTab === 'event_log'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <ScrollText className="w-4 h-4 text-slate-500" />
            <span>Event Stream</span>
          </button>
        </div>

        {/* Controls: Maximize & Collapse */}
        <div className="flex items-center gap-2 shrink-0">
          {isOpen && (
            <button
              onClick={() => setIsMaximized(prev => !prev)}
              title={isMaximized ? 'Restore height' : 'Maximize dock'}
              className="h-10 px-3.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMaximized ? 'Restore' : 'Maximize'}</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Collapse dock' : 'Expand dock'}
            className="h-10 px-3.5 bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-slate-700/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      {isOpen && (
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'analytics' && <AnalyticsBento />}
          {activeTab === 'terminal' && <TerminalPanel />}
          {activeTab === 'packet_lane' && <PacketLanePanel />}
          {activeTab === 'event_log' && <EventLog />}
        </div>
      )}
    </div>
  );
};
