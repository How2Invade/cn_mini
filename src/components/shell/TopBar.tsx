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
    'h-9 rounded-lg text-[13px] font-medium border transition-colors flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-500/50';
  const btnNeutral =
    'bg-paper-raised dark:bg-ink-raised text-slate-700 dark:text-slate-200 border-paper-line dark:border-ink-line hover:bg-slate-100 dark:hover:bg-slate-850';

  return (
    <header className="h-14 bg-paper dark:bg-ink border-b border-paper-line dark:border-ink-line px-3 sm:px-4 flex items-center gap-3 shrink-0 z-40 select-none relative">
      {/* Left: scenario + live status, or breadcrumb on full pages */}
      {currentSection === 'simulator' ? (
        <div className="hidden md:flex items-center gap-4 min-w-[170px] flex-1">
          <div className="flex flex-col justify-center min-w-0 leading-tight">
            <span className="eyebrow text-slate-400 dark:text-slate-500">Scenario</span>
            <span className="font-semibold text-slate-900 dark:text-slate-50 text-sm truncate" title={currentPreset.title}>
              {currentPreset.title}
            </span>
          </div>
          <div
            data-testid="sim-status"
            className="hidden 2xl:flex items-center gap-2 h-9 pl-3 pr-3 border-l border-paper-line dark:border-ink-line text-xs text-slate-600 dark:text-slate-400 min-w-0"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isRunning ? 'bg-emerald-500 animate-pulse' : isDraining ? 'bg-sky-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
            <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200 shrink-0">t={tick}</span>
            <span className="truncate">{statusText}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => onSelectSection('simulator')}
            title="Return to Topology Canvas"
            className={`${btnBase} ${btnNeutral} px-3`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Topology Canvas</span>
          </button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{SECTION_LABEL[currentSection]}</span>
        </div>
      )}

      {/* Center: playback (simulator only) */}
      {currentSection === 'simulator' && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center h-9 bg-paper-raised dark:bg-ink-raised border border-paper-line dark:border-ink-line rounded-lg overflow-hidden">
            <button
              onClick={toggleRun}
              aria-label={isRunning ? 'Pause' : 'Run'}
              title={isRunning ? 'Pause the simulation clock (Space)' : 'Start the clock and the scenario traffic (Space)'}
              className={`h-full px-3.5 text-[13px] font-semibold flex items-center gap-1.5 transition-colors min-w-[84px] justify-center ${
                isRunning
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                  : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 hover:bg-slate-700 dark:hover:bg-white'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Run'}</span>
            </button>

            <button
              onClick={stepOnce}
              aria-label="Step"
              title="Advance exactly one tick (injects one tick of scenario traffic)"
              className="h-full px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 text-[13px] font-medium transition-colors flex items-center gap-1.5 border-l border-paper-line dark:border-ink-line"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Step</span>
            </button>

            <button
              onClick={resetCurrent}
              aria-label="Reset"
              title="Reset counters, links and queues to the scenario defaults (R)"
              className="h-full px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 text-[13px] font-medium transition-colors flex items-center gap-1.5 border-l border-paper-line dark:border-ink-line"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset</span>
            </button>

            <div className="hidden xl:flex items-center h-full border-l border-paper-line dark:border-ink-line" role="group" aria-label="Speed">
              {[0.5, 1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  title={`Speed ${s}x (${Math.max(50, Math.round(250 / s))} ms per tick)`}
                  className={`h-full min-w-[38px] px-2 text-[11px] font-mono transition-colors ${
                    speed === s
                      ? 'text-signal-600 dark:text-signal-400 font-semibold bg-signal-50 dark:bg-signal-950'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
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
            className="h-9 px-3.5 bg-signal-500 hover:bg-signal-600 text-white rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send Traffic</span>
          </button>
        </div>
      )}

      {/* Right: tools */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        {currentSection === 'simulator' && (
          <>
            <button
              onClick={toggleQoS}
              aria-label="QoS"
              title={qosEnabled ? 'QoS ON: high-priority packets are sent first' : 'QoS OFF: first-in first-out queues'}
              className={`hidden xl:flex ${btnBase} px-2.5 ${
                qosEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : btnNeutral
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>QoS {qosEnabled ? 'on' : 'off'}</span>
            </button>

            <button
              onClick={onAutoLayout}
              aria-label="Auto-Layout"
              title="Restore the tidy default node positions"
              className={`${btnBase} ${btnNeutral} px-2.5`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden 2xl:inline">Auto-Layout</span>
            </button>
          </>
        )}

        <button
          onClick={onOpenCommandPalette}
          aria-label="Search..."
          title="Search pages, devices, scenarios and actions (⌘K / Ctrl+K)"
          className={`${btnBase} ${btnNeutral} px-2.5 2xl:min-w-[140px]`}
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden 2xl:inline text-slate-500 dark:text-slate-400">Search</span>
          <kbd className="hidden 2xl:inline ml-auto px-1 text-[10.5px] text-slate-400 font-mono">⌘K</kbd>
        </button>

        <button
          onClick={toggleNerdMode}
          aria-label={isNerdMode ? 'Nerd Mode' : 'Simple Mode'}
          title={isNerdMode ? 'Nerd Mode: IPs, interfaces, link IDs and queue internals (M)' : 'Simple Mode: plain-language overview (M)'}
          className={`${btnBase} px-2.5 ${
            isNerdMode
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-slate-900 dark:border-slate-100'
              : btnNeutral
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">{isNerdMode ? 'Nerd Mode' : 'Simple Mode'}</span>
        </button>

      </div>

      {/* Send Traffic popover */}
      {showTrafficModal && currentSection === 'simulator' && (
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 bg-paper-raised dark:bg-ink-raised rounded-lg shadow-xl border border-paper-line dark:border-slate-800 p-5 w-[360px] max-w-[calc(100vw-32px)] z-50 text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-signal-500" />
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Send a packet flow</h4>
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
              <span className="text-[11px] uppercase font-semibold text-slate-400 block mb-2">Quick flows</span>
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
                className="h-9 px-4 bg-signal-500 hover:bg-signal-600 disabled:opacity-40 text-white rounded-md font-semibold text-sm transition-colors"
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
