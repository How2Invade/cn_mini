import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Inspectors } from '../Inspectors';
import { Copilot } from '../Copilot';
import { X, SlidersHorizontal, Bot } from 'lucide-react';

export const RightDrawer: React.FC = () => {
  const { selectedDeviceId, selectedLinkId, selectDevice, selectLink, isCopilotOpen, setIsCopilotOpen } = useSimulation();
  const [activeTab, setActiveTab] = useState<'inspector' | 'copilot'>('inspector');

  const hasSelection = Boolean(selectedDeviceId || selectedLinkId);
  const isOpen = hasSelection || isCopilotOpen;

  useEffect(() => {
    if (isCopilotOpen && !hasSelection) {
      setActiveTab('copilot');
    }
  }, [isCopilotOpen, hasSelection]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    selectDevice(null);
    selectLink(null);
    setIsCopilotOpen(false);
  };

  return (
    <aside
      className="w-88 bg-paper-raised dark:bg-[#141517]/95 border-l border-paper-line dark:border-ink-line h-full flex flex-col shrink-0 shadow-2xl z-20 transition-all select-none"
      aria-label="Inspector and Copilot Drawer"
    >
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3.5 h-14 border-b border-paper-line dark:border-ink-line bg-paper dark:bg-ink">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'inspector'
                ? 'bg-paper-raised dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{selectedDeviceId ? 'Device Details' : selectedLinkId ? 'Link Details' : 'Inspector'}</span>
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'copilot'
                ? 'bg-paper-raised dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Network Copilot</span>
          </button>
        </div>

        <button
          onClick={handleClose}
          title="Close Inspector drawer"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl text-xs hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content View with smooth scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'inspector' ? (
          <Inspectors />
        ) : (
          <Copilot />
        )}
      </div>
    </aside>
  );
};
