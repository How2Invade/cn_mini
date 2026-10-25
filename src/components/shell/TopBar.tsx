import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { TrafficClass } from '../../simulation/types';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onAutoLayout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette, onAutoLayout }) => {
  const {
    currentPreset,
    isRunning,
    toggleRun,
    stepOnce,
    resetCurrent,
    tick,
    isNerdMode,
    toggleNerdMode,
    isPresentationMode,
    togglePresentationMode,
    sendTraffic,
    devices
  } = useSimulation();

  const [sendSrc, setSendSrc] = useState(devices[0]?.id || 'PC-STUD');
  const [sendDst, setSendDst] = useState(devices[devices.length - 1]?.id || 'SRV-WEB');
  const [sendClass, setSendClass] = useState<TrafficClass>('CLASS_BEST_EFFORT');
  const [showTrafficModal, setShowTrafficModal] = useState(false);

  const handleQuickSend = () => {
    sendTraffic(sendSrc, sendDst, 1, sendClass);
  };

  return (
    <header className="h-14 bg-white/95 backdrop-blur border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20 select-none">
      {/* Left: Preset Breadcrumb & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Preset:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {currentPreset.title}
          </span>
        </div>

        {/* Live engine tick counter */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <span>Tick: {tick}</span>
        </div>
      </div>

      {/* Center: Playback & Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleRun}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          <span>{isRunning ? '⏸ Pause' : '▶ Run Simulation'}</span>
        </button>

        <button
          onClick={stepOnce}
          disabled={isRunning}
          title="Step forward by exactly 1 tick"
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition"
        >
          ⏭ Step
        </button>

        <button
          onClick={resetCurrent}
          title="Reset topology to preset defaults"
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition"
        >
          ↺ Reset
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Traffic trigger */}
        <button
          onClick={() => setShowTrafficModal(prev => !prev)}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
        >
          <span>🚀</span>
          <span>Send Traffic</span>
        </button>

        {/* Auto-layout topology button */}
        <button
          onClick={onAutoLayout}
          aria-label="Auto-Layout"
          title="Restore tidy layered node coordinates"
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition flex items-center gap-1"
        >
          <span>📐</span>
          <span className="hidden sm:inline">Auto-Layout</span>
        </button>
      </div>

      {/* Right: Modes & Command Palette */}
      <div className="flex items-center gap-2">
        {/* Command palette search shortcut */}
        <button
          onClick={onOpenCommandPalette}
          aria-label="Search..."
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs border border-slate-200 transition"
        >
          <span>🔍</span>
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline bg-white px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono shadow-xs border border-slate-200">
            ⌘K
          </kbd>
        </button>

        {/* Simple / Nerd Mode Toggle */}
        <button
          onClick={toggleNerdMode}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            isNerdMode
              ? 'bg-purple-50 text-purple-700 border-purple-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isNerdMode ? '🤓 Nerd Mode' : '🌱 Simple Mode'}
        </button>

        {/* Presentation Mode Toggle */}
        <button
          onClick={togglePresentationMode}
          title="Toggle Fullscreen Presentation Mode (P)"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isPresentationMode
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          📺
        </button>
      </div>

      {/* Traffic Dispatch Modal / Dropdown */}
      {showTrafficModal && (
        <div className="absolute top-14 right-32 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-72 z-50">
          <h4 className="font-bold text-xs text-slate-800 mb-2">Dispatch Packet Transmission</h4>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Source Node:</label>
              <select
                value={sendSrc}
                onChange={e => setSendSrc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-mono text-xs"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Destination Node:</label>
              <select
                value={sendDst}
                onChange={e => setSendDst(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-mono text-xs"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Traffic QoS Class:</label>
              <select
                value={sendClass}
                onChange={e => setSendClass(e.target.value as TrafficClass)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-mono text-xs"
              >
                <option value="CLASS_BEST_EFFORT">Best Effort (Default Data)</option>
                <option value="CLASS_HIGH">VoIP / Expedited Forwarding (High)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowTrafficModal(false)}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleQuickSend();
                  setShowTrafficModal(false);
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-sm"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
