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
        return <Router className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
      case 'l3switch':
        return <Cpu className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />;
      case 'switch':
        return <Network className="w-3 h-3 text-slate-700 dark:text-slate-300" />;
      case 'server':
        return <Server className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
      case 'pc':
      default:
        return <Laptop className="w-3 h-3 text-sky-600 dark:text-sky-400" />;
    }
  };

  const typeLabel: Record<string, string> = {
    router: 'Router',
    l3switch: 'L3 Switch',
    switch: 'L2 Switch',
    server: 'Server',
    pc: 'Host',
  };

  const getVlanBadgeColor = (vlan?: number) => {
    switch (vlan) {
      case 10: return 'text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-300 dark:border-amber-800 dark:bg-amber-950/40';
      case 20: return 'text-purple-700 border-purple-300 bg-purple-50 dark:text-purple-300 dark:border-purple-800 dark:bg-purple-950/40';
      case 30: return 'text-sky-700 border-sky-300 bg-sky-50 dark:text-sky-300 dark:border-sky-800 dark:bg-sky-950/40';
      case 40: return 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/40';
      case 50: return 'text-rose-700 border-rose-300 bg-rose-50 dark:text-rose-300 dark:border-rose-800 dark:bg-rose-950/40';
      default: return 'text-slate-600 border-slate-300 bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:bg-slate-800';
    }
  };

  const handleCls = '!w-1.5 !h-1.5 !min-w-0 !min-h-0 !bg-slate-400 dark:!bg-slate-500 !border-0 !rounded-none';

  return (
    <div
      className={`w-[200px] rounded-md bg-paper-raised dark:bg-ink-raised border transition-colors duration-150 cursor-pointer ${
        isSelected
          ? 'border-signal-500 outline outline-2 outline-offset-2 outline-signal-500/30'
          : 'border-slate-300 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500'
      }`}
    >
      <Handle type="source" position={Position.Top} id="top-src" className={handleCls} />
      <Handle type="target" position={Position.Top} id="top" className={handleCls} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleCls} />
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" className={handleCls} />
      <Handle type="target" position={Position.Left} id="left" className={handleCls} />
      <Handle type="source" position={Position.Left} id="left-src" className={handleCls} />
      <Handle type="source" position={Position.Right} id="right" className={handleCls} />
      <Handle type="target" position={Position.Right} id="right-tgt" className={handleCls} />

      {/* header strip */}
      <div className="flex items-center justify-between px-2.5 h-6 border-b border-slate-200 dark:border-slate-800">
        <span className="flex items-center gap-1.5 eyebrow text-slate-500 dark:text-slate-400">
          {renderIcon()}
          {typeLabel[device.type] ?? device.type}
        </span>
        <span className="font-mono text-[9.5px] text-slate-400 dark:text-slate-500">{device.id}</span>
      </div>

      <div className="px-2.5 pt-1.5 pb-2">
        <div className="font-semibold text-[12.5px] leading-snug text-slate-900 dark:text-slate-50 truncate" title={device.name}>
          {device.name}
        </div>
        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono truncate">
          {device.ip || (device.type === 'switch' ? 'no IP (layer 2)' : 'unassigned')}
        </div>

        {(device.vlan !== undefined || device.hsrpPriority !== undefined) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
            {device.vlan !== undefined && (
              <span className={`px-1.5 py-px rounded-sm font-mono border ${getVlanBadgeColor(device.vlan)}`}>
                VLAN {device.vlan}
              </span>
            )}
            {device.hsrpPriority !== undefined && (
              <span className={`px-1.5 py-px rounded-sm font-mono border ${
                device.isHsrpActive
                  ? 'text-signal-700 border-signal-300 bg-signal-50 dark:text-signal-300 dark:border-signal-800 dark:bg-signal-950'
                  : 'text-slate-600 border-slate-300 bg-slate-50 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-800'
              }`}>
                {device.isHsrpActive ? 'HSRP active' : 'HSRP standby'}
              </span>
            )}
          </div>
        )}

        {isNerdMode && (
          <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700 font-mono text-[9.5px] text-slate-500 dark:text-slate-400 space-y-0.5">
            <div className="truncate">mac {device.mac}</div>
            <div>{device.interfaces.length} interfaces</div>
          </div>
        )}
      </div>
    </div>
  );
});
NetworkNodeComponent.displayName = 'NetworkNodeComponent';
