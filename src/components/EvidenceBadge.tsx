import React from 'react';
import { ShieldCheck, AlertCircle, HelpCircle, Activity } from 'lucide-react';

export type EvidenceType = 
  | 'Browser-simulated'
  | 'Imported Packet Tracer observation'
  | 'Calculated from recorded data'
  | 'Unavailable';

interface EvidenceBadgeProps {
  type: EvidenceType;
  className?: string;
  compact?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ type, className = '', compact = false }) => {
  const padClass = compact ? 'px-1.5 py-0.5 text-[10px] rounded-md' : 'px-2.5 py-0.5 text-[11px] rounded-full';
  const iconClass = compact ? 'w-2.5 h-2.5 shrink-0' : 'w-3 h-3 shrink-0';

  switch (type) {
    case 'Browser-simulated':
      return (
        <span
          title="Browser-simulated (pure TypeScript discrete-event engine)"
          className={`inline-flex items-center gap-1 font-mono font-medium shrink-0 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 ${padClass} ${className}`}
        >
          <Activity className={`${iconClass} text-blue-600 dark:text-sky-400`} />
          <span>{compact ? 'Simulated' : 'Browser-simulated'}</span>
        </span>
      );
    case 'Imported Packet Tracer observation':
      return (
        <span
          title="Imported Packet Tracer observation"
          className={`inline-flex items-center gap-1 font-mono font-medium shrink-0 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${padClass} ${className}`}
        >
          <ShieldCheck className={`${iconClass} text-emerald-600 dark:text-emerald-400`} />
          <span>{compact ? 'Imported' : 'Imported PT Obs.'}</span>
        </span>
      );
    case 'Calculated from recorded data':
      return (
        <span
          title="Calculated from recorded data"
          className={`inline-flex items-center gap-1 font-mono font-medium shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 ${padClass} ${className}`}
        >
          <AlertCircle className={`${iconClass} text-slate-500 dark:text-slate-400`} />
          <span>{compact ? 'Calculated' : 'Calculated'}</span>
        </span>
      );
    case 'Unavailable':
    default:
      return (
        <span
          title="Metric unavailable in current engine state"
          className={`inline-flex items-center gap-1 font-mono font-medium shrink-0 bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${padClass} ${className}`}
        >
          <HelpCircle className={`${iconClass} text-amber-600 dark:text-amber-400`} />
          <span>{compact ? 'N/A' : 'Unavailable'}</span>
        </span>
      );
  }
};
