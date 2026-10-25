import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSimulation } from '../context/SimulationContext';
import { NetworkNodeComponent } from './CustomNodes';
import { PacketAnimationOverlay } from './PacketAnimationOverlay';

const nodeTypes: NodeTypes = {
  networkDevice: NetworkNodeComponent,
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

  // Convert engine devices to React Flow nodes
  const nodes: Node[] = useMemo(() => {
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
      } else if (link.id.includes('PO1')) {
        strokeColor = '#4F46E5'; // EtherChannel purple
        strokeWidth = 3.5;
      }

      const labelContent = isDown ? (
        <span className="bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
          LINK DOWN
        </span>
      ) : (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
          isOnActivePath 
            ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold' 
            : 'bg-white text-slate-600 border-slate-200'
        }`}>
          Cost:{link.cost} {isNerdMode ? `| Q:${link.queue.length}/${link.queueLimit}` : ''}
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
  }, [links, selectedLinkId, activePath, isNerdMode]);

  return (
    <div className="relative w-full h-[600px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs shadow-sm">
        <span className="font-semibold text-slate-700">Topology Canvas</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-500 font-mono text-[11px]">Click nodes to inspect • Click links to toggle UP/DOWN</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background gap={16} size={1} color="#CBD5E1" />
        <Controls className="!bg-white !border-slate-200 !shadow-sm" />
      </ReactFlow>

      <PacketAnimationOverlay />
    </div>
  );
};
