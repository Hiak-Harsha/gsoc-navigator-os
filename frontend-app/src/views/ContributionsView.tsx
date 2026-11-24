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
  ShieldCheck
} from 'lucide-react';

export const ContributionsView: React.FC = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMasterclass, setExpandedMasterclass] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<Record<number, string>>({});

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      setLoading(true);
      const data = await api.getContributions();
      setContributions(data);
      // Default first contribution open
      if (data.length > 0) {
        setExpandedMasterclass({ [data[0].id]: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMasterclass = (id: number) => {
    setExpandedMasterclass(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setTab = (id: number, tab: string) => {
    setActiveTab(prev => ({ ...prev, [id]: tab }));
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading contribution intelligence...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Engineering Masterclass & Contribution Intelligence</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Deep-dive technical knowledge engine: understand the exact mathematical principles, codebase architecture, and independent debugging blueprints behind your contributions.
        </p>
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
                    <span>Maintainer & Triage Status:</span>
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
                      <li key={idx} className="truncate text-slate-300 font-mono">• {file}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Demonstrated Competencies</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {skills.map((skill: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Masterclass Toggle Button */}
              {masterclass && (
                <div className="pt-2 border-t border-[#1e293b]">
                  <button
                    onClick={() => toggleMasterclass(contrib.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-950/50 via-[#162238] to-[#121a2d] border border-blue-500/30 hover:border-blue-400/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-blue-600/30 flex items-center justify-center text-blue-300 border border-blue-500/40">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Engineer's Masterclass: How to Solve Without AI</span>
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30 font-mono">
                            Self-Reliance Guide
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Click to {isExpanded ? 'hide' : 'explore'} step-by-step reproduction, root cause, code theory, and interview talking points.
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {/* Expanded Masterclass Content */}
                  {isExpanded && (
                    <div className="mt-4 p-5 rounded-xl bg-[#0b101c] border border-blue-900/40 space-y-5">
                      {/* Sub-Tabs */}
                      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                        {[
                          { id: 'blueprint', label: '🛠️ How to Solve Without AI', desc: 'Step-by-step human workflow' },
                          { id: 'rootcause', label: '🧠 Root Cause & Code Fix', desc: 'Architecture & theory' },
                          { id: 'testing', label: '🧪 Testing & Verification', desc: 'Test strategy & CI' },
                          { id: 'interview', label: '🎤 Maintainer Talking Points', desc: 'Interview & review defense' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTab(contrib.id, t.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              currentTab === t.id
                                ? 'bg-blue-600 text-white font-semibold shadow'
                                : 'bg-[#121a2d] text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab 1: Blueprint: How to Solve Without AI */}
                      {currentTab === 'blueprint' && (
                        <div className="space-y-4">
                          <div className="bg-[#121a2d] p-3.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5" /> What Was Broken in Plain English
                            </span>
                            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                              {masterclass.what_was_broken}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-2">
                              <span className="font-semibold text-slate-300">Real-World Impact: </span>
                              {masterclass.real_world_impact}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-mono uppercase font-bold text-blue-400 flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5" /> Senior Engineer's Investigation Blueprint (Do It Yourself)
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
