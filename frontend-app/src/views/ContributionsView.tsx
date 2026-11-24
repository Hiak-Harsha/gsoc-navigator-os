import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { GitPullRequest, GitMerge, MessageSquare, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export const ContributionsView: React.FC = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      setLoading(true);
      const data = await api.getContributions();
      setContributions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading contribution history...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Live Contribution Intelligence Engine</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time synchronized tracking of your pull requests, review feedback, maintainer interactions, and demonstrated skills.
        </p>
      </div>

      {/* Contributions Timeline List */}
      <div className="space-y-4">
        {contributions.map((contrib) => {
          const files = JSON.parse(contrib.files_changed || '[]');
          const skills = JSON.parse(contrib.demonstrated_skills || '[]');
          const isMerged = contrib.status === 'merged';
          const isApproved = contrib.status === 'approved';

          return (
            <div key={contrib.id} className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isMerged ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' :
                    isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  }`}>
                    {isMerged ? <GitMerge className="w-5 h-5" /> : <GitPullRequest className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">PR #{contrib.pr_number}</span>
                      <h2 className="text-sm font-semibold text-white">{contrib.pr_title}</h2>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Branch: <span className="text-slate-300">{contrib.branch_name}</span> • Commits: {contrib.commits_count} • +{contrib.lines_added} / -{contrib.lines_deleted}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded border ${
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
                    className="p-1.5 rounded text-slate-400 hover:text-white bg-[#162238] border border-[#253755]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Maintainer Review Feedback */}
              {contrib.review_feedback_summary && (
                <div className="bg-[#162238] border border-[#253755] rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Maintainer Review Feedback:</span>
                  </div>
                  <p className="text-xs text-slate-300">{contrib.review_feedback_summary}</p>
                </div>
              )}

              {/* Code Quality & Demonstrated Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-[#1e293b]">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Modified Files</span>
                  <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-slate-300">
                    {files.map((file: string, idx: number) => (
                      <li key={idx} className="truncate">• {file}</li>
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
