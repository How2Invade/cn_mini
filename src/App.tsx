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
  const { isPresentationMode, autoLayoutPreset } = useSimulation();
  
  const [currentSection, setCurrentSection] = useState<RailSection>('simulator');
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const [dockTab, setDockTab] = useState<DockTabId>('analytics');
  const [isDockOpen, setIsDockOpen] = useState(true);

  const handleOpenDockTab = (tab: 'analytics' | 'terminal' | 'packet_lane') => {
    setDockTab(tab);
    setIsDockOpen(true);
    setCurrentSection('simulator');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
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
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onAutoLayout={autoLayoutPreset}
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Architectural Comparison</h2>
                <p className="text-sm text-slate-600 mb-6">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
                <h3 className="font-bold text-base text-slate-800 mb-2">Guided Demonstration Scenarios</h3>
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

