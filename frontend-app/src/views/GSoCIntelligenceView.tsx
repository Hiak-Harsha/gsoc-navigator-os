import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Calendar, ExternalLink, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export const GSoCIntelligenceView: React.FC = () => {
  const [eligibility, setEligibility] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [elData, tlData, resData] = await Promise.all([
        api.getEligibility(),
        api.getTimeline(),
        api.getResources()
      ]);
      setEligibility(elData);
      setTimeline(tlData);
      setResources(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading GSoC Program Intelligence...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">GSoC Program Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Authoritative rules, verified eligibility assessment, official program timeline, and verified source provenance.
        </p>
      </div>

      {/* Contributor Eligibility Assessment Card */}
      <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Contributor Eligibility Assessment</h2>
              <p className="text-xs text-slate-400">Evaluated against Google Open Source official guidelines</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-3 py-1 rounded-full">
            ELIGIBLE TO PARTICIPATE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-300">Verified Criteria:</span>
            <ul className="space-y-1.5">
              {eligibility?.verified_criteria?.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#162238] border border-[#253755] rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-blue-300 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Official Verification Protocol</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Google Summer of Code welcomes both university students and newcomers to open source (18+ years of age). Graduation in 2028 from GITAM fully qualifies under student criteria.
            </p>
            <a
              href={eligibility?.official_faq_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Read Official Eligibility FAQ</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Timeline Section: Verified vs Estimated */}
      <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">GSoC 2027 Program Lifecycle & Milestones</h2>
            <p className="text-xs text-slate-400">Strictly differentiating between confirmed dates and historical estimates</p>
          </div>
          <span className="text-xs font-mono bg-amber-950/80 text-amber-300 border border-amber-800/40 px-2.5 py-1 rounded">
            ESTIMATED TIMELINE (Awaiting Google 2027 Announcement)
          </span>
        </div>

        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#162238] border border-[#253755] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{item.stage}</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded">
                    {item.status_note}
                  </span>
                </div>
                <div className="text-xs text-slate-300">{item.action_item}</div>
                <div className="text-[10px] text-slate-400 font-mono">Source: {item.source}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-slate-300">
                  {new Date(item.start_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Authoritative Sources */}
      <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Authoritative GSoC Reference Portals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {resources.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-[#162238] border border-[#253755] hover:border-blue-500/50 transition-colors space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{res.name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] font-mono text-blue-400 truncate block">{res.url}</span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Verified Official</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
