import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Play, Pause, SkipForward, RotateCcw, Send, Sliders, Shield } from 'lucide-react';
import { TrafficClass } from '../simulation/types';

export const ControlPanel: React.FC = () => {
  const {
    isRunning,
    speed,
    tick,
    toggleRun,
    stepOnce,
    resetCurrent,
    setSpeed,
    sendTraffic,
    devices,
    qosEnabled,
    toggleQoS,
  } = useSimulation();

  const [sourceId, setSourceId] = useState('PC-STUD');
  const [destId, setDestId] = useState('SRV-WEB');
  const [count, setCount] = useState(5);
  const [trafficClass, setTrafficClass] = useState<TrafficClass>('CLASS_BEST_EFFORT');

  const handleSend = () => {
    sendTraffic(sourceId, destId, count, trafficClass);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Simulation Timeline Controls */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={toggleRun}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all text-white ${
            isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Run Simulation'}</span>
        </button>

        <button
          onClick={stepOnce}
          disabled={isRunning}
          className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-all"
          title="Step 1 Tick"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={resetCurrent}
          className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
          title="Reset Topology & Metrics"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
          <Sliders className="w-3.5 h-3.5 text-slate-400 ml-1" />
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                speed === s ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="px-3 py-1 bg-slate-100 rounded-lg font-mono text-xs text-slate-700 font-semibold border border-slate-200">
          Tick: {tick}
        </div>
      </div>

      {/* Traffic Generator Controls */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">From:</span>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-medium"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} ({d.name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">To:</span>
          <select
            value={destId}
            onChange={(e) => setDestId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-medium"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} ({d.name})
              </option>
            ))}
          </select>
        </div>

        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
        >
          <option value={1}>1 Pkt</option>
          <option value={5}>5 Pkts</option>
          <option value={15}>15 Pkts</option>
          <option value={30}>30 Pkts</option>
        </select>

        <select
          value={trafficClass}
          onChange={(e) => setTrafficClass(e.target.value as TrafficClass)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
        >
          <option value="CLASS_BEST_EFFORT">Bulk (Best Effort)</option>
          <option value="CLASS_HIGH">Voice/LMS (High Priority)</option>
        </select>

        <button
          onClick={toggleQoS}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 border transition-all ${
            qosEnabled
              ? 'bg-purple-50 text-purple-700 border-purple-300 font-bold'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
          }`}
          title="Toggle Strict Priority QoS"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>QoS: {qosEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <button
          onClick={handleSend}
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Inject Traffic</span>
        </button>
      </div>
    </div>
  );
};
