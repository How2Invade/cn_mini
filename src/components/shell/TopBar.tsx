import React, { useEffect, useMemo, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { TrafficClass } from '../../simulation/types';
import { RailSection } from './LeftRail';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Send,
  LayoutGrid,
  Search,
  Sliders,
  Sun,
  Moon,
  Shield,
  ArrowLeft,
  X
} from 'lucide-react';

interface TopBarProps {
  currentSection: RailSection;
  onSelectSection: (section: RailSection) => void;
  onOpenCommandPalette: () => void;
  onAutoLayout: () => void;
  onOpenTour?: () => void;
}

const SECTION_LABEL: Record<RailSection, string> = {
  simulator: 'Topology',
  comparison: 'Compare',
  research: 'Research',
  faq: 'FAQ',
  demo: 'Lab Tour',
};

export const TopBar: React.FC<TopBarProps> = ({
  currentSection,
  onSelectSection,
  onOpenCommandPalette,
  onAutoLayout,
}) => {
  const {
    currentPreset,
    isRunning,
    isDraining,
    toggleRun,
    stepOnce,
    resetCurrent,
    tick,
    speed,
    setSpeed,
    isNerdMode,
    toggleNerdMode,
    isDarkMode,
    toggleTheme,
    qosEnabled,
    toggleQoS,
    sendTraffic,
    devices,
    metrics
  } = useSimulation();

  const endpoints = useMemo(() => devices.filter(d => d.type === 'pc' || d.type === 'server'), [devices]);
  const defaultSrc = devices.find(d => d.type === 'pc')?.id || devices[0]?.id || '';
  const defaultDst = devices.find(d => d.type === 'server')?.id || devices[devices.length - 1]?.id || '';

  const [sendSrc, setSendSrc] = useState(defaultSrc);
  const [sendDst, setSendDst] = useState(defaultDst);
  const [sendCount, setSendCount] = useState<number>(5);
  const [sendClass, setSendClass] = useState<TrafficClass>('CLASS_BEST_EFFORT');
  const [showTrafficModal, setShowTrafficModal] = useState(false);

  // When the preset changes, device IDs change too: keep the selects valid.
  useEffect(() => {
    if (!devices.some(d => d.id === sendSrc)) setSendSrc(defaultSrc);
    if (!devices.some(d => d.id === sendDst)) setSendDst(defaultDst);
  }, [devices, sendSrc, sendDst, defaultSrc, defaultDst]);

  const has = (id: string) => devices.some(d => d.id === id);
  const quickFlows = useMemo(() => {
    const list: { label: string; src: string; dst: string; cls: TrafficClass; count: number }[] = [
      { label: 'Student → Web', src: 'PC-STUD', dst: has('SRV-WEB') ? 'SRV-WEB' : 'SRV-CAMPUS', cls: 'CLASS_BEST_EFFORT', count: 10 },
      { label: 'Voice burst (high priority)', src: 'PC-STUD', dst: has('SRV-WEB') ? 'SRV-WEB' : 'SRV-CAMPUS', cls: 'CLASS_HIGH', count: 15 },
      { label: 'Student → FTP (ACL blocks it)', src: 'PC-STUD', dst: 'SRV-FTP', cls: 'CLASS_BEST_EFFORT', count: 5 },
    ];
    return list.filter(f => has(f.src) && has(f.dst));
  }, [devices]);

  const sendAndClose = (src: string, dst: string, cls: TrafficClass, count: number) => {
    sendTraffic(src, dst, count, cls);
    setShowTrafficModal(false);
  };

  const flow = currentPreset.defaultTrafficParams;
  const statusText = isRunning
    ? flow
      ? `Running · ${flow.source} → ${flow.destination} · ${flow.rate} pkt/tick`
      : 'Running'
    : isDraining
    ? `Delivering ${metrics.inFlight} packet${metrics.inFlight === 1 ? '' : 's'}…`
    : tick === 0
    ? 'Ready · press Run'
    : 'Paused';

  const btnBase =
    'h-10 rounded-xl text-sm font-medium border transition flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60';
  const btnNeutral =
    'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-stone-200/80 dark:border-slate-700/80 hover:bg-stone-50 dark:hover:bg-slate-700/70';

  return (
    <header className="h-16 bg-[#F7F7F2] dark:bg-[#0B0F19] border-b border-[#E8E8E2] dark:border-slate-800/80 px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 z-20 select-none transition-colors duration-200 relative">
      {/* Left: scenario + live status, or breadcrumb on full pages */}
      {currentSection === 'simulator' ? (
        <div className="hidden md:flex items-center gap-2 min-w-0">
          <div className="flex flex-col justify-center min-w-0 leading-tight">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scenario</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[220px]" title={currentPreset.title}>
              {currentPreset.title}
            </span>
          </div>
          <div
            data-testid="sim-status"
            className="hidden lg:flex items-center gap-2 h-10 px-3 rounded-xl bg-white dark:bg-slate-800/90 border border-stone-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 max-w-[340px]"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isRunning ? 'bg-emerald-500 animate-pulse' : isDraining ? 'bg-sky-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
            <span className="font-mono font-semibold shrink-0">Tick {tick}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="truncate">{statusText}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSelectSection('simulator')}
            title="Return to Topology Canvas"
            className={`${btnBase} ${btnNeutral} px-3.5 font-semibold`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Topology Canvas</span>
          </button>
          <div className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-stone-100 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700/80 text-sm font-bold text-slate-900 dark:text-white">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active:</span>
            <span>{SECTION_LABEL[currentSection]}</span>
          </div>
        </div>
      )}

      {/* Center: playback (simulator only) */}
      {currentSection === 'simulator' && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-850 border border-stone-200/80 dark:border-slate-700/80 rounded-2xl p-1">
            <button
              onClick={toggleRun}
              aria-label={isRunning ? 'Pause' : 'Run'}
              title={isRunning ? 'Pause the simulation clock (Space)' : 'Start the clock and the scenario traffic (Space)'}
              className={`h-10 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all min-w-[92px] justify-center ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 stroke-[2.2]" /> : <Play className="w-4 h-4 stroke-[2.2]" />}
              <span>{isRunning ? 'Pause' : 'Run'}</span>
            </button>

            <button
              onClick={stepOnce}
              aria-label="Step"
              title="Advance exactly one tick (injects one tick of scenario traffic)"
              className="h-10 px-3 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-sm font-medium transition flex items-center gap-1.5"
            >
              <SkipForward className="w-4 h-4" />
              <span className="hidden lg:inline">Step</span>
            </button>

            <button
              onClick={resetCurrent}
              aria-label="Reset"
              title="Reset counters, links and queues to the scenario defaults (R)"
              className="h-10 px-3 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-sm font-medium transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden lg:inline">Reset</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden xl:block" />

            <div className="hidden xl:flex items-center gap-0.5" role="group" aria-label="Speed">
              {[0.5, 1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  title={`Speed ${s}x (${Math.max(50, Math.round(250 / s))} ms per tick)`}
                  className={`h-9 min-w-[40px] px-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    speed === s
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowTrafficModal(prev => !prev)}
            aria-label="Send Traffic"
            title="Send a custom packet flow between two devices"
            className="h-12 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold transition flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send Traffic</span>
          </button>
        </div>
      )}

      {/* Right: tools */}
      <div className="flex items-center gap-2 shrink-0">
        {currentSection === 'simulator' && (
          <>
            <button
              onClick={toggleQoS}
              aria-label="QoS"
              title={qosEnabled ? 'QoS ON: high-priority packets are sent first' : 'QoS OFF: first-in first-out queues'}
              className={`hidden xl:flex ${btnBase} px-3 ${
                qosEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                  : btnNeutral
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>QoS {qosEnabled ? 'On' : 'Off'}</span>
            </button>

            <button
              onClick={onAutoLayout}
              aria-label="Auto-Layout"
              title="Restore the tidy default node positions"
              className={`${btnBase} ${btnNeutral} px-3`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden 2xl:inline">Auto-Layout</span>
            </button>
          </>
        )}

        <button
          onClick={onOpenCommandPalette}
          aria-label="Search..."
          title="Search pages, devices, scenarios and actions (⌘K / Ctrl+K)"
          className={`${btnBase} ${btnNeutral} px-3 lg:min-w-[150px]`}
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden lg:inline text-slate-500 dark:text-slate-400">Search...</span>
          <kbd className="hidden lg:inline ml-auto bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-md text-[11px] text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={toggleNerdMode}
          aria-label={isNerdMode ? 'Nerd Mode' : 'Simple Mode'}
          title={isNerdMode ? 'Nerd Mode: IPs, interfaces, link IDs and queue internals (M)' : 'Simple Mode: plain-language overview (M)'}
          className={`${btnBase} px-3 font-semibold ${
            isNerdMode
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
              : btnNeutral
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline">{isNerdMode ? 'Nerd Mode' : 'Simple Mode'}</span>
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`${btnBase} ${btnNeutral} w-10 justify-center dark:text-amber-400`}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Send Traffic popover */}
      {showTrafficModal && currentSection === 'simulator' && (
        <div className="absolute top-[68px] left-1/2 -translate-x-1/2 bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-stone-200/80 dark:border-slate-800 p-5 w-[360px] max-w-[calc(100vw-32px)] z-50 text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Send a packet flow</h4>
            </div>
            <button
              onClick={() => setShowTrafficModal(false)}
              aria-label="Close"
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {quickFlows.length > 0 && (
            <div className="mb-4">
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">Quick flows</span>
              <div className="flex flex-col gap-1.5">
                {quickFlows.map(f => (
                  <button
                    key={f.label}
                    onClick={() => sendAndClose(f.src, f.dst, f.cls, f.count)}
                    className="h-10 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-700 text-sm text-left flex items-center justify-between transition"
                  >
                    <span>{f.label}</span>
                    <span className="text-xs font-mono text-slate-400">{f.count} pkts</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">From</span>
                <select
                  value={sendSrc}
                  onChange={e => setSendSrc(e.target.value)}
                  className="w-full h-10 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl px-2 font-mono text-xs text-slate-800 dark:text-slate-100 outline-none"
                >
                  {(isNerdMode ? devices : endpoints).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">To</span>
                <select
                  value={sendDst}
                  onChange={e => setSendDst(e.target.value)}
                  className="w-full h-10 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl px-2 font-mono text-xs text-slate-800 dark:text-slate-100 outline-none"
                >
                  {(isNerdMode ? devices : endpoints).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">Packets</span>
                <select
                  value={sendCount}
                  onChange={e => setSendCount(Number(e.target.value))}
                  className="w-full h-10 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl px-2 font-mono text-xs text-slate-800 dark:text-slate-100 outline-none"
                >
                  {[1, 5, 10, 25, 50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">Priority</span>
                <select
                  value={sendClass}
                  onChange={e => setSendClass(e.target.value as TrafficClass)}
                  className="w-full h-10 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl px-2 font-mono text-xs text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="CLASS_BEST_EFFORT">Normal</option>
                  <option value="CLASS_HIGH">High (voice)</option>
                </select>
              </label>
            </div>

            {sendSrc === sendDst && (
              <p className="text-xs text-amber-600 dark:text-amber-400">Source and destination are the same device.</p>
            )}

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-slate-800">
              <button
                onClick={() => setShowTrafficModal(false)}
                className="h-10 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium text-sm rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => sendAndClose(sendSrc, sendDst, sendClass, sendCount)}
                disabled={sendSrc === sendDst}
                className="h-10 px-5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition"
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
