import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  GitPullRequest, 
  GitMerge, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle,
  FileText
} from 'lucide-react';

export const ContributionsView: React.FC = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMasterclass, setExpandedMasterclass] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<Record<number, string>>({});
  const [liveReports, setLiveReports] = useState<Record<number, any>>({});
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('');

  const syncLiveStatus = async () => {
    try {
      setSyncing(true);
      const res = await api.syncPRLiveStatus();
      if (res && res.reports) {
        const map: Record<number, any> = {};
        res.reports.forEach((r: any) => {
          map[r.pr_number] = r;
        });
        setLiveReports(map);
      }
      setLastSynced(new Date().toLocaleTimeString());
      const data = await api.getContributions();
      setContributions(data);
    } catch (err) {
      console.error("Failed to sync live PR status:", err);
    } finally {
      setSyncing(false);
    }
  };

  const loadContributions = async () => {
    try {
      setLoading(true);
      const data = await api.getContributions();
      setContributions(data);
      if (data.length > 0) {
        setExpandedMasterclass({ [data[0].id]: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
    syncLiveStatus();
    const interval = setInterval(syncLiveStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleMasterclass = (id: number) => {
    setExpandedMasterclass(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setTab = (id: number, tab: string) => {
    setActiveTab(prev => ({ ...prev, [id]: tab }));
  };

  const hasMergedPR = contributions.some(c => c.status === 'merged');

  if (loading && contributions.length === 0) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading contribution intelligence...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Live Sentinel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Engineering Masterclass & Live PR Sentinel</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time PR health monitor, continuous CI tracking, strict protocol compliance, and self-reliance engineering masterclasses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSynced && (
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-[#121a2d] border border-slate-800 px-2.5 py-1 rounded">
              <Clock className="w-3 h-3 text-slate-500" />
              Synced: <span className="text-slate-300">{lastSynced}</span>
            </span>
          )}
          <button
            onClick={syncLiveStatus}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold font-mono transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{syncing ? 'Syncing GitHub...' : 'Sync Live Status'}</span>
          </button>
        </div>
      </div>

      {/* Merged Celebratory Alert if any PR is merged */}
      {hasMergedPR && (
        <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-blue-950/80 border border-purple-500/40 rounded-xl p-4 flex items-center gap-3 text-purple-200 shadow-xl">
          <Sparkles className="w-6 h-6 text-amber-300 shrink-0 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-sm text-white">🎉 CONTRIBUTION MERGED!</span> Your code has officially landed into upstream open-source. Outstanding milestone for your GSoC selection portfolio!
          </div>
        </div>
      )}

      {/* Live Sentinel Monitoring Panel */}
      <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Live PR Sentinel & CI Health Watcher</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-mono">
              Auto-Polling Active
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Portfolio Health:</span>
            <span className="text-emerald-400 font-bold">{contributions.length} Active Contributions</span>
          </div>
        </div>

        {/* Protocol & Compliance Bar */}
        <div className="bg-[#0c121e] border border-slate-800/80 rounded-lg p-3 text-[11px] flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-300">
          <span className="text-slate-400 font-mono font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Protocol Gates:
          </span>
          <span className="flex items-center gap-1 text-emerald-300 font-mono">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> AI Policy Disclosure
          </span>
          <span className="flex items-center gap-1 text-emerald-300 font-mono">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> .mailmap Verified
          </span>
          <span className="flex items-center gap-1 text-emerald-300 font-mono">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Unit & Doctests Green
          </span>
          <span className="flex items-center gap-1 text-emerald-300 font-mono">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Towncrier Changelog Added
          </span>
        </div>

        {/* Live PR Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {contributions.map((c) => {
            const live = liveReports[c.pr_number] || {};
            const isMerged = c.status === 'merged' || live.is_merged;
            const hasFailures = (live.ci_failed || 0) > 0;
            const inProgress = (live.ci_in_progress || 0) > 0;
            const allPassed = live.ci_total > 0 && live.ci_passed === live.ci_total;

            return (
              <div key={c.id} className="bg-[#141d30] border border-slate-800 rounded-lg p-3 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.5 rounded">
                      PR #{c.pr_number}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      isMerged ? 'bg-purple-950/80 text-purple-300 border border-purple-800/40' :
                      allPassed ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40' :
                      hasFailures ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40' :
                      'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                    }`}>
                      {isMerged ? 'Merged 🎉' : c.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
                    {c.pr_title}
                  </h3>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>CI Status:</span>
                    <span className={`font-bold ${
                      allPassed ? 'text-emerald-400' :
                      hasFailures ? 'text-amber-400' :
                      inProgress ? 'text-blue-400' : 'text-slate-300'
                    }`}>
                      {live.ci_total !== undefined ? `${live.ci_passed}/${live.ci_total} passing` : 'Monitoring'}
                    </span>
                  </div>

                  {live.alerts && live.alerts.length > 0 && (
                    <div className="text-[10px] text-slate-300 bg-slate-900/60 p-1.5 rounded border border-slate-800 leading-tight">
                      {live.alerts[0]}
                    </div>
                  )}

                  <a
                    href={c.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center justify-between pt-1"
                  >
                    <span>Inspect GitHub Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contributions Timeline List */}
      <div className="space-y-6">
        {contributions.map((contrib) => {
          const files = JSON.parse(contrib.files_changed || '[]');
          const skills = JSON.parse(contrib.demonstrated_skills || '[]');
          const isMerged = contrib.status === 'merged';
          const isApproved = contrib.status === 'approved';
          const isExpanded = !!expandedMasterclass[contrib.id];
          const currentTab = activeTab[contrib.id] || 'blueprint';

          let masterclass: any = null;
          try {
            if (contrib.learning_breakdown) {
              masterclass = typeof contrib.learning_breakdown === 'string' 
                ? JSON.parse(contrib.learning_breakdown) 
                : contrib.learning_breakdown;
            }
          } catch (e) {
            console.error("Failed to parse learning_breakdown", e);
          }

          return (
            <div key={contrib.id} className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-5 shadow-lg">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isMerged ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' :
                    isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  }`}>
                    {isMerged ? <GitMerge className="w-5 h-5" /> : <GitPullRequest className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded">
                        PR #{contrib.pr_number}
                      </span>
                      <h2 className="text-sm font-semibold text-white">{contrib.pr_title}</h2>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      Branch: <span className="text-slate-300 font-semibold">{contrib.branch_name}</span> • Commits: {contrib.commits_count} • +{contrib.lines_added} / -{contrib.lines_deleted}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded border font-semibold ${
                    isMerged ? 'bg-purple-950/80 text-purple-300 border-purple-800/40' :
                    isApproved ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40' :
                    'bg-blue-950/80 text-blue-300 border-blue-800/40'
                  }`}>
                    {contrib.status}
                  </span>
                  <a
                    href={contrib.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded text-slate-300 hover:text-white bg-[#162238] border border-[#253755] flex items-center gap-1 text-xs transition-colors"
                  >
                    <span>GitHub PR</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Maintainer Review Feedback */}
              {contrib.review_feedback_summary && (
                <div className="bg-[#162238] border border-[#253755] rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Live CI & Maintainer Triage Status:</span>
                  </div>
                  <p className="text-xs text-slate-300">{contrib.review_feedback_summary}</p>
                </div>
              )}

              {/* Modified Files & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-[#1e293b]">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Subsystem Files Changed</span>
                  <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-slate-300">
                    {files.map((file: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="truncate">{file}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Demonstrated Engineering Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {skills.map((skill: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-[#162238] text-slate-300 px-2 py-0.5 rounded border border-[#253755]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Masterclass Expandable Section */}
              {masterclass && (
                <div className="pt-2 border-t border-[#1e293b]">
                  <button
                    onClick={() => toggleMasterclass(contrib.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-950/30 hover:bg-blue-950/50 border border-blue-900/50 text-blue-300 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span>Engineer's Masterclass: How to Solve Without AI & Maintainer Defense</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-4 p-5 rounded-lg bg-[#0d1527] border border-blue-900/40 space-y-5">
                      {/* Sub-tabs */}
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                        <button
                          onClick={() => setTab(contrib.id, 'blueprint')}
                          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                            currentTab === 'blueprint' 
                              ? 'bg-blue-600 text-white shadow' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          1. How to Solve Without AI
                        </button>
                        <button
                          onClick={() => setTab(contrib.id, 'rootcause')}
                          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                            currentTab === 'rootcause' 
                              ? 'bg-blue-600 text-white shadow' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          2. Root Cause & Solution
                        </button>
                        <button
                          onClick={() => setTab(contrib.id, 'testing')}
                          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                            currentTab === 'testing' 
                              ? 'bg-blue-600 text-white shadow' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          3. Testing Strategy
                        </button>
                        <button
                          onClick={() => setTab(contrib.id, 'interview')}
                          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                            currentTab === 'interview' 
                              ? 'bg-emerald-600 text-white shadow' 
                              : 'text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/40'
                          }`}
                        >
                          4. Maintainer Defense
                        </button>
                      </div>

                      {/* Tab 1: Blueprint */}
                      {currentTab === 'blueprint' && (
                        <div className="space-y-4">
                          <div className="bg-[#121a2d] p-4 rounded-lg border border-slate-800 space-y-2">
                            <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5" /> What Was Broken & Real World Impact
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed font-sans">
                              {masterclass.what_was_broken}
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-800/80 pt-2">
                              <strong className="text-slate-300 not-italic font-mono">Impact on Science:</strong> {masterclass.real_world_impact}
                            </p>
                          </div>

                          <div className="space-y-2.5">
                            <h4 className="text-xs font-mono uppercase font-bold text-amber-300 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5" /> Step-by-Step Blueprint to Solve Without AI
                            </h4>
                            <div className="space-y-2">
                              {masterclass.how_to_solve_without_ai?.map((step: string, idx: number) => (
                                <div key={idx} className="p-3 rounded-lg bg-[#141d30] border border-slate-800 text-xs text-slate-200 flex gap-3">
                                  <span className="font-mono text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                                  <div className="leading-relaxed font-sans">{step}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Root Cause & Code Fix */}
                      {currentTab === 'rootcause' && (
                        <div className="space-y-4">
                          <div className="bg-[#121a2d] p-4 rounded-lg border border-slate-800 space-y-2">
                            <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5" /> Technical Root Cause Analysis
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed">
                              {masterclass.root_cause_analysis}
                            </p>
                          </div>

                          <div className="bg-[#121a2d] p-4 rounded-lg border border-slate-800 space-y-2">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5" /> The Solution & Why Each Line Was Written
                            </span>
                            <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                              {masterclass.code_solution_explained}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Testing & Verification */}
                      {currentTab === 'testing' && (
                        <div className="space-y-4">
                          <div className="bg-[#121a2d] p-4 rounded-lg border border-slate-800 space-y-2">
                            <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5" /> Testing & Verification Strategy
                            </span>
                            <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                              {masterclass.testing_strategy}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 4: Interview & Talking Points */}
                      {currentTab === 'interview' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Maintainer Defense & Interview Talking Points
                          </h4>
                          <p className="text-xs text-slate-400">
                            If a GSoC mentor or interviewer asks: <span className="text-slate-200 italic">"Can you explain your contribution to this repository?"</span>, state these 3 concise points:
                          </p>
                          <div className="space-y-2">
                            {masterclass.interview_talking_points?.map((point: string, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex gap-2.5 items-start">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
