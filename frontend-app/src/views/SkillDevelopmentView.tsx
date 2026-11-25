import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

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
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Loading living skill profile...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--violet-soft)] text-[var(--violet)]">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">
            Living Skill Profile &amp; Evidence Register
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
            Evidence over assumptions: skills are calibrated by verified PRs, pytest runs, and real codebase changes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profile?.skills?.map((skill: any) => (
          <article
            key={skill.id}
            className="flex flex-col justify-between rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4 transition-all hover:border-[var(--border-strong)]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[15px] font-bold text-[var(--ink)]">{skill.name}</h2>
                  <span className="font-mono text-[10.5px] uppercase text-[var(--ink-muted)]">
                    {skill.category}
                  </span>
                </div>
                <Badge tone="accent" className="font-mono font-semibold">
                  Level {skill.estimated_level}/5
                </Badge>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--input-bg)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--emerald)] transition-all duration-500"
                  style={{ width: `${(skill.estimated_level / 5) * 100}%` }}
                />
              </div>

              <div className="space-y-1 text-[12.5px]">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Experience
                </div>
                <p className="text-[var(--ink-secondary)]">
                  {skill.practical_experience || 'Self-reported academic experience.'}
                </p>
              </div>

              {skill.verified_evidence && (
                <div className="rounded-xl border border-[color:var(--emerald)]/30 bg-[var(--emerald-soft)] p-3 space-y-1">
                  <div className="flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase text-[var(--emerald)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified Evidence</span>
                  </div>
                  <p className="font-mono text-[11.5px] text-[var(--ink)]">{skill.verified_evidence}</p>
                </div>
              )}

              {skill.weaknesses && (
                <div className="space-y-0.5 text-[12px]">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--amber)]">
                    Focus Area
                  </div>
                  <p className="text-[var(--ink-secondary)]">{skill.weaknesses}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
