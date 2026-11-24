import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Bug, ArrowRight, ExternalLink, Clock, Sparkles } from 'lucide-react';

export const IssueExplorerView: React.FC<{ onStartCoaching: (issueId: number) => void }> = ({ onStartCoaching }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, [categoryFilter]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const params = categoryFilter !== 'all' ? { category: categoryFilter } : undefined;
      const data = await api.getIssues(params);
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Intelligent Issue & Bug Discovery</h1>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory dual-axis classification: Severity (S0–S4) and Difficulty (Level 1–5). Grouped into progressive learning tiers.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 bg-[#121a2d] border border-[#1e293b] p-1 rounded-lg">
          {['all', 'start_now', 'stretch', 'advanced'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                categoryFilter === cat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Issues' : cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-slate-400 font-mono text-sm">Evaluating issues across repositories...</div>
        ) : (
          issues.map((iss) => {
            const requiredSkills = JSON.parse(iss.required_skills || '[]');
            const edgeCases = JSON.parse(iss.edge_cases || '[]');

            return (
              <div key={iss.id} className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4 hover:border-[#2b3d5b] transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{iss.number}</span>
                      <h2 className="text-base font-bold text-white">{iss.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      {/* Severity Pill */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        iss.severity === 'S0' ? 'bg-rose-950/80 text-rose-300 border-rose-800/40' :
                        iss.severity === 'S1' ? 'bg-orange-950/80 text-orange-300 border-orange-800/40' :
                        iss.severity === 'S2' ? 'bg-amber-950/80 text-amber-300 border-amber-800/40' :
                        'bg-blue-950/80 text-blue-300 border-blue-800/40'
                      }`}>
                        Severity: {iss.severity}
                      </span>
                      {/* Difficulty Pill */}
                      <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded">
                        Difficulty: {iss.difficulty}
                      </span>
                      {/* Match Score */}
                      <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                        Match: {iss.match_score}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={iss.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#162238] border border-[#253755] text-slate-400 hover:text-white rounded"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onStartCoaching(iss.id)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>Start Coaching</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {iss.body && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#162238]/60 p-3 rounded border border-[#253755]/50">
                    {iss.body}
                  </p>
                )}

                {/* Technical Guidance & Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Investigation Strategy</span>
                    <pre className="text-xs font-mono text-slate-300 bg-[#0f172a] p-2.5 rounded border border-[#1e293b] whitespace-pre-wrap">
                      {iss.investigation_strategy}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold block mb-1">Testing & Edge Cases</span>
                      <ul className="space-y-1 text-slate-300">
                        {edgeCases.map((ec: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{ec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Estimated effort: {iss.estimated_effort_hours} hours • Required: {requiredSkills.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
