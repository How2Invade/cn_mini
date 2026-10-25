import React, { useState } from 'react';
import { useSimulation } from './context/SimulationContext';
import { LeftRail, RailSection } from './components/shell/LeftRail';
import { PresetsDrawer } from './components/shell/PresetsDrawer';
import { TopBar } from './components/shell/TopBar';
import { RightDrawer } from './components/shell/RightDrawer';
import { CommandPalette } from './components/shell/CommandPalette';
import { BottomDock, DockTabId } from './components/dock/BottomDock';
import { TopologyCanvas } from './components/TopologyCanvas';
import { ComparisonView } from './components/ComparisonView';
import { ResearchPanel } from './components/ResearchPanel';
import { ProfessorFAQ } from './components/ProfessorFAQ';
import { GuidedDemo } from './components/GuidedDemo';

export const AppContent: React.FC = () => {
  const { isPresentationMode, autoLayoutPreset, requestedDockTab, clearDockRequest } = useSimulation();
  
  const [currentSection, setCurrentSection] = useState<RailSection>('simulator');
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const [dockTab, setDockTab] = useState<DockTabId>('analytics');
  const [isDockOpen, setIsDockOpen] = useState(false);

  const handleOpenDockTab = (tab: DockTabId) => {
    setDockTab(tab);
    setIsDockOpen(true);
    setCurrentSection('simulator');
  };

  // Sync dock requests from context (e.g. from terminal CLI or shortcuts)
  React.useEffect(() => {
    if (requestedDockTab) {
      handleOpenDockTab(requestedDockTab as DockTabId);
      clearDockRequest();
    }
  }, [requestedDockTab, clearDockRequest]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5EE] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* 1. Left Icon Rail (64px) - hidden in full Presentation Mode */}
      {!isPresentationMode && (
        <LeftRail
          currentSection={currentSection}
          setSection={setCurrentSection}
          isPresetsOpen={isPresetsOpen}
          setIsPresetsOpen={setIsPresetsOpen}
          onOpenDockTab={handleOpenDockTab}
        />
      )}

      {/* 2. Collapsible Presets Panel (~280px) */}
      {!isPresentationMode && isPresetsOpen && (
        <PresetsDrawer
          isOpen={isPresetsOpen}
          onClose={() => setIsPresetsOpen(false)}
        />
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top bar */}
        <TopBar
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onAutoLayout={autoLayoutPreset}
          onOpenTour={() => setCurrentSection('demo')}
        />

        {/* Dynamic Center View */}
        <div className="flex-1 flex overflow-hidden min-w-0 relative">
          {currentSection === 'simulator' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Topology Hero Canvas */}
              <div className="flex-1 relative overflow-hidden flex">
                <div className="flex-1 h-full relative">
                  <TopologyCanvas />
                </div>
                {/* Right Drawer (Device/Link Inspector & Copilot) */}
                {!isPresentationMode && <RightDrawer />}
              </div>

              {/* Bottom Dock (Analytics, Terminal & NS-2, Packet Lane, Event Log) */}
              <BottomDock
                activeTab={dockTab}
                setActiveTab={setDockTab}
                isOpen={isDockOpen}
                setIsOpen={setIsDockOpen}
              />
            </div>
          )}

          {currentSection === 'comparison' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
              <div className="bg-white dark:bg-[#131B2E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Architectural Comparison</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Quantitative and qualitative evaluation of the Baseline Single-Core campus versus the Fault-Tolerant Enhanced Dual-Core topology.
                </p>
                <ComparisonView />
              </div>
            </div>
          )}

          {currentSection === 'research' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
              <ResearchPanel />
            </div>
          )}

          {currentSection === 'faq' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
              <ProfessorFAQ />
              <div className="bg-white dark:bg-[#131B2E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
                <h3 className="font-bold text-base text-slate-800 dark:text-white mb-2">Guided Demonstration Scenarios</h3>
                <GuidedDemo />
              </div>
            </div>
          )}

          {currentSection === 'demo' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
              <div className="bg-white dark:bg-[#131B2E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Guided Scenario Laboratory</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Automated 7-step interactive execution of normal traffic, link failure, packet drop, reconvergence, and recovery.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentSection('simulator')}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-bold text-xs hover:bg-blue-100"
                  >
                    ← Back to Topology
                  </button>
                </div>
                <GuidedDemo />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Global Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectSection={setCurrentSection}
        onOpenDockTab={handleOpenDockTab}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
