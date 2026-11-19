import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { PlayCircle, ChevronRight, ChevronLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { EvidenceBadge } from './EvidenceBadge';

interface DemoStep {
  step: number;
  title: string;
  actionSummary: string;
  explanation: string;
  execute: (ctx: any) => void;
}

export const GuidedDemo: React.FC = () => {
  const simulation = useSimulation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: DemoStep[] = [
    {
      step: 1,
      title: 'Step 1: Normal Dual-Core Campus Operation',
      actionSummary: 'Loads Preset 2 (Enhanced Dual-Core Topology).',
      explanation: 'The campus operates with redundant core multilayer switches (SW1 and SW2). HSRP priority 110 designates SW1 as active default gateway, and OSPF Area 0 provides dynamic Layer 3 routing.',
      execute: (ctx) => {
        ctx.setPreset('preset-2-enhanced');
      },
    },
    {
      step: 2,
      title: 'Step 2: Dispatch Steady-State Student Traffic',
      actionSummary: 'Generates 10 packets from PC-STUD to Campus Web Server.',
      explanation: 'Packets traverse PC-STUD -> SW6 -> SW4 -> SW1 -> SRV-WEB. Shortest-path routing determines SW1 is the lowest metric path (Cost: 11). Delivery rate is 100%.',
      execute: (ctx) => {
        ctx.sendTraffic('PC-STUD', 'SRV-WEB', 10, 'CLASS_BEST_EFFORT');
        ctx.toggleRun();
      },
    },
    {
      step: 3,
      title: 'Step 3: Primary Distribution Uplink Fails',
      actionSummary: 'Disables physical link L_SW1_SW4.',
      explanation: 'Simulates a physical fiber cut or port transceiver failure between South Campus distribution switch SW4 and Core SW1. Reconvergence timer is initiated.',
      execute: (ctx) => {
        ctx.toggleLinkState('L_SW1_SW4');
      },
    },
    {
      step: 4,
      title: 'Step 4: Reconvergence Window & Transient Discard',
      actionSummary: 'Steps simulation through reconvergence window.',
      explanation: 'During the 5-tick reconvergence delay, routing tables are held in transition. Packets generated during this brief window are dropped, accurately modeling routing protocol convergence latency.',
      execute: (ctx) => {
        ctx.sendTraffic('PC-STUD', 'SRV-WEB', 4, 'CLASS_BEST_EFFORT');
        for (let i = 0; i < 6; i++) ctx.stepOnce();
      },
    },
    {
      step: 5,
      title: 'Step 5: Dynamic Path Re-establishment via SW2',
      actionSummary: 'Dispatches traffic along recovered alternate path.',
      explanation: 'Dijkstra shortest-path algorithm recalculates the topology: traffic now traverses alternate uplink SW4 <-> SW2. Recovery time is calculated and logged. 100% of new packets are delivered.',
      execute: (ctx) => {
        ctx.sendTraffic('PC-STUD', 'SRV-WEB', 10, 'CLASS_BEST_EFFORT');
        ctx.toggleRun();
      },
    },
    {
      step: 6,
      title: 'Step 6: Baseline vs. Enhanced Resilience Comparison',
      actionSummary: 'Contrasts dual-core resilience against single-point-of-failure baseline.',
      explanation: 'In the single-core baseline (Varne et al. conceptual design), a distribution link failure causes an unrecoverable 100% black hole outage. In our enhanced design, recovery occurs within ticks.',
      execute: (_ctx) => {
        // Visual review step
      },
    },
    {
      step: 7,
      title: 'Step 7: Verification Summary & Limitations',
      actionSummary: 'Recaps what was proven and simulation boundaries.',
      explanation: 'This test demonstrates automated failover and shortest-path recalculation in an abstracted discrete-event model. It proves topological resilience without claiming live Cisco IOS hardware execution.',
      execute: (_ctx) => {
        // Final review step
      },
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      steps[nextIndex].execute(simulation);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      steps[prevIndex].execute(simulation);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    steps[0].execute(simulation);
  };

  return (
    <div className="bg-paper-raised dark:bg-ink-raised border border-paper-line dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-emerald-400">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">7-Step Interactive Guided Scenario Tour</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live step-by-step walkthrough of normal traffic, link failure, and recovery</p>
          </div>
        </div>
        <EvidenceBadge type="Browser-simulated" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-2">
        {steps.map((s, idx) => (
          <button
            key={s.step}
            onClick={() => {
              setCurrentStepIndex(idx);
              s.execute(simulation);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 border ${
              idx === currentStepIndex
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-900 border-slate-900 dark:border-emerald-500 shadow-sm'
                : idx < currentStepIndex
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-stone-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-paper-line dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            {idx < currentStepIndex && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            <span>Step {s.step}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-stone-50/80 dark:bg-slate-900/80 border border-paper-line dark:border-slate-800 rounded-2xl p-4.5 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{currentStep.title}</h4>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Step {currentStep.step} of 7</span>
        </div>
        <div className="text-xs font-semibold text-blue-700 dark:text-emerald-400">Action: {currentStep.actionSummary}</div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{currentStep.explanation}</p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleRestart}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-paper-raised dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Tour</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-paper-raised dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-emerald-500 hover:bg-blue-700 dark:hover:bg-emerald-400 text-xs font-semibold text-white dark:text-slate-900 disabled:opacity-40 flex items-center gap-1 transition-all shadow-sm"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
