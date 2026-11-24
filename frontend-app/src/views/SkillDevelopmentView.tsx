import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Sparkles, CheckCircle2, AlertCircle, Award, BookOpen, Plus } from 'lucide-react';

export const SkillDevelopmentView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading living skill profile...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Living Skill Profile & Evidence Register</h1>
        <p className="text-xs text-slate-400 mt-1">
          Evidence over assumptions: skills are calibrated by verified PRs, test execution, and codebase interactions.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile?.skills?.map((skill: any) => (
          <div key={skill.id} className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">{skill.name}</h2>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{skill.category}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#162238] border border-[#253755] px-2 py-0.5 rounded font-mono text-xs text-blue-300 font-semibold">
                Level {skill.estimated_level} / 5
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${(skill.estimated_level / 5) * 100}%` }}
              />
            </div>

            {/* Practical Experience */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Experience</span>
              <p className="text-slate-300">{skill.practical_experience || 'Self-reported academic experience.'}</p>
            </div>

            {/* Verified Evidence */}
            {skill.verified_evidence && (
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded p-2.5 space-y-0.5 text-xs">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Evidence
                </span>
                <p className="text-emerald-200 text-[11px] font-mono">{skill.verified_evidence}</p>
              </div>
            )}

            {/* Weaknesses & Targeted Learning */}
            {skill.weaknesses && (
              <div className="text-xs space-y-0.5 text-slate-400">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Focus Area</span>
                <p className="text-slate-300 text-[11px]">{skill.weaknesses}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
