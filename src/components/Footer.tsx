import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 py-8 px-4 mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              Smart Adaptive Campus Network Simulator
            </span>
            <span>— Educational Discrete-Event Simulation</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://doi.org/10.5281/zenodo.10254264"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Varne et al. (Zenodo DOI) <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/antondemian/redundant-data-center-campus-network"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Demian GitHub Repository <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            Built with React 19, TypeScript, Tailwind CSS & React Flow. Pure browser execution; no server backend.
          </div>
          <div>
            Paper licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
          </div>
        </div>
      </div>
    </footer>
  );
};
