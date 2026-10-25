import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { SimulationEngine } from '../simulation/engine';
import { PRESETS } from '../simulation/presets';
import {
  PresetConfig,
  Device,
  NetworkLink,
  Packet,
  SimulationMetrics,
  SimulationEvent,
  TrafficClass,
  LinkState
} from '../simulation/types';

interface SimulationContextType {
  currentPreset: PresetConfig;
  setPreset: (presetId: string) => void;
  devices: Device[];
  links: NetworkLink[];
  metrics: SimulationMetrics;
  events: SimulationEvent[];
  livePackets: Packet[];
  tick: number;
  isRunning: boolean;
  speed: number;
  isNerdMode: boolean;
  isPresentationMode: boolean;
  isDarkMode: boolean;
  selectedDeviceId: string | null;
  selectedLinkId: string | null;
  qosEnabled: boolean;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  // Actions
  toggleRun: () => void;
  stepOnce: () => void;
  resetCurrent: () => void;
  setSpeed: (speed: number) => void;
  toggleNerdMode: () => void;
  togglePresentationMode: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  selectDevice: (id: string | null) => void;
  selectLink: (id: string | null) => void;
  toggleLinkState: (linkId: string) => void;
  updateLinkCost: (linkId: string, newCost: number) => void;
  sendTraffic: (source: string, destination: string, count: number, trafficClass: TrafficClass) => void;
  toggleQoS: () => void;
  activePath: string[] | null;
  updateDevicePosition: (id: string, x: number, y: number) => void;
  terminalLogs: string[];
  executeCommand: (cmd: string) => string;
  autoLayoutPreset: () => void;
  play: () => void;
  pause: () => void;
  isDraining: boolean;
  requestedDockTab: DockRequest | null;
  openDockTab: (tab: DockRequest) => void;
  clearDockRequest: () => void;
}

