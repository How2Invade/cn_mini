import React, { useState } from 'react';
import { AnalyticsBento } from './AnalyticsBento';
import { TerminalPanel } from './TerminalPanel';
import { PacketLanePanel } from './PacketLanePanel';
import { EventLog } from '../EventLog';

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
      className={`bg-white border-t border-slate-200 transition-all duration-300 flex flex-col shadow-lg z-20 ${
        !isOpen ? 'h-10' : isMaximized ? 'h-[75vh]' : 'h-80'
      }`}
    >
      {/* Dock Header Tabs bar */}
      <div className="flex items-center justify-between px-3 h-10 border-b border-slate-200 bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('analytics');
              setIsOpen(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOpen && activeTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📊</span>
            <span>Analytics Grid</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('terminal');
              setIsOpen(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOpen && activeTab === 'terminal'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>⌨️</span>
            <span>Terminal & NS-2</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('packet_lane');
              setIsOpen(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOpen && activeTab === 'packet_lane'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>⇄</span>
            <span>Packet Lane</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('event_log');
              setIsOpen(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOpen && activeTab === 'event_log'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📋</span>
            <span>Event Stream</span>
          </button>
        </div>

        {/* Controls: Maximize & Collapse */}
        <div className="flex items-center gap-1.5">
          {isOpen && (
            <button
              onClick={() => setIsMaximized(prev => !prev)}
              title={isMaximized ? 'Restore dock height' : 'Maximize dock'}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded text-xs font-mono"
            >
              {isMaximized ? '⤓ Restore' : '⤒ Maximize'}
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Collapse dock' : 'Expand dock'}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded text-xs font-mono"
          >
            {isOpen ? '▼ Hide' : '▲ Open Dock'}
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      {isOpen && (
        <div className="flex-1 overflow-hidden">
          {activeTab === 'analytics' && <AnalyticsBento />}
          {activeTab === 'terminal' && <TerminalPanel />}
          {activeTab === 'packet_lane' && <PacketLanePanel />}
          {activeTab === 'event_log' && <EventLog />}
        </div>
      )}
    </div>
  );
};
