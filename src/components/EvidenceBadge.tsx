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
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'Browser-simulated':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <Activity className="w-3 h-3 text-blue-600" />
          Browser-simulated
        </span>
      );
    case 'Imported Packet Tracer observation':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Imported PT Obs.
        </span>
      );
    case 'Calculated from recorded data':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          <AlertCircle className="w-3 h-3 text-slate-500" />
          Calculated
        </span>
      );
    case 'Unavailable':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <HelpCircle className="w-3 h-3 text-amber-600" />
          Unavailable
        </span>
      );
  }
};
