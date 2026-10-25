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
        return <Router className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'l3switch':
        return <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'switch':
        return <Network className="w-5 h-5 text-slate-700 dark:text-slate-300" />;
      case 'server':
        return <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'pc':
      default:
        return <Laptop className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    }
  };

  const getVlanBadgeColor = (vlan?: number) => {
    switch (vlan) {
      case 10: return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700';
      case 20: return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700';
      case 30: return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700';
      case 40: return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700';
      case 50: return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700';
      default: return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div
      className={`px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#131B2E] border-2 shadow-sm transition-all duration-200 min-w-[160px] cursor-pointer ${
        isSelected
          ? 'border-blue-600 dark:border-emerald-500 ring-4 ring-blue-500/15 dark:ring-emerald-500/20 shadow-lg dark:shadow-glow-green scale-105'
          : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500 shadow-xs'
      }`}
    >
      <Handle type="source" position={Position.Top} id="top-src" className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="target" position={Position.Top} id="top" className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="source" position={Position.Left} id="left-src" className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="target" position={Position.Right} id="right-tgt" className="!w-2.5 !h-2.5 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900" />
      
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate leading-tight">
              {device.name}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
            {device.ip || (device.type === 'switch' ? 'L2 Switch' : 'Unassigned')}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
        {device.vlan !== undefined ? (
          <span className={`px-2 py-0.5 rounded-full font-mono font-bold border shadow-xs ${getVlanBadgeColor(device.vlan)}`}>
            VLAN {device.vlan}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-400 font-mono text-[9px]">Trunk / SVI</span>
        )}

        {device.hsrpPriority !== undefined && (
          <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold border shadow-xs ${
            device.isHsrpActive
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700'
              : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          }`}>
            {device.isHsrpActive ? 'HSRP Act' : 'HSRP Stby'}
          </span>
        )}
      </div>

      {isNerdMode && (
        <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700 font-mono text-[9px] text-slate-500 dark:text-slate-400 space-y-0.5">
          <div className="truncate">MAC: {device.mac}</div>
          <div>Ports: {device.interfaces.length} configured</div>
        </div>
      )}
    </div>
  );
});
NetworkNodeComponent.displayName = 'NetworkNodeComponent';
