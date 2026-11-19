import React, { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
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
import { MessageSquareText, ChevronDown } from 'lucide-react';

const nodeTypes: NodeTypes = {
  networkDevice: NetworkNodeComponent,
};

const ViewportZoomDisplay: React.FC = () => {
  const { zoom } = useViewport();
  return (
    <span className="font-mono text-[11px] tabular-nums text-slate-700 dark:text-slate-300">
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
    setIsCopilotOpen,
    tick,
    isRunning,
    isDraining
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

      let strokeColor = isDarkMode ? '#4A4C51' : '#A9A49A'; // neutral link
      let strokeDash = undefined;
      let strokeWidth = 1.75;

      if (isDown) {
        strokeColor = '#C8423B'; // Failure red
        strokeDash = '5 5';
        strokeWidth = 2;
      } else if (isOnActivePath) {
        strokeColor = isDarkMode ? '#4FB3CF' : '#2E8BA4'; // active forwarding path
        strokeWidth = 2.75;
      } else if (isSelected) {
        strokeColor = '#E2621E'; // selected link
        strokeWidth = 2.75;
      } else if (link.id.includes('PO1') || link.id.includes('L_SW1_SW2')) {
        strokeColor = isDarkMode ? '#A27DAD' : '#875D93'; // EtherChannel
        strokeWidth = 3;
      }

      const labelContent = isDown ? (
        <span className="bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-1.5 py-px rounded-sm text-[10px] font-mono font-semibold">
          link down
        </span>
      ) : link.packetsInFlight.length > 0 ? (
        <span className="bg-sky-600 text-white font-mono px-1.5 py-px rounded-sm text-[10px] flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-paper-raised" />
          <span>{link.packetsInFlight.length} pkt{link.packetsInFlight.length > 1 ? 's' : ''}</span>
        </span>
      ) : (
        <span className={`px-1.5 py-px rounded-sm text-[9.5px] font-mono border ${
          isOnActivePath
            ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
            : 'bg-paper dark:bg-ink text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
        }`}>
          {link.cost > 1 ? `cost ${link.cost}` : link.id.replace(/^L_/, '')}
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
    <div className="relative w-full h-full min-h-[500px] bg-paper dark:bg-ink overflow-hidden select-none">
      {/* Canvas caption */}
      <div className="absolute top-3 left-3 z-10 flex items-baseline gap-3 max-w-[calc(100%-260px)] min-w-0 pointer-events-none">
        <span className="eyebrow text-slate-500 dark:text-slate-400 shrink-0">Topology</span>
        <span className="2xl:hidden flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : isDraining ? 'bg-sky-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
          t={tick} {isRunning ? 'running' : isDraining ? 'draining' : tick === 0 ? 'ready' : 'paused'}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-500 hidden lg:inline truncate">
          Click a device to inspect it. Click a link to cut it. Drag to rearrange.
        </span>
      </div>

      {/* Copilot + legend */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 pointer-events-auto">
        {!isCopilotOpen && (
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="h-8 px-3 bg-paper-raised dark:bg-ink-raised border border-paper-line dark:border-ink-line rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-1.5"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-signal-500" />
            <span>Ask Copilot</span>
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="h-8 px-3 bg-paper-raised dark:bg-ink-raised border border-paper-line dark:border-ink-line rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-1.5"
          >
            <span>Legend</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showLegend ? 'rotate-180' : ''}`} />
          </button>

          {showLegend && (
            <div className="absolute right-0 top-9 w-56 p-3 bg-paper-raised dark:bg-ink-raised border border-paper-line dark:border-ink-line rounded-md shadow-lg text-xs space-y-2 z-30">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-[2px] bg-[#A9A49A] dark:bg-[#4A4C51]"></span>
                <span className="text-slate-600 dark:text-slate-300">Link (idle)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-[3px] bg-purple-500 dark:bg-purple-400"></span>
                <span className="text-slate-600 dark:text-slate-300">EtherChannel trunk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-[3px] bg-sky-500 dark:bg-sky-400"></span>
                <span className="text-slate-600 dark:text-slate-300">Active packet path</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 border-t-2 border-dashed border-rose-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Link down</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-[3px] bg-signal-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Selected link</span>
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
        fitViewOptions={{ padding: 0.18 }}
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
        <Background variant={BackgroundVariant.Cross} gap={28} size={5} color={isDarkMode ? '#232528' : '#DDD9CE'} />
        <Controls showInteractive={false} position="bottom-right" />
        
        {/* Minimal Zoom readout chip */}
        <div className="react-flow__panel bottom left !m-3 px-2 py-1 rounded-md border border-paper-line dark:border-ink-line bg-paper-raised dark:bg-ink-raised flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-slate-400">Zoom:</span>
          <ViewportZoomDisplay />
        </div>
      </ReactFlow>

      <PacketAnimationOverlay />
    </div>
  );
};
