import React, { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSimulation } from '../context/SimulationContext';
import { NetworkNodeComponent } from './CustomNodes';
import { PacketAnimationOverlay } from './PacketAnimationOverlay';
import { Sparkles } from 'lucide-react';

const nodeTypes: NodeTypes = {
  networkDevice: NetworkNodeComponent,
};

const ViewportZoomDisplay: React.FC = () => {
  const { zoom } = useViewport();
  return (
    <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
      {Math.round(zoom * 100)}%
    </span>
  );
};

export const TopologyCanvas: React.FC = () => {
  const {
    devices,
    links,
    selectedDeviceId,
    selectedLinkId,
    selectDevice,
    selectLink,
    toggleLinkState,
    isNerdMode,
    isDarkMode,
    activePath,
    updateDevicePosition,
    isCopilotOpen,
    setIsCopilotOpen
  } = useSimulation();

  const [showLegend, setShowLegend] = useState(false);

  // Create initial nodes
  const initialNodes: Node[] = useMemo(() => {
    return devices.map((d) => ({
      id: d.id,
      type: 'networkDevice',
      position: d.position,
      data: {
        device: d,
        isSelected: selectedDeviceId === d.id,
        isNerdMode,
        isHsrpActive: d.isHsrpActive,
      },
    }));
  }, [devices, selectedDeviceId, isNerdMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Sync node internal state when devices or selection changes externally
  useEffect(() => {
    setNodes((prevNodes) =>
      devices.map((d) => {
        const existing = prevNodes.find((n) => n.id === d.id);
        return {
          id: d.id,
          type: 'networkDevice',
          position: existing ? existing.position : d.position,
          data: {
            device: d,
            isSelected: selectedDeviceId === d.id,
            isNerdMode,
            isHsrpActive: d.isHsrpActive,
          },
        };
      })
    );
  }, [devices, selectedDeviceId, isNerdMode, setNodes]);

  // Convert engine links to React Flow edges with dynamic styling
  const edges: Edge[] = useMemo(() => {
    return links.map((link) => {
      const isDown = link.state === 'DOWN';
      const isSelected = selectedLinkId === link.id;
      
      // Determine if this link is on the active Dijkstra forwarding path
      const isOnActivePath = activePath !== null && activePath.some((nodeId, idx) => {
        if (idx === activePath.length - 1) return false;
        const nextNode = activePath[idx + 1];
        return (
          (link.source === nodeId && link.target === nextNode) ||
          (link.source === nextNode && link.target === nodeId)
        );
      });

      let strokeColor = isDarkMode ? '#334155' : '#94A3B8'; // Default slate
      let strokeDash = undefined;
      let strokeWidth = 2.5;

      if (isDown) {
        strokeColor = '#EF4444'; // Failure red
        strokeDash = '6 6';
        strokeWidth = 3;
      } else if (isOnActivePath) {
        strokeColor = isDarkMode ? '#38BDF8' : '#0EA5E9'; // Active packet path bright cyan/sky
        strokeWidth = 4;
      } else if (isSelected) {
        strokeColor = isDarkMode ? '#10B981' : '#2563EB'; // Selected blue / neon emerald
        strokeWidth = 3.5;
      } else if (link.id.includes('PO1') || link.id.includes('L_SW1_SW2')) {
        strokeColor = '#6366F1'; // EtherChannel purple
        strokeWidth = 3.5;
      }

      const labelContent = isDown ? (
        <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 px-2.5 py-1 rounded-full text-xs font-mono font-bold shadow-xs">
          LINK DOWN ✕
        </span>
      ) : link.packetsInFlight.length > 0 ? (
        <span className="bg-emerald-500 text-white font-mono font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-sm animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>{link.packetsInFlight.length} pkt{link.packetsInFlight.length > 1 ? 's' : ''}</span>
        </span>
      ) : (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border shadow-xs ${
          isOnActivePath 
            ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 font-bold' 
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
        }`}>
          {link.cost > 1 ? `Cost:${link.cost}` : `${link.id}`}
        </span>
      );

      return {
        id: link.id,
        source: link.source,
        target: link.target,
        type: 'smoothstep',
        animated: !isDown && (link.packetsInFlight.length > 0 || isOnActivePath),
        style: {
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: strokeDash,
        },
        label: labelContent,
      };
    });
  }, [links, selectedLinkId, activePath, isDarkMode]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#F5F5EE] dark:bg-[#090D16] overflow-hidden select-none transition-colors duration-200">
      {/* Top canvas header info chip */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2.5 bg-white/95 dark:bg-[#121824]/95 backdrop-blur-md px-4 h-10 rounded-2xl border border-stone-200/80 dark:border-slate-800 text-xs shadow-xs max-w-[calc(100%-240px)] truncate">
        <span className="font-bold text-slate-900 dark:text-white shrink-0 text-sm">Interactive Topology</span>
        <span className="text-slate-300 dark:text-slate-600 hidden lg:inline">|</span>
        <span className="text-slate-600 dark:text-slate-300 hidden lg:inline truncate">
          Click any device to inspect · Click any link to simulate a failure cut · Drag nodes to move
        </span>
      </div>

      {/* Top right Canvas Controls: Ask Copilot & Legend */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-auto">
        {/* Ask Copilot Button */}
        {!isCopilotOpen && (
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="h-10 px-4 bg-white/95 dark:bg-[#121824]/95 backdrop-blur-md border border-stone-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ask Copilot</span>
          </button>
        )}

        {/* Legend Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="h-10 px-4 bg-white/95 dark:bg-[#121824]/95 backdrop-blur-md border border-stone-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Legend</span>
            <span className="text-[10px] text-slate-400">{showLegend ? '▲' : '▼'}</span>
          </button>

          {showLegend && (
            <div className="absolute right-0 top-10 w-52 p-3 bg-white/95 dark:bg-[#121824]/95 backdrop-blur-md border border-stone-200/80 dark:border-slate-800 rounded-2xl shadow-xl text-xs space-y-2 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-blue-600 dark:bg-blue-400 rounded"></span>
                <span className="text-slate-600 dark:text-slate-300">Primary Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-indigo-600 dark:bg-indigo-400 rounded"></span>
                <span className="text-slate-600 dark:text-slate-300">EtherChannel (Trunk)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 border-b-2 border-dashed border-rose-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Severed Link (DOWN)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-sky-400 dark:bg-sky-300 rounded"></span>
                <span className="text-slate-600 dark:text-slate-300">Active Packet Path</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* React Flow Viewport */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={true}
        onNodeDragStop={(_, node) => {
          updateDevicePosition(node.id, Math.round(node.position.x), Math.round(node.position.y));
        }}
        onNodeClick={(_, node) => selectDevice(node.id)}
        onEdgeClick={(_, edge) => {
          selectLink(edge.id);
          toggleLinkState(edge.id);
        }}
        onPaneClick={() => {
          selectDevice(null);
          selectLink(null);
        }}
        minZoom={0.4}
        maxZoom={1.6}
      >
        <Background gap={20} size={1} color={isDarkMode ? '#1E293B' : '#E2E8F0'} />
        <Controls className="!bg-white dark:!bg-[#131B2E] !border-slate-200 dark:!border-slate-800 !shadow-sm !rounded-2xl !overflow-hidden" />
        
        {/* Minimal Zoom readout chip */}
        <div className="react-flow__panel bottom left !m-3 bg-white/95 dark:bg-[#121824]/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-stone-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Zoom:</span>
          <ViewportZoomDisplay />
        </div>
      </ReactFlow>

      <PacketAnimationOverlay />
    </div>
  );
};
