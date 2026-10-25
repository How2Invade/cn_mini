import React from 'react';
import { useSimulation } from './context/SimulationContext';
import { Header } from './components/Header';
import { PresetsBar } from './components/PresetsBar';
import { ControlPanel } from './components/ControlPanel';
import { TopologyCanvas } from './components/TopologyCanvas';
import { Inspectors } from './components/Inspectors';
import { MetricsDashboard } from './components/MetricsDashboard';
import { EventLog } from './components/EventLog';
import { Copilot } from './components/Copilot';
import { GuidedDemo } from './components/GuidedDemo';
import { ComparisonView } from './components/ComparisonView';
import { ResearchPanel } from './components/ResearchPanel';
import { ProfessorFAQ } from './components/ProfessorFAQ';
import { Footer } from './components/Footer';
import { ArrowDown, Sparkles, BookOpen } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { isPresentationMode } = useSimulation();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <PresetsBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-8">
        {/* Hero Section (Hidden in Presentation Mode) */}
        {!isPresentationMode && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Computer Engineering Laboratory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore Campus Network Traffic, Dynamic Redundancy & Failure Recovery
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                A browser-native discrete-event network simulator modeling multi-tier campus architectures,
                VLAN segmentation, HSRP gateway failover, shortest-path reconvergence delay, and strict-priority QoS queueing.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => scrollToSection('simulator-workspace')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <span>Launch Simulator Workspace</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollToSection('research-attribution')}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Explore Research & Attribution</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Shortcuts / Hint Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 border border-slate-200">
          <div className="flex items-center gap-4">
            <span><strong className="text-slate-800">[Space]</strong> Run/Pause</span>
            <span><strong className="text-slate-800">[R]</strong> Reset</span>
            <span><strong className="text-slate-800">[M]</strong> Simple/Nerd Mode</span>
            <span><strong className="text-slate-800">[P]</strong> Presentation View</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            *Click links on the canvas to toggle failure states
          </div>
        </div>

        {/* Simulator Workspace (Controls, Canvas & Inspectors) */}
        <section id="simulator-workspace" className="space-y-4">
          <ControlPanel />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2 space-y-4">
              <TopologyCanvas />
              <Copilot />
            </div>

            <div className="space-y-4">
              <Inspectors />
            </div>
          </div>
        </section>

        {/* Telemetry & Metrics */}
        <section id="metrics-section">
          <MetricsDashboard />
        </section>

        {/* Event Log */}
        <section id="audit-log">
          <EventLog />
        </section>

        {/* Interactive Guided Scenario Demo */}
        <section id="guided-scenario">
          <GuidedDemo />
        </section>

        {/* Baseline vs Enhanced Comparison */}
        <section id="comparison-section">
          <ComparisonView />
        </section>

        {/* Research Attribution Panel */}
        <section id="research-attribution">
          <ResearchPanel />
        </section>

        {/* Professor Q&A and FAQ */}
        <section id="faq-section">
          <ProfessorFAQ />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppContent />
  );
};

export default App;
