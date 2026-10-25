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

  return (
    <div className="h-full flex flex-col bg-white text-[#172033] font-mono text-xs select-text">
      {/* Tab bar header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'console'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Console (Engine Shell)
          </button>
          <button
            onClick={() => setActiveTab('ns2')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'ns2'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            NS-2 Script & Trace View
          </button>
        </div>

        {/* Mandatory Honesty Badges */}
        <div className="flex items-center gap-2">
          {activeTab === 'console' ? (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Simulated diagnostic shell (not Cisco IOS)
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Generated NS-2 equivalent: not executed by this app
            </span>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'console' ? (
        <div className="flex-1 flex flex-col p-3 overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 font-mono text-[12px] leading-relaxed">
            {terminalLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.startsWith('campus-sim>')
                    ? 'text-blue-600 font-bold'
                    : log.includes('DOWN') || log.includes('severed') || log.includes('Unreachable')
                    ? 'text-rose-600'
                    : log.includes('UP') || log.includes('restored') || log.includes('icmp_seq')
                    ? 'text-emerald-700'
                    : 'text-slate-700 whitespace-pre-wrap'
                }
              >
                {log}
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
            <span className="text-blue-600 font-bold select-none text-[13px]">campus-sim&gt;</span>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. help, ping PC-STUD SRV-WEB, fail link L_SW1_SW4, show route SW1"
              className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[12px] font-mono text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-slate-900 text-white rounded font-sans text-xs font-medium hover:bg-slate-800 transition"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
          {/* Left Sub-view: Tcl Script */}
          <div className="flex-1 flex flex-col p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div>
                <h4 className="font-sans font-bold text-slate-800 text-xs">Generated NS-2 Simulation Script (.tcl)</h4>
                <p className="font-sans text-[11px] text-slate-500">Includes duplex links, queue limits, link-down events, and NAM hooks</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyTcl}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-sans font-medium transition"
                >
                  {copiedTcl ? '✓ Copied' : 'Copy Tcl'}
                </button>
                <button
                  onClick={handleDownloadTcl}
                  className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-sans font-medium transition"
                >
                  Download .tcl
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] text-slate-800 leading-tight select-all">
              {tclScript}
            </pre>
          </div>

          {/* Right Sub-view: NS-2 Trace File */}
          <div className="flex-1 flex flex-col p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div>
                <h4 className="font-sans font-bold text-slate-800 text-xs">Real-Time NS-2 Trace Stream (.tr)</h4>
                <p className="font-sans text-[11px] text-slate-500">12 standard trace columns mapped from live engine packets (+, -, r, d)</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyTr}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-sans font-medium transition"
                >
                  {copiedTr ? '✓ Copied' : 'Copy Trace'}
                </button>
                <button
                  onClick={handleDownloadTr}
                  className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-sans font-medium transition"
                >
                  Download .tr
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] text-slate-800 leading-tight select-all">
              {traceOutput || '# No packet transmission trace events recorded yet.\n# Run simulation or click "Send Traffic" in the top bar to populate.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
