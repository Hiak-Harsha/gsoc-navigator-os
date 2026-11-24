import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { FileText, Play, CheckCircle2, AlertTriangle, Calendar, Layers, ShieldCheck } from 'lucide-react';

export const ProposalStudioView: React.FC = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [activeProposal, setActiveProposal] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await api.getProposals();
      setProposals(data);
      if (data.length > 0) {
        setActiveProposal(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    if (!activeProposal) return;
    try {
      setIsAuditing(true);
      const res = await api.auditProposal(activeProposal.id);
      setAuditResult(res);
      setActiveProposal({ ...activeProposal, review_score: res.review_score });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading Proposal Studio...</div>;
  }

  const milestones = activeProposal ? JSON.parse(activeProposal.weekly_milestones || '[]') : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">GSoC Proposal Development Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Author technical GSoC proposals, structure week-by-week milestones with buffer periods, and run critical peer audits.
          </p>
        </div>

        {activeProposal && (
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAuditing ? 'Auditing Proposal...' : 'Run Critical Audit'}</span>
          </button>
        )}
      </div>

      {activeProposal && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Proposal Body */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                <h2 className="text-base font-bold text-white">{activeProposal.title}</h2>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-1 rounded">
                  Score: {activeProposal.review_score}%
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Problem Statement</span>
                  <p className="text-slate-300 mt-1 leading-relaxed bg-[#162238] p-3 rounded border border-[#253755]">
                    {activeProposal.problem_statement}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Proposed Solution & Architecture</span>
                  <p className="text-slate-300 mt-1 leading-relaxed bg-[#162238] p-3 rounded border border-[#253755]">
                    {activeProposal.proposed_solution}
                  </p>
                </div>
              </div>
            </div>

            {/* Week-by-Week Milestones */}
            <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-white">Timeline & Weekly Deliverables</h2>
              </div>

              <div className="space-y-3">
                {milestones.map((m: any, idx: number) => {
                  const isBuffer = m.milestone.toLowerCase().includes('buffer');
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                        isBuffer ? 'bg-amber-950/30 border-amber-800/50' : 'bg-[#162238] border-[#253755]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Week {m.week}: {m.milestone}</span>
                        {isBuffer && (
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700">
                            Risk Buffer Week
                          </span>
                        )}
                      </div>
                      <div className="text-slate-300 font-mono text-[11px]">Deliverables: {m.deliverables}</div>
                      <div className="text-slate-400 font-mono text-[10px]">Verification: {m.tests}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Audit Feedback & Quality Checklist */}
          <div className="space-y-6">
            <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Critical Audit Feedback</h3>

              {auditResult ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-[#162238] border border-[#253755] p-3 rounded text-slate-200">
                    {auditResult.readiness_summary}
                  </div>

                  {auditResult.audit_warnings.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Warnings to Address</span>
                      {auditResult.audit_warnings.map((w: string, i: number) => (
                        <div key={i} className="text-xs text-amber-200 bg-amber-950/40 p-2 rounded border border-amber-800/40">
                          • {w}
                        </div>
                      ))}
                    </div>
                  )}

                  {auditResult.strengths.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Strengths</span>
                      {auditResult.strengths.map((s: string, i: number) => (
                        <div key={i} className="text-xs text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                          • {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-4">
                  Run critical audit to evaluate buffer weeks, milestone specificity, and mentor score.
                </div>
              )}
            </div>

            <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-white">Proposal Checklist</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Problem statement grounded in actual code</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>12-week structured milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Buffer week included for risk mitigation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Linked prior merged/open PRs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