export type DockRequest = 'analytics' | 'terminal' | 'packet_lane' | 'event_log';

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPreset, setCurrentPresetState] = useState<PresetConfig>(PRESETS[1]); // Default to Preset 2 Enhanced
  const engineRef = useRef<SimulationEngine>(new SimulationEngine(PRESETS[1].devices, PRESETS[1].links));
  
  const [tick, setTick] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeedState] = useState(1); // 1x = 200ms per tick
  const [isNerdMode, setIsNerdMode] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cn_theme');
      if (saved) return saved === 'dark';
      return true; // default to modern dark mode inspired by tasklab/fintech
    }
    return true;
  });
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [qosEnabled, setQosEnabled] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activePath, setActivePath] = useState<string[] | null>(null);
  // When paused and the user sends manual traffic, the engine keeps ticking
  // (without background workload) until those packets are delivered/dropped.
  const [isDraining, setIsDraining] = useState(false);
  const [requestedDockTab, setRequestedDockTab] = useState<DockRequest | null>(null);
  const presetRef = useRef<PresetConfig>(PRESETS[1]);
  useEffect(() => { presetRef.current = currentPreset; }, [currentPreset]);
  const isRunningRef = useRef(false);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  // Sync dark class with document element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cn_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('cn_theme', 'light');
      }
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setIsDarkMode(theme === 'dark');
  }, []);

  const [metrics, setMetrics] = useState<SimulationMetrics>(() => engineRef.current.getMetrics());
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [livePackets, setLivePackets] = useState<Packet[]>([]);
  const [devices, setDevices] = useState<Device[]>(() => Array.from(engineRef.current.devices.values()));
  const [links, setLinks] = useState<NetworkLink[]>(() => engineRef.current.links);

  const syncStateFromEngine = useCallback(() => {
    setTick(engineRef.current.tick);
    setMetrics(engineRef.current.getMetrics());
    setEvents([...engineRef.current.events]);
    setLivePackets([...engineRef.current.recentPackets]);
    setDevices(Array.from(engineRef.current.devices.values()));
    setLinks([...engineRef.current.links]);
  }, []);

  const setPreset = useCallback((presetId: string) => {
    const target = PRESETS.find(p => p.id === presetId) || PRESETS[1];
    presetRef.current = target;
    setCurrentPresetState(target);
    setIsRunning(false);
    setIsDraining(false);
    setSelectedDeviceId(null);
    setSelectedLinkId(null);
    setActivePath(null);

    engineRef.current.loadTopology(target.devices, target.links);
    engineRef.current.reconvergenceDelayTicks = target.reconvergenceDelayTicks;
    engineRef.current.qosEnabled = target.defaultTrafficParams?.qosEnabled ?? false;
    setQosEnabled(engineRef.current.qosEnabled);
    syncStateFromEngine();
  }, [syncStateFromEngine]);

  /**
   * One "scenario tick": inject the preset's deterministic workload
   * (rate packets from source to destination), then advance the engine.
   */
  const runScenarioTick = useCallback(() => {
    const preset = presetRef.current;
    const p = preset.defaultTrafficParams;
    if (p) {
      const created = engineRef.current.injectScenarioTraffic({
        source: p.source,
        destination: p.destination,
        rate: p.rate,
        trafficClass: p.trafficClass,
        mixClasses: preset.id === 'preset-6-congestion-qos',
      });
      const routed = created.find(pkt => pkt.path.length > 1);
      if (routed) setActivePath(routed.path);
    }
    engineRef.current.step();
    syncStateFromEngine();
  }, [syncStateFromEngine]);

  const play = useCallback(() => {
    setIsDraining(false);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsDraining(false);
  }, []);

  const toggleRun = useCallback(() => {
    setIsDraining(false);
    setIsRunning(prev => !prev);
  }, []);

  const stepOnce = useCallback(() => {
    setIsRunning(false);
    setIsDraining(false);
    runScenarioTick();
  }, [runScenarioTick]);

  const resetCurrent = useCallback(() => {
    const preset = presetRef.current;
    setIsRunning(false);
    setIsDraining(false);
    engineRef.current.loadTopology(preset.devices, preset.links);
    engineRef.current.reconvergenceDelayTicks = preset.reconvergenceDelayTicks;
    engineRef.current.qosEnabled = preset.defaultTrafficParams?.qosEnabled ?? false;
    setQosEnabled(engineRef.current.qosEnabled);
    setActivePath(null);
    syncStateFromEngine();
  }, [syncStateFromEngine]);

  const toggleLinkState = useCallback((linkId: string) => {
    const link = engineRef.current.links.find(l => l.id === linkId);
    if (!link) return;
    const newState: LinkState = link.state === 'UP' ? 'DOWN' : 'UP';
    engineRef.current.setLinkState(linkId, newState);
    syncStateFromEngine();
  }, [syncStateFromEngine]);

  const updateLinkCost = useCallback((linkId: string, newCost: number) => {
    engineRef.current.setLinkCost(linkId, newCost);
    syncStateFromEngine();
  }, [syncStateFromEngine]);

  const sendTraffic = useCallback((
    source: string,
    destination: string,
    count: number,
    trafficClass: TrafficClass
  ) => {
    let lastPath: string[] | null = null;
    for (let i = 0; i < count; i++) {
      const pkt = engineRef.current.sendPacket(source, destination, trafficClass);
      if (pkt && pkt.path.length > 0) {
        lastPath = pkt.path;
      }
    }
    setActivePath(lastPath);
    syncStateFromEngine();
    // If the clock is paused, keep ticking until these packets settle so the
    // user actually sees them travel instead of sitting in a queue forever.
    if (!isRunningRef.current) setIsDraining(true);
  }, [syncStateFromEngine]);

  const toggleQoS = useCallback(() => {
    setQosEnabled(prev => {
      const next = !prev;
      engineRef.current.qosEnabled = next;
      return next;
    });
  }, []);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Smart Adaptive Campus Network Simulator diagnostic shell initialized.',
    'Engine ready. Type "help" for available commands.',
    'Preset loaded: ' + PRESETS[1].title
  ]);

  const echoCommand = useCallback((cmd: string) => {
    setTerminalLogs(prev => [...prev.slice(-300), `campus-sim> ${cmd}`]);
  }, []);

  const executeCommand = useCallback((rawCmd: string): string => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return '';
    echoCommand(trimmed);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const appendLog = (msg: string) => {
      setTerminalLogs(prev => [...prev.slice(-300), msg]);
      return msg;
    };

    switch (cmd) {
      case 'help':
        return appendLog(
          'Available commands:\n' +
          '  run / pause / reset\n' +
          '  step\n' +
          '  preset <id> (e.g. preset preset-1-baseline, preset preset-2-enhanced)\n' +
          '  send <src> <dst> [count] [class: CLASS_BEST_EFFORT|CLASS_HIGH]\n' +
          '  fail link <linkId>  /  restore link <linkId>\n' +
          '  ping <src> <dst>\n' +
          '  traceroute <src> <dst>\n' +
          '  show route <deviceId>\n' +
          '  show links\n' +
          '  show queue <linkId>\n' +
          '  show vlan\n' +
          '  show metrics\n' +
          '  qos on|off\n' +
          '  export json\n' +
          '  clear'
        );

      case 'run':
        setIsRunning(true);
        return appendLog('Simulation loop started.');

      case 'pause':
        setIsRunning(false);
        return appendLog('Simulation paused.');

      case 'reset':
        resetCurrent();
        return appendLog('Simulation topology and counters reset to current preset.');

      case 'step':
        stepOnce();
        return appendLog(`Stepped engine to tick ${engineRef.current.tick}.`);

      case 'preset': {
        const pId = args[0];
        const match = PRESETS.find(p => p.id.toLowerCase() === pId?.toLowerCase() || p.title.toLowerCase().includes(pId?.toLowerCase() || ''));
        if (match) {
          setPreset(match.id);
          return appendLog(`Loaded preset: ${match.title}`);
        }
        return appendLog(`Preset not found: ${pId}. Valid presets: ${PRESETS.map(p => p.id).join(', ')}`);
      }

      case 'fail':
        if (args[0] === 'link') {
          const lId = args[1];
          const link = engineRef.current.links.find(l => l.id.toLowerCase() === lId?.toLowerCase());
          if (link) {
            engineRef.current.setLinkState(link.id, 'DOWN');
            syncStateFromEngine();
            return appendLog(`Link ${link.id} state set to DOWN (severed).`);
          }
          return appendLog(`Link ${lId} not found.`);
        }
        return appendLog('Usage: fail link <linkId>');

      case 'restore':
        if (args[0] === 'link') {
          const lId = args[1];
          const link = engineRef.current.links.find(l => l.id.toLowerCase() === lId?.toLowerCase());
          if (link) {
            engineRef.current.setLinkState(link.id, 'UP');
            syncStateFromEngine();
            return appendLog(`Link ${link.id} state set to UP (restored).`);
          }
          return appendLog(`Link ${lId} not found.`);
        }
        return appendLog('Usage: restore link <linkId>');

      case 'send': {
        const src = args[0];
        const dst = args[1];
        const count = parseInt(args[2] || '1', 10);
        const trafficClass: TrafficClass = args[3]?.toUpperCase().includes('HIGH') ? 'CLASS_HIGH' : 'CLASS_BEST_EFFORT';
        if (!src || !dst) {
          return appendLog('Usage: send <src> <dst> [count] [class]');
        }
        sendTraffic(src, dst, count, trafficClass);
        return appendLog(`Dispatched ${count} packet(s) [${trafficClass}] from ${src} to ${dst}.`);
      }

      case 'ping': {
        const src = args[0];
        const dst = args[1];
        if (!src || !dst) return appendLog('Usage: ping <src> <dst>');
        const devSrc = engineRef.current.devices.get(src);
        const devDst = engineRef.current.devices.get(dst);
        if (!devSrc || !devDst) return appendLog(`Device not found: ${!devSrc ? src : dst}`);
        const res = engineRef.current.sendPacket(src, dst, 'CLASS_BEST_EFFORT');
        if (!isRunningRef.current) setIsDraining(true);
        if (!res || !res.path || res.path.length === 0 || res.status === 'dropped') {
          return appendLog(`PING ${dst} (${devDst.ip || '0.0.0.0'}): Destination Host Unreachable. 100% packet loss.`);
        }
        const latencyMs = (res.path.length - 1) * 4.2 + (engineRef.current.pseudoRandom() * 1.5);
        return appendLog(`64 bytes from ${devDst.ip || '0.0.0.0'}: icmp_seq=1 ttl=64 time=${latencyMs.toFixed(2)} ms (hops: ${res.path.join(' -> ')})`);
      }

      case 'traceroute': {
        const src = args[0];
        const dst = args[1];
        if (!src || !dst) return appendLog('Usage: traceroute <src> <dst>');
        const devSrc = engineRef.current.devices.get(src);
        const devDst = engineRef.current.devices.get(dst);
        if (!devSrc || !devDst) return appendLog(`Device not found: ${!devSrc ? src : dst}`);
        const res = engineRef.current.sendPacket(src, dst, 'CLASS_BEST_EFFORT');
        if (!isRunningRef.current) setIsDraining(true);
        if (!res || !res.path || res.path.length === 0) return appendLog(`traceroute: no route from ${src} to ${dst}`);
        let output = `traceroute to ${dst} (${devDst.ip || '0.0.0.0'}), 30 hops max:\n`;
        res.path.forEach((nodeId: string, idx: number) => {
          const dev = engineRef.current.devices.get(nodeId);
          output += ` ${idx + 1}  ${nodeId} (${dev?.ip || '0.0.0.0'})  ${((idx + 1) * 3.5).toFixed(2)} ms\n`;
        });
        return appendLog(output.trimEnd());
      }

      case 'show': {
        const sub = args[0]?.toLowerCase();
        if (sub === 'route') {
          const devId = args[1];
          if (!devId) return appendLog('Usage: show route <deviceId>');
          const dev = engineRef.current.devices.get(devId);
          if (!dev) return appendLog(`Device ${devId} not found.`);
          let tbl = `Routing Table for ${dev.name} (${dev.type}):\n`;
          tbl += 'Destination        Gateway          Interface    Protocol\n';
          tbl += '----------------------------------------------------------\n';
          engineRef.current.devices.forEach(target => {
            if (target.id === devId) return;
            tbl += `${(target.ip || target.id).padEnd(18)} ${(target.gateway || 'Direct').padEnd(16)} Gi0/1        OSPF\n`;
          });
          return appendLog(tbl);
        }
        if (sub === 'links') {
          let out = 'Interface / Link Summary Table:\n';
          out += 'Link ID           Source -> Target    State   Queue   Cost\n';
          out += '--------------------------------------------------------------------\n';
          engineRef.current.links.forEach(l => {
            out += `${l.id.padEnd(17)} ${(l.source + ' -> ' + l.target).padEnd(20)} ${l.state.padEnd(7)} ${(l.queue.length + '/' + l.queueLimit).padEnd(7)} ${l.cost}\n`;
          });
          return appendLog(out);
        }
        if (sub === 'queue') {
          const linkId = args[1];
          if (!linkId) return appendLog('Usage: show queue <linkId>');
          const l = engineRef.current.links.find(x => x.id.toLowerCase() === linkId.toLowerCase());
          if (!l) return appendLog(`Link ${linkId} not found.`);
          return appendLog(`Queue for ${l.id}: ${l.queue.length}/${l.queueLimit} packets (${Math.round((l.queue.length / l.queueLimit) * 100)}% capacity)`);
        }
        if (sub === 'vlan') {
          let vlanOut = 'VLAN Database / Subnet Allocation:\n';
          vlanOut += 'VLAN ID  Name            Subnet           Gateway\n';
          vlanOut += '--------------------------------------------------\n';
          vlanOut += 'VLAN 10  Management      192.168.10.0/24  192.168.10.1\n';
          vlanOut += 'VLAN 20  Faculty/Staff   192.168.20.0/24  192.168.20.1\n';
          vlanOut += 'VLAN 30  Student Labs    192.168.30.0/24  192.168.30.1\n';
          vlanOut += 'VLAN 40  Campus Web/Srv  192.168.40.0/24  192.168.40.1\n';
          return appendLog(vlanOut);
        }
        if (sub === 'metrics') {
          const m = engineRef.current.getMetrics();
          const activeL = engineRef.current.links.filter(l => l.state === 'UP').length;
          return appendLog(
            `Metrics Summary at Tick ${engineRef.current.tick}:\n` +
            `  Packets Generated: ${m.generated}\n` +
            `  Packets Delivered: ${m.delivered}\n` +
            `  Packets Dropped:   ${m.dropped}\n` +
            `  Delivery Ratio:    ${m.deliveryPercentage.toFixed(1)}%\n` +
            `  Loss Ratio:        ${m.lossPercentage.toFixed(1)}%\n` +
            `  In Flight:         ${m.inFlight}\n` +
            `  Active Links:      ${activeL}/${engineRef.current.links.length}`
          );
        }
        return appendLog('Usage: show [route <device> | links | queue <link> | vlan | metrics]');
      }

      case 'qos':
        if (args[0] === 'on') {
          engineRef.current.qosEnabled = true;
          setQosEnabled(true);
          return appendLog('Quality of Service (QoS) Priority Queueing: ENABLED');
        } else if (args[0] === 'off') {
          engineRef.current.qosEnabled = false;
          setQosEnabled(false);
          return appendLog('Quality of Service (QoS) Priority Queueing: DISABLED (FIFO mode)');
        }
        return appendLog('Usage: qos on|off');

      case 'export': {
        const fmt = args[0]?.toLowerCase();
        if (fmt === 'json') {
          const blob = new Blob([JSON.stringify(engineRef.current.getMetrics(), null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `simulation-metrics-tick-${engineRef.current.tick}.json`;
          a.click();
          return appendLog('Exported engine metrics to JSON.');
        }
        return appendLog('Usage: export json (for NS-2 Tcl and trace, use NS-2 view tab buttons)');
      }

      case 'speed': {
        const val = parseFloat(args[0]);
        if (!isNaN(val) && val > 0) {
          setSpeedState(val);
          return appendLog(`Simulation playback speed set to ${val}x.`);
        }
        return appendLog('Usage: speed <multiplier> (e.g. speed 0.5, speed 1, speed 2, speed 5)');
      }

      case 'cost': {
        const lId = args[0];
        const val = parseInt(args[1], 10);
        if (!lId || isNaN(val)) return appendLog('Usage: cost <linkId> <newMetricCost>');
        updateLinkCost(lId, val);
        return appendLog(`Link ${lId} metric cost updated to ${val}. Dijkstra shortest path recalculated.`);
      }

      case 'theme': {
        const mode = args[0]?.toLowerCase();
        if (mode === 'dark') {
          setIsDarkMode(true);
          return appendLog('Theme switched to Dark mode.');
        } else if (mode === 'light') {
          setIsDarkMode(false);
          return appendLog('Theme switched to Light mode.');
        } else {
          setIsDarkMode(prev => !prev);
          return appendLog('Toggled UI theme.');
        }
      }

      case 'clear':
        setTerminalLogs(['Screen cleared. Type "help" for commands.']);
        return '';

      default:
        return appendLog(`Unknown command: "${cmd}". Type "help" for syntax.`);
    }
  }, [echoCommand, resetCurrent, stepOnce, setPreset, syncStateFromEngine, sendTraffic]);

  const updateDevicePosition = useCallback((id: string, x: number, y: number) => {
    const dev = engineRef.current.devices.get(id);
    if (dev) {
      dev.position = { x, y };
      setDevices(Array.from(engineRef.current.devices.values()));
    }
  }, []);

  const autoLayoutPreset = useCallback(() => {
    // Reset positions to default preset positions cleanly
    currentPreset.devices.forEach(defaultDev => {
      const dev = engineRef.current.devices.get(defaultDev.id);
      if (dev) {
        dev.position = { ...defaultDev.position };
      }
    });
    setDevices(Array.from(engineRef.current.devices.values()));
    echoCommand('topology auto-layout applied');
  }, [currentPreset, echoCommand]);

  // Tick execution interval loop.
  // Running  -> each tick injects the preset workload and advances the engine.
  // Draining -> paused, but manually-sent packets are still in flight: advance
  //             the engine (no new workload) until they are delivered/dropped.
  useEffect(() => {
    if (!isRunning && !isDraining) return;

    const intervalMs = Math.max(50, Math.round(250 / speed));
    let drainTicks = 0;
    const intervalId = setInterval(() => {
      if (isRunning) {
        runScenarioTick();
        return;
      }
      engineRef.current.step();
      syncStateFromEngine();
      const m = engineRef.current.getMetrics();
      drainTicks++;
      if (m.inFlight <= 0 || drainTicks > 100) setIsDraining(false);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isRunning, isDraining, speed, runScenarioTick, syncStateFromEngine]);

  // Global Keyboard Shortcuts for Presentation & Lab Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleRun();
      } else if (e.key === 'r' || e.key === 'R') {
        resetCurrent();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsNerdMode(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsPresentationMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRun, resetCurrent]);

  return (
    <SimulationContext.Provider
      value={{
        currentPreset,
        setPreset,
        devices,
        links,
        metrics,
        events,
        livePackets,
        tick,
        isRunning,
        speed,
        isNerdMode,
        isPresentationMode,
        isDarkMode,
        selectedDeviceId,
        selectedLinkId,
        qosEnabled,
        isCopilotOpen,
        setIsCopilotOpen,
        toggleRun,
        stepOnce,
        resetCurrent,
        setSpeed: setSpeedState,
        toggleNerdMode: () => setIsNerdMode(prev => !prev),
        togglePresentationMode: () => setIsPresentationMode(prev => !prev),
        toggleTheme,
        setTheme,
        selectDevice: (id: string | null) => {
          setSelectedDeviceId(id);
          if (id) setSelectedLinkId(null);
        },
        selectLink: (id: string | null) => {
          setSelectedLinkId(id);
          if (id) setSelectedDeviceId(null);
        },
        toggleLinkState,
        updateLinkCost,
        sendTraffic,
        toggleQoS,
        activePath,
        updateDevicePosition,
        terminalLogs,
        executeCommand,
        autoLayoutPreset,
        play,
        pause,
        isDraining,
        requestedDockTab,
        openDockTab: setRequestedDockTab,
        clearDockRequest: () => setRequestedDockTab(null),
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
};


