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
  selectedDeviceId: string | null;
  selectedLinkId: string | null;
  qosEnabled: boolean;
  // Actions
  toggleRun: () => void;
  stepOnce: () => void;
  resetCurrent: () => void;
  setSpeed: (speed: number) => void;
  toggleNerdMode: () => void;
  togglePresentationMode: () => void;
  selectDevice: (id: string | null) => void;
  selectLink: (id: string | null) => void;
  toggleLinkState: (linkId: string) => void;
  sendTraffic: (source: string, destination: string, count: number, trafficClass: TrafficClass) => void;
  toggleQoS: () => void;
  activePath: string[] | null;
  updateDevicePosition: (id: string, x: number, y: number) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPreset, setCurrentPresetState] = useState<PresetConfig>(PRESETS[1]); // Default to Preset 2 Enhanced
  const engineRef = useRef<SimulationEngine>(new SimulationEngine(PRESETS[1].devices, PRESETS[1].links));
  
  const [tick, setTick] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeedState] = useState(1); // 1x = 200ms per tick
  const [isNerdMode, setIsNerdMode] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [qosEnabled, setQosEnabled] = useState(false);
  const [activePath, setActivePath] = useState<string[] | null>(null);

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
    setCurrentPresetState(target);
    setIsRunning(false);
    setSelectedDeviceId(null);
    setSelectedLinkId(null);
    setActivePath(null);

    engineRef.current.loadTopology(target.devices, target.links);
    engineRef.current.reconvergenceDelayTicks = target.reconvergenceDelayTicks;
    engineRef.current.qosEnabled = target.defaultTrafficParams?.qosEnabled ?? false;
    setQosEnabled(engineRef.current.qosEnabled);
    syncStateFromEngine();
  }, [syncStateFromEngine]);

  const toggleRun = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const stepOnce = useCallback(() => {
    setIsRunning(false);
    engineRef.current.step();
    syncStateFromEngine();
  }, [syncStateFromEngine]);

  const resetCurrent = useCallback(() => {
    setIsRunning(false);
    engineRef.current.loadTopology(currentPreset.devices, currentPreset.links);
    setActivePath(null);
    syncStateFromEngine();
  }, [currentPreset, syncStateFromEngine]);

  const toggleLinkState = useCallback((linkId: string) => {
    const link = engineRef.current.links.find(l => l.id === linkId);
    if (!link) return;
    const newState: LinkState = link.state === 'UP' ? 'DOWN' : 'UP';
    engineRef.current.setLinkState(linkId, newState);
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
  }, [syncStateFromEngine]);

  const toggleQoS = useCallback(() => {
    setQosEnabled(prev => {
      const next = !prev;
      engineRef.current.qosEnabled = next;
      return next;
    });
  }, []);

  const updateDevicePosition = useCallback((id: string, x: number, y: number) => {
    const dev = engineRef.current.devices.get(id);
    if (dev) {
      dev.position = { x, y };
      setDevices(Array.from(engineRef.current.devices.values()));
    }
  }, []);

  // Tick execution interval loop
  useEffect(() => {
    if (!isRunning) return;

    const intervalMs = Math.max(50, Math.round(250 / speed));
    const intervalId = setInterval(() => {
      engineRef.current.step();
      syncStateFromEngine();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isRunning, speed, syncStateFromEngine]);

  // Global Keyboard Shortcuts for Presentation & Lab Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        toggleRun();
      } else if (e.key === 'r' || e.key === 'R') {
        resetCurrent();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsNerdMode(prev => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPresentationMode(prev => !prev);
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
        selectedDeviceId,
        selectedLinkId,
        qosEnabled,
        toggleRun,
        stepOnce,
        resetCurrent,
        setSpeed: setSpeedState,
        toggleNerdMode: () => setIsNerdMode(prev => !prev),
        togglePresentationMode: () => setIsPresentationMode(prev => !prev),
        selectDevice: setSelectedDeviceId,
        selectLink: setSelectedLinkId,
        toggleLinkState,
        sendTraffic,
        toggleQoS,
        activePath,
        updateDevicePosition,
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
