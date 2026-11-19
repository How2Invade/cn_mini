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
      className={`bg-paper-raised dark:bg-[#141517] border-t border-paper-line dark:border-ink-line transition-[height] duration-200 flex flex-col z-20 ${
        !isOpen ? 'h-11' : isMaximized ? 'h-[75vh]' : 'h-80'
      }`}
    >
      <div className="flex items-center justify-between px-2 h-11 border-b border-paper-line dark:border-ink-line bg-paper dark:bg-ink shrink-0">
        <div className="flex items-center overflow-x-auto min-w-0 mr-2 select-none">
          <button
            onClick={() => {
              setActiveTab('analytics');
              setIsOpen(true);
            }}
            className={`relative h-11 px-3 text-[13px] flex items-center gap-2 transition-colors shrink-0 ${
              isOpen && activeTab === 'analytics'
                ? 'text-slate-950 dark:text-slate-50 font-semibold after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:bg-signal-500'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 opacity-70" />
            <span>Analytics Grid</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('terminal');
              setIsOpen(true);
            }}
            className={`relative h-11 px-3 text-[13px] flex items-center gap-2 transition-colors shrink-0 ${
              isOpen && activeTab === 'terminal'
                ? 'text-slate-950 dark:text-slate-50 font-semibold after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:bg-signal-500'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 opacity-70" />
            <span>Terminal & NS-2</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('packet_lane');
              setIsOpen(true);
            }}
            className={`relative h-11 px-3 text-[13px] flex items-center gap-2 transition-colors shrink-0 ${
              isOpen && activeTab === 'packet_lane'
                ? 'text-slate-950 dark:text-slate-50 font-semibold after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:bg-signal-500'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 opacity-70" />
            <span>Packet Lane</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('event_log');
              setIsOpen(true);
            }}
            className={`relative h-11 px-3 text-[13px] flex items-center gap-2 transition-colors shrink-0 ${
              isOpen && activeTab === 'event_log'
                ? 'text-slate-950 dark:text-slate-50 font-semibold after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:bg-signal-500'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 opacity-70" />
            <span>Event Stream</span>
          </button>
        </div>

        {/* Controls: Maximize & Collapse */}
        <div className="flex items-center gap-2 shrink-0">
          {isOpen && (
            <button
              onClick={() => setIsMaximized(prev => !prev)}
              title={isMaximized ? 'Restore height' : 'Maximize dock'}
              className="h-8 px-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMaximized ? 'Restore' : 'Maximize'}</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Collapse dock' : 'Expand dock'}
            className="h-8 px-2.5 bg-paper-raised dark:bg-ink-raised border border-paper-line dark:border-ink-line text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-slate-700/80 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
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
