import React, { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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

const nodeTypes: NodeTypes = {
  networkDevice: NetworkNodeComponent,
};

const ViewportZoomDisplay: React.FC = () => {
  const { zoom } = useViewport();
  return (
    <span className="font-mono text-[11px] font-bold text-slate-700">
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
    activePath,
    updateDevicePosition
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

      let strokeColor = '#94A3B8'; // Default slate
      let strokeDash = undefined;
      let strokeWidth = 2.5;

      if (isDown) {
        strokeColor = '#DC2626'; // Failure red
        strokeDash = '6 6';
        strokeWidth = 3;
      } else if (isOnActivePath) {
        strokeColor = '#0EA5E9'; // Active packet path bright sky blue
        strokeWidth = 4;
      } else if (isSelected) {
        strokeColor = '#2563EB'; // Selected blue
        strokeWidth = 3.5;
      } else if (link.id.includes('PO1') || link.id.includes('L_SW1_SW2')) {
        strokeColor = '#4F46E5'; // EtherChannel purple
        strokeWidth = 3.5;
      }

      const labelContent = isDown ? (
        <span className="bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shadow-xs">
          LINK DOWN ✕
        </span>
      ) : (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border shadow-xs ${
          isOnActivePath 
            ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold' 
            : 'bg-white text-slate-600 border-slate-200'
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
  }, [links, selectedLinkId, activePath]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#FAFBFD] overflow-hidden select-none">
      {/* Top canvas header info chip */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
        <span className="font-bold text-slate-800">Campus Topology Canvas</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 font-mono text-[11px]">Click nodes to inspect • Click links to sever/heal</span>
      </div>

      {/* Top right Legend Chip */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
          >
            <span>🗺️</span>
            <span>Legend</span>
            <span className="text-[10px] text-slate-400">{showLegend ? '▲' : '▼'}</span>
          </button>

          {showLegend && (
            <div className="p-3 border-t border-slate-100 text-xs space-y-2 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-blue-600 rounded"></span>
                <span className="text-slate-600">Primary Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-indigo-600 rounded"></span>
                <span className="text-slate-600">EtherChannel (Trunk)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 border-b-2 border-dashed border-rose-500"></span>
                <span className="text-slate-600">Severed Link (DOWN)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-sky-400 rounded"></span>
                <span className="text-slate-600">Active Packet Path</span>
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
        <Background gap={20} size={1} color="#E2E8F0" />
        <Controls className="!bg-white !border-slate-200 !shadow-sm !rounded-xl !overflow-hidden" />
        
        {/* Floating MiniMap with Zoom Percentage */}
        <div className="react-flow__panel bottom left !m-3 bg-white/95 backdrop-blur p-1 rounded-xl border border-slate-200 shadow-md flex flex-col items-center">
          <MiniMap
            nodeColor="#3B82F6"
            maskColor="rgba(241, 245, 249, 0.7)"
            className="!m-0 !w-32 !h-24 !border-0 !rounded-lg"
          />
          <div className="w-full pt-1 px-1 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Zoom:</span>
            <ViewportZoomDisplay />
          </div>
        </div>
      </ReactFlow>

      <PacketAnimationOverlay />
    </div>
  );
};

