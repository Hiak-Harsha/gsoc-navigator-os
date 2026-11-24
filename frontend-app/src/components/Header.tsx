import React from 'react';
import { ShieldCheck, RefreshCw, Radio } from 'lucide-react';

interface HeaderProps {
  title: string;
  readinessScore: number;
  isSyncing: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, readinessScore, isSyncing, onRefresh }) => {
  return (
    <header className="h-14 bg-[#0d1322]/90 backdrop-blur border-b border-[#1e293b] sticky top-0 z-10 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <span className="text-[11px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-full flex items-center gap-1.5">
          <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
          Target: GSoC 2027
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Readiness Meter */}
        <div className="flex items-center gap-3 bg-[#162032] border border-[#253248] px-3 py-1 rounded-md">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">Readiness:</span>
          </div>
          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, readinessScore)}%` }}
            />
          </div>
          <span className="text-xs font-mono font-semibold text-slate-200">{readinessScore}%</span>
        </div>

        {/* Global Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isSyncing}
          className="flex items-center gap-1.5 text-xs bg-[#162032] hover:bg-[#1e293b] border border-[#253248] text-slate-300 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
          title="Synchronize all intelligence sources"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
        </button>
      </div>
    </header>
  );
};
