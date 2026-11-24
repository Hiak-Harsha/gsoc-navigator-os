import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Building2, Bookmark, BookmarkCheck, ExternalLink, Check, Code2, Users } from 'lucide-react';

export const OrganizationsView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<number[]>([]);
  const [comparison, setComparison] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await api.getOrganizations();
      setOrganizations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShortlist = async (orgId: number) => {
    try {
      const res = await api.toggleShortlist(orgId);
      setOrganizations(organizations.map(o => o.id === orgId ? { ...o, is_shortlisted: res.is_shortlisted } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompare = (orgId: number) => {
    if (selectedOrgs.includes(orgId)) {
      setSelectedOrgs(selectedOrgs.filter(id => id !== orgId));
    } else {
      if (selectedOrgs.length >= 3) return;
      setSelectedOrgs([...selectedOrgs, orgId]);
    }
  };

  const handleRunComparison = async () => {
    if (selectedOrgs.length < 2) return;
    try {
      const data = await api.compareOrganizations(selectedOrgs);
      setComparison(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Discovering mentoring organizations...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Organization Discovery & Fit Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic fit scoring based on your skills (Python, C, DSA, OS), community openness, and GSoC track record.
          </p>
        </div>
        {selectedOrgs.length >= 2 && (
          <button
            onClick={handleRunComparison}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            Compare Selected ({selectedOrgs.length})
          </button>
        )}
      </div>

      {/* Comparison Drawer if active */}
      {comparison && (
        <div className="bg-[#121a2d] border border-blue-500/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Side-by-Side Comparison</h3>
            <button onClick={() => setComparison(null)} className="text-xs text-slate-400 hover:text-white">Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparison.map((c) => (
              <div key={c.id} className="bg-[#162238] border border-[#253755] rounded-lg p-4 space-y-2 text-xs">
                <div className="font-bold text-white text-sm">{c.name}</div>
                <div className="text-blue-400 font-mono">Fit Score: {c.fit_score}%</div>
                <div className="text-slate-300">Languages: {c.languages.join(', ')}</div>
                <div className="text-slate-400">Skill Gaps: {c.skill_gaps.join(', ') || 'None'}</div>
                <div className="text-[11px] text-slate-500">Channel: {c.community_channel}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organizations.map((org) => {
          const languages = JSON.parse(org.primary_languages || '[]');
          const topics = JSON.parse(org.topics || '[]');
          const fitReasons = JSON.parse(org.fit_reasons || '[]');
          const isSelected = selectedOrgs.includes(org.id);

          return (
            <div
              key={org.id}
              className={`bg-[#121a2d] border rounded-xl p-6 space-y-4 transition-all ${
                org.is_shortlisted ? 'border-blue-500/50 shadow-md' : 'border-[#1e293b]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-white">{org.name}</h2>
                    <span className="text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/40 px-1.5 py-0.5 rounded">
                      Probability Fit: {org.fit_score}%
                    </span>
                    <span className="text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded">
                      2027 Status: Pending Official Google Announcement (Feb 2027)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Consistent GSoC track record across {JSON.parse(org.past_participation_years || '[]').length} past editions
                  </div>
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 mt-0.5"
                  >
                    <span>{org.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCompare(org.id)}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                      isSelected ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#162238] text-slate-400 border-[#253755]'
                    }`}
                  >
                    {isSelected ? 'Comparing' : 'Compare'}
                  </button>
                  <button
                    onClick={() => handleToggleShortlist(org.id)}
                    className={`p-1.5 rounded transition-colors ${
                      org.is_shortlisted ? 'text-amber-400 bg-amber-950/60' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={org.is_shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                  >
                    {org.is_shortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">{org.description}</p>

              {/* Strategic GSoC Selection Targets & Probability */}
              <div className="bg-[#10192b] border border-blue-900/50 rounded-lg p-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-950/70 border border-amber-800/40 px-2 py-0.5 rounded">
                      Role: {org.portfolio_role || 'Primary Target'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                      Slots: {org.annual_slots || '10-18 slots/yr'}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                      Competition: {org.competition_level || 'Medium'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-300 font-semibold">
                    🎯 Target: {org.target_contributions_required || 3} Merged PRs
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 bg-[#162238] p-2 rounded border border-[#253755]">
                  <strong className="text-blue-300 font-medium">How to Win Selection: </strong>
                  <span>{org.contribution_breakdown || '1 Starter Bug Fix (L1/L2) + 1 Subsystem Logic PR (L3) + 1 Proposal Draft'}</span>
                </div>
              </div>

              {/* Languages & Topics */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((lang: string, idx: number) => (
                    <span key={idx} className="text-[11px] font-mono bg-[#162238] border border-[#253755] text-slate-300 px-2 py-0.5 rounded">
                      {lang}
                    </span>
                  ))}
                  {topics.map((top: string, idx: number) => (
                    <span key={idx} className="text-[11px] font-mono bg-slate-800/60 text-slate-400 px-2 py-0.5 rounded">
                      {top}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fit Rationale */}
              <div className="bg-[#162238] border border-[#253755] rounded-lg p-3 space-y-1.5">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Fit Rationale</span>
                <ul className="space-y-1">
                  {fitReasons.map((reason: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
                <a
                  href={org.contribution_guide_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Contributing Guidelines</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => onNavigate('repositories')}
                  className="px-3 py-1.5 bg-[#162238] hover:bg-[#1e293b] border border-[#253755] text-white rounded text-xs transition-colors"
                >
                  Explore Codebase
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
