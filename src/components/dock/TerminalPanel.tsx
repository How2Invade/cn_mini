import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { generateNS2Tcl, generateNS2Trace } from '../../simulation/ns2Generator';

export const TerminalPanel: React.FC = () => {
  const { terminalLogs, executeCommand, currentPreset, devices, links, livePackets, qosEnabled } = useSimulation();
  const [activeTab, setActiveTab] = useState<'console' | 'ns2'>('console');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copiedTcl, setCopiedTcl] = useState(false);
  const [copiedTr, setCopiedTr] = useState(false);
  
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'console') {
      consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setHistory(prev => [...prev, inputVal.trim()]);
    setHistoryIndex(-1);
    executeCommand(inputVal);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    }
  };

  // Generate NS-2 scripts deterministically
  const tclScript = generateNS2Tcl(devices, links, currentPreset.reconvergenceDelayTicks, qosEnabled);
  const traceOutput = generateNS2Trace(livePackets);

  const handleCopyTcl = () => {
    navigator.clipboard.writeText(tclScript);
    setCopiedTcl(true);
    setTimeout(() => setCopiedTcl(false), 2000);
  };

  const handleCopyTr = () => {
    navigator.clipboard.writeText(traceOutput);
    setCopiedTr(true);
    setTimeout(() => setCopiedTr(false), 2000);
  };

  const handleDownloadTcl = () => {
    const blob = new Blob([tclScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPreset.id}-simulation.tcl`;
    a.click();
  };

  const handleDownloadTr = () => {
    const blob = new Blob([traceOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPreset.id}-trace.tr`;
    a.click();
  };

  const quickCommands = [
    'ping PC-STUD SRV-WEB',
    'fail link L_SW1_SW4',
    'restore link L_SW1_SW4',
    'show route SW1',
    'show vlan',
    'qos on'
  ];

  return (
    <div className="h-full flex flex-col bg-paper-raised dark:bg-[#121315] text-slate-800 dark:text-slate-200 font-mono text-xs select-text transition-colors duration-200">
      {/* Tab bar header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-ink-raised/70">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('console')}
            className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'console'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950'
                : 'bg-paper-raised dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Console (Engine Shell)
          </button>
          <button
            onClick={() => setActiveTab('ns2')}
            className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'ns2'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950'
                : 'bg-paper-raised dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            NS-2 Script & Trace View
          </button>
        </div>

        {/* Mandatory Honesty Badges */}
        <div className="flex items-center gap-2">
          {activeTab === 'console' ? (
            <span className="text-[10px] sm:text-[11px] font-medium px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-sm bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 truncate max-w-[220px] sm:max-w-none">
              Simulated diagnostic shell (not Cisco IOS)
            </span>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-medium px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-sm bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate max-w-[220px] sm:max-w-none">
              Generated NS-2 equivalent: not executed by this app
            </span>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'console' ? (
        <div className="flex-1 flex flex-col p-3 overflow-hidden bg-paper-raised dark:bg-[#121315]">
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 font-mono text-[12px] leading-relaxed">
            {terminalLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.startsWith('campus-sim>')
                    ? 'text-blue-600 dark:text-emerald-400 font-semibold'
                    : log.includes('DOWN') || log.includes('severed') || log.includes('Unreachable')
                    ? 'text-rose-600 dark:text-rose-400 font-medium'
                    : log.includes('UP') || log.includes('restored') || log.includes('icmp_seq')
                    ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                    : 'text-slate-700 dark:text-slate-300 whitespace-pre-wrap'
                }
              >
                {log}
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>

          {/* Quick command buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1 text-[11px]">Quick:</span>
            {quickCommands.map(qc => (
              <button
                key={qc}
                onClick={() => executeCommand(qc)}
                className="h-8 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 font-mono text-xs transition"
              >
                {qc}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <span className="text-blue-600 dark:text-emerald-400 font-semibold select-none text-sm">campus-sim&gt;</span>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. help, ping PC-STUD SRV-WEB, fail link L_SW1_SW4, show route SW1"
              className="flex-1 h-10 bg-slate-50 dark:bg-ink-raised border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="h-10 px-5 bg-signal-500 text-white rounded-md font-sans text-sm font-semibold hover:bg-signal-600 transition-colors shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 bg-paper-raised dark:bg-[#121315]">
          {/* Left Sub-view: Tcl Script */}
          <div className="flex-1 flex flex-col p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <div>
                <h4 className="font-sans font-semibold text-slate-800 dark:text-white text-xs sm:text-sm">Generated NS-2 Simulation Script (.tcl)</h4>
                <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400">Includes duplex links, queue limits, link-down events, and NAM hooks</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTcl}
                  className="h-9 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-sans font-semibold transition"
                >
                  {copiedTcl ? '✓ Copied' : 'Copy Tcl'}
                </button>
                <button
                  onClick={handleDownloadTcl}
                  className="h-9 px-3.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-sans font-semibold transition"
                >
                  Download .tcl
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto bg-slate-50 dark:bg-ink-raised p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200 leading-tight select-all">
              {tclScript}
            </pre>
          </div>

          {/* Right Sub-view: NS-2 Trace File */}
          <div className="flex-1 flex flex-col p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <div>
                <h4 className="font-sans font-semibold text-slate-800 dark:text-white text-xs">Real-Time NS-2 Trace Stream (.tr)</h4>
                <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400">12 standard trace columns mapped from live engine packets (+, -, r, d)</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyTr}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-sans font-medium transition"
                >
                  {copiedTr ? '✓ Copied' : 'Copy Trace'}
                </button>
                <button
                  onClick={handleDownloadTr}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] font-sans font-medium transition"
                >
                  Download .tr
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto bg-slate-50 dark:bg-ink-raised p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200 leading-tight select-all">
              {traceOutput || '# No packet transmission trace events recorded yet.\n# Run simulation or click "Send Traffic" in the top bar to populate.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
