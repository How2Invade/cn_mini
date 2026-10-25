import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Router, Server, Laptop, Cpu, Network } from 'lucide-react';
import { Device } from '../simulation/types';

interface CustomNodeData {
  device: Device;
  isSelected: boolean;
  isNerdMode: boolean;
  isHsrpActive?: boolean;
}

export const NetworkNodeComponent = memo(({ data }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const { device, isSelected, isNerdMode } = nodeData;

  const renderIcon = () => {
    switch (device.type) {
      case 'router':
        return <Router className="w-5 h-5 text-blue-600" />;
      case 'l3switch':
        return <Cpu className="w-5 h-5 text-indigo-600" />;
      case 'switch':
        return <Network className="w-5 h-5 text-slate-700" />;
      case 'server':
        return <Server className="w-5 h-5 text-emerald-600" />;
      case 'pc':
      default:
        return <Laptop className="w-5 h-5 text-sky-600" />;
    }
  };

  const getVlanBadgeColor = (vlan?: number) => {
    switch (vlan) {
      case 10: return 'bg-amber-100 text-amber-800 border-amber-300';
      case 20: return 'bg-purple-100 text-purple-800 border-purple-300';
      case 30: return 'bg-sky-100 text-sky-800 border-sky-300';
      case 40: return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 50: return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div
      className={`px-3 py-2 rounded-lg bg-white border-2 shadow-sm transition-all duration-150 min-w-[150px] ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
          : 'border-slate-200 hover:border-slate-400'
      }`}
    >
      <Handle type="target" position={Position.Top} id="top" className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
      
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-slate-50 border border-slate-200">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-xs text-slate-800 truncate leading-tight">
            {device.name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono truncate">
            {device.ip || (device.type === 'switch' ? 'L2 Switch' : 'Unassigned')}
          </div>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1 pt-1 border-t border-slate-100 text-[10px]">
        {device.vlan !== undefined ? (
          <span className={`px-1.5 py-0.2 rounded font-mono font-medium border ${getVlanBadgeColor(device.vlan)}`}>
            VLAN {device.vlan}
          </span>
        ) : (
          <span className="text-slate-400 font-mono">Trunk / SVI</span>
        )}

        {device.hsrpPriority !== undefined && (
          <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-semibold ${
            device.isHsrpActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {device.isHsrpActive ? 'HSRP Act' : 'HSRP Stby'}
          </span>
        )}
      </div>

      {isNerdMode && (
        <div className="mt-1 pt-1 border-t border-dashed border-slate-200 font-mono text-[9px] text-slate-500 space-y-0.5">
          <div className="truncate">MAC: {device.mac}</div>
          <div>Ports: {device.interfaces.length} configured</div>
        </div>
      )}

    </div>
  );
});
NetworkNodeComponent.displayName = 'NetworkNodeComponent';
