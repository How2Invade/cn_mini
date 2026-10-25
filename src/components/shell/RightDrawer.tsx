import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Inspectors } from '../Inspectors';
import { Copilot } from '../Copilot';

export const RightDrawer: React.FC = () => {
  const { selectedDeviceId, selectedLinkId, selectDevice, selectLink } = useSimulation();
  const [activeTab, setActiveTab] = useState<'inspector' | 'copilot'>('inspector');

  const hasSelection = Boolean(selectedDeviceId || selectedLinkId);

  // If nothing is selected and user hasn't explicitly opened Copilot, stay collapsed to free up canvas space
  const [forceOpenCopilot, setForceOpenCopilot] = useState(false);

  const isOpen = hasSelection || forceOpenCopilot;

  if (!isOpen) {
    return (
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <button
          onClick={() => {
            setForceOpenCopilot(true);
            setActiveTab('copilot');
          }}
          className="bg-white/95 backdrop-blur border border-slate-200 shadow-md text-blue-600 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-blue-50 transition flex items-center gap-1.5"
        >
          <span>🤖</span>
          <span>Ask Copilot</span>
        </button>
      </div>
    );
  }

  const handleClose = () => {
    selectDevice(null);
    selectLink(null);
    setForceOpenCopilot(false);
  };

  return (
    <aside
      className="w-84 bg-white/95 backdrop-blur border-l border-slate-200 h-full flex flex-col shrink-0 shadow-lg z-20 transition-all select-none"
      aria-label="Inspector and Copilot Drawer"
    >
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 h-11 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              activeTab === 'inspector'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {selectedDeviceId ? 'Device Details' : selectedLinkId ? 'Link Details' : 'Inspector'}
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              activeTab === 'copilot'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Network Copilot
          </button>
        </div>

        <button
          onClick={handleClose}
          title="Close Inspector drawer"
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-xs hover:bg-slate-200/60"
        >
          ✕
        </button>
      </div>

      {/* Content View */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'inspector' ? (
          <Inspectors />
        ) : (
          <Copilot />
        )}
      </div>
    </aside>
  );
};
