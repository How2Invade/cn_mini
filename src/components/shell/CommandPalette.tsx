import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { PRESETS } from '../../simulation/presets';
import { RailSection } from './LeftRail';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  LayoutGrid,
  Sun,
  Moon,
  Shield,
  Zap,
  Compass,
  Activity,
  Terminal,
  Radio,
  Scale,
  BookOpen,
  HelpCircle,
  Search,
  Layers,
  Server,
  ArrowRight
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: RailSection) => void;
  onOpenDockTab: (tab: 'analytics' | 'terminal' | 'packet_lane' | 'event_log') => void;
}

interface PaletteItem {
  id: string;
  category: 'Navigation' | 'Dock' | 'Scenario' | 'Device' | 'Action';
  title: string;
  subtitle?: string;
  keywords: string[];
  icon: React.ReactNode;
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  onOpenDockTab
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    devices,
    setPreset,
    isRunning,
    toggleRun,
    stepOnce,
    resetCurrent,
    autoLayoutPreset,
    toggleTheme,
    isDarkMode,
    toggleQoS,
    qosEnabled,
    setSpeed,
    selectDevice
  } = useSimulation();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global window shortcut listener for Escape and Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Build the complete list of searchable items
  const allItems: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [
      // Navigation Pages
      {
        id: 'nav-simulator',
        category: 'Navigation',
        title: 'Topology Canvas',
        subtitle: 'Interactive campus network diagram with real-time packet flow',
        keywords: ['canvas', 'topology', 'network', 'diagram', 'home', 'main', 'map'],
        icon: <Layers className="w-4 h-4 text-blue-500" />,
        run: () => {
          onSelectSection('simulator');
          onClose();
        }
      },
      {
        id: 'nav-terminal',
        category: 'Dock',
        title: 'Terminal & NS-2 Generator',
        subtitle: 'Simulated diagnostic shell (campus-sim>) & NS-2 Tcl script / trace export',
        keywords: ['terminal', 'ns2', 'ns-2', 'shell', 'cli', 'console', 'tcl', 'trace', 'ping', 'command'],
        icon: <Terminal className="w-4 h-4 text-emerald-500" />,
        run: () => {
          onOpenDockTab('terminal');
          onClose();
        }
      },
      {
        id: 'nav-analytics',
        category: 'Dock',
        title: 'Analytics Bento Grid',
        subtitle: 'Delivery ratio, packet loss %, link utilization & real-time inspection table',
        keywords: ['analytics', 'metrics', 'bento', 'charts', 'graphs', 'loss', 'throughput', 'kpi'],
        icon: <Activity className="w-4 h-4 text-indigo-500" />,
        run: () => {
          onOpenDockTab('analytics');
          onClose();
        }
      },
      {
        id: 'nav-packetlane',
        category: 'Dock',
        title: 'Packet Flow Lanes',
        subtitle: 'Real-time multi-hop visual packet queues and hop-by-hop transit status',
        keywords: ['packet', 'lane', 'queue', 'transit', 'flow', 'hops'],
        icon: <Radio className="w-4 h-4 text-cyan-500" />,
        run: () => {
          onOpenDockTab('packet_lane');
          onClose();
        }
      },
      {
        id: 'nav-compare',
        category: 'Navigation',
        title: 'Architectural Comparison',
        subtitle: 'Single-core baseline (Varne paper) vs. Fault-tolerant dual-core (Demian)',
        keywords: ['compare', 'comparison', 'baseline', 'enhanced', 'difference', 'paper', 'architecture'],
        icon: <Scale className="w-4 h-4 text-amber-500" />,
        run: () => {
          onSelectSection('comparison');
          onClose();
        }
      },
      {
        id: 'nav-research',
        category: 'Navigation',
        title: 'Research & Attribution',
        subtitle: 'Academic citations, DOI links (Varne et al. 2023), and Anton Demian repository',
        keywords: ['research', 'attribution', 'paper', 'citation', 'zenodo', 'demian', 'academic', 'author'],
        icon: <BookOpen className="w-4 h-4 text-rose-500" />,
        run: () => {
          onSelectSection('research');
          onClose();
        }
      },
      {
        id: 'nav-faq',
        category: 'Navigation',
        title: 'Frequently Asked Questions (FAQ)',
        subtitle: 'Answers on discrete-event mechanics, OSPF, HSRP, packet drops, and limitations',
        keywords: ['faq', 'questions', 'help', 'viva', 'guide', 'explain', 'how it works', 'answers'],
        icon: <HelpCircle className="w-4 h-4 text-purple-500" />,
        run: () => {
          onSelectSection('faq');
          onClose();
        }
      },
      {
        id: 'nav-tour',
        category: 'Navigation',
        title: 'Guided Scenario Lab Tour',
        subtitle: 'Step-by-step walkthrough: normal traffic, link failure, drop, reconvergence',
        keywords: ['tour', 'demo', 'guide', 'walkthrough', 'step', 'scenario'],
        icon: <Compass className="w-4 h-4 text-teal-500" />,
        run: () => {
          onSelectSection('demo');
          onClose();
        }
      },

      // Simulation Actions
      {
        id: 'act-run',
        category: 'Action',
        title: isRunning ? 'Pause Simulation Clock' : 'Run Simulation Clock',
        subtitle: isRunning ? 'Halt simulation ticks and packet generation' : 'Start discrete-event ticks and packet generator',
        keywords: ['run', 'play', 'pause', 'start', 'stop', 'resume'],
        icon: isRunning ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />,
        run: () => {
          toggleRun();
          onClose();
        }
      },
      {
        id: 'act-step',
        category: 'Action',
        title: 'Step 1 Tick Forward',
        subtitle: 'Advance discrete time by exactly 1 tick and process in-flight packets',
        keywords: ['step', 'tick', 'forward', 'next', 'single'],
        icon: <SkipForward className="w-4 h-4 text-blue-500" />,
        run: () => {
          stepOnce();
          onClose();
        }
      },
      {
        id: 'act-reset',
        category: 'Action',
        title: 'Reset Network & Counters',
        subtitle: 'Clear all active packets, revert link cuts, and restart metrics from Tick 0',
        keywords: ['reset', 'restart', 'clear', 'zero', 'revert'],
        icon: <RotateCcw className="w-4 h-4 text-slate-500" />,
        run: () => {
          resetCurrent();
          onClose();
        }
      },
      {
        id: 'act-autolayout',
        category: 'Action',
        title: 'Auto-Layout Topology Nodes',
        subtitle: 'Reset node positions to clean hierarchical tiers (Routers -> Core -> Dist -> Access -> Hosts)',
        keywords: ['layout', 'auto-layout', 'align', 'tidy', 'position', 'clean'],
        icon: <LayoutGrid className="w-4 h-4 text-slate-500" />,
        run: () => {
          onSelectSection('simulator');
          autoLayoutPreset();
          onClose();
        }
      },
      {
        id: 'act-qos',
        category: 'Action',
        title: qosEnabled ? 'Disable Quality of Service (QoS)' : 'Enable Quality of Service (QoS)',
        subtitle: qosEnabled ? 'Revert to standard FIFO DropTail queueing' : 'Enable strict-priority scheduler for Voice/LMS packets',
        keywords: ['qos', 'priority', 'quality of service', 'voip', 'queue'],
        icon: <Shield className="w-4 h-4 text-emerald-500" />,
        run: () => {
          toggleQoS();
          onClose();
        }
      },
      {
        id: 'act-theme',
        category: 'Action',
        title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        subtitle: 'Toggle between clean slate-light and dark-obsidian theme',
        keywords: ['theme', 'dark', 'light', 'mode', 'color'],
        icon: isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />,
        run: () => {
          toggleTheme();
          onClose();
        }
      },
      {
        id: 'act-speed-1x',
        category: 'Action',
        title: 'Set Speed: 1x (Normal)',
        subtitle: '250ms per simulation tick',
        keywords: ['speed', 'normal', '1x', 'playback'],
        icon: <Zap className="w-4 h-4 text-slate-500" />,
        run: () => {
          setSpeed(1);
          onClose();
        }
      },
      {
        id: 'act-speed-2x',
        category: 'Action',
        title: 'Set Speed: 2x (Fast)',
        subtitle: '125ms per simulation tick',
        keywords: ['speed', 'fast', '2x'],
        icon: <Zap className="w-4 h-4 text-amber-500" />,
        run: () => {
          setSpeed(2);
          onClose();
        }
      },
      {
        id: 'act-speed-5x',
        category: 'Action',
        title: 'Set Speed: 5x (Turbo)',
        subtitle: '50ms per simulation tick for rapid stress-testing',
        keywords: ['speed', 'turbo', '5x', 'fastest'],
        icon: <Zap className="w-4 h-4 text-rose-500" />,
        run: () => {
          setSpeed(5);
          onClose();
        }
      }
    ];

    // Add all Presets
    PRESETS.forEach(p => {
      list.push({
        id: `preset-${p.id}`,
        category: 'Scenario',
        title: p.title,
        subtitle: p.description,
        keywords: ['preset', 'scenario', p.id, p.badge, ...p.title.toLowerCase().split(' ')],
        icon: <Layers className="w-4 h-4 text-emerald-500" />,
        run: () => {
          onSelectSection('simulator');
          setPreset(p.id);
          onClose();
        }
      });
    });

    // Add all current Devices
    devices.forEach(d => {
      list.push({
        id: `device-${d.id}`,
        category: 'Device',
        title: `${d.name} (${d.id})`,
        subtitle: `Type: ${d.type.toUpperCase()} · IP: ${d.ip || 'Unnumbered'} · VLAN: ${d.vlan || 'Trunk'}`,
        keywords: ['device', 'node', d.id.toLowerCase(), d.name.toLowerCase(), d.type, d.ip || ''],
        icon: <Server className="w-4 h-4 text-blue-500" />,
        run: () => {
          onSelectSection('simulator');
          selectDevice(d.id);
          onClose();
        }
      });
    });

    return list;
  }, [devices, isRunning, qosEnabled, isDarkMode, onSelectSection, onOpenDockTab, onClose, toggleRun, stepOnce, resetCurrent, autoLayoutPreset, toggleQoS, toggleTheme, setSpeed, setPreset, selectDevice]);

  // Filter based on search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 15);

    return allItems.filter(item => {
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.subtitle && item.subtitle.toLowerCase().includes(q)) return true;
      if (item.keywords.some(k => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [allItems, query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].run();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50 p-4 transition-all"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200/80 dark:border-slate-800 flex items-center gap-3 bg-[#FAF9F5] dark:bg-[#0B0F19] shrink-0">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, page, NS-2 terminal, scenario, or device (e.g. SW1, terminal, failure)..."
            className="flex-1 text-base outline-none text-slate-900 dark:text-white placeholder-slate-400 bg-transparent font-medium"
          />
          <kbd className="text-xs font-mono bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg border border-stone-200 dark:border-slate-700 shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-3 space-y-1 flex-1">
          {filteredItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                onClick={item.run}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-emerald-200 dark:border-slate-700 shadow-xs'
                    : 'hover:bg-stone-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200/60 dark:border-slate-700/60 shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border border-stone-200/60 dark:border-slate-800 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 text-slate-400">
                  {isSelected && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>Jump</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No matching results found for "{query}"</p>
              <p className="text-xs mt-1 text-slate-400">Try searching for <span className="font-mono text-emerald-600 dark:text-emerald-400">terminal</span>, <span className="font-mono text-emerald-600 dark:text-emerald-400">ns2</span>, <span className="font-mono text-emerald-600 dark:text-emerald-400">SW1</span>, <span className="font-mono text-emerald-600 dark:text-emerald-400">failure</span>, or <span className="font-mono text-emerald-600 dark:text-emerald-400">faq</span></p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 border-t border-stone-200/80 dark:border-slate-800 bg-[#FAF9F5] dark:bg-[#0B0F19] text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-stone-200 dark:border-slate-700 text-[10px]">↑</kbd> <kbd className="font-mono px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-stone-200 dark:border-slate-700 text-[10px]">↓</kbd> Navigate</span>
            <span><kbd className="font-mono px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-stone-200 dark:border-slate-700 text-[10px]">↵</kbd> Select</span>
          </div>
          <span className="font-mono text-[11px]">{filteredItems.length} available</span>
        </div>
      </div>
    </div>
  );
};
