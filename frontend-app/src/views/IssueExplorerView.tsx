import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ArrowRight, Bug, Clock, ExternalLink } from 'lucide-react';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn, safeParseJson } from '../lib/utils';

export const IssueExplorerView: React.FC<{ onStartCoaching: (issueId: number) => void }> = ({
  onStartCoaching,
}) => {
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
    <div className="space-y-5 animate-fade-up">
      {/* Header & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amber-soft)] text-[var(--amber)]">
            <Bug className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">
              Intelligent Issue &amp; Bug Discovery
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
              Dual-axis classification by Severity (S0–S4) and Difficulty (L1–L5) grouped into progressive tiers.
            </p>
          </div>
        </div>

        <div className="inline-flex flex-wrap rounded-xl border bg-[var(--input-bg)] p-1">
          {[
            { id: 'all', label: 'All Issues' },
            { id: 'start_now', label: 'Start Now' },
            { id: 'stretch', label: 'Stretch' },
            { id: 'advanced', label: 'Advanced' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer',
                categoryFilter === cat.id
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-apple'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
          Evaluating issues across repositories...
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((iss) => {
            const requiredSkills = safeParseJson<string[]>(iss.required_skills, []);
            const edgeCases = safeParseJson<string[]>(iss.edge_cases, []);
            const severityTone: BadgeTone =
              iss.severity === 'S0'
                ? 'rose'
                : iss.severity === 'S1' || iss.severity === 'S2'
                  ? 'amber'
                  : 'accent';

            return (
              <article
                key={iss.id}
                className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple transition-all hover:border-[var(--border-strong)] space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral" className="font-mono">
                        #{iss.number}
                      </Badge>
                      <h2 className="text-[15.5px] font-bold text-[var(--ink)]">{iss.title}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={severityTone} className="font-mono">
                        Severity: {iss.severity}
                      </Badge>
                      <Badge tone="violet" className="font-mono">
                        Difficulty: {iss.difficulty}
                      </Badge>
                      <Badge tone="emerald" className="font-mono">
                        Match: {iss.match_score}%
                      </Badge>
                      <Badge tone="neutral" className="font-mono">
                        <Clock className="h-3 w-3" /> {iss.estimated_effort_hours}h
                      </Badge>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={iss.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border bg-[var(--surface-elevated)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]"
                      title="Open on GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Button variant="primary" size="sm" onClick={() => onStartCoaching(iss.id)}>
                      <span>Start Coaching</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {iss.body && (
                  <p className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
                    {iss.body}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
                      Investigation Strategy
                    </div>
                    <pre className="whitespace-pre-wrap rounded-xl border bg-[var(--input-bg)] p-3 font-mono text-[12px] text-[var(--ink-secondary)]">
                      {iss.investigation_strategy}
                    </pre>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--amber)]">
                        Testing &amp; Edge Cases
                      </div>
                      <ul className="space-y-1 text-[12px] text-[var(--ink-secondary)]">
                        {edgeCases.map((ec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--amber)]" />
                            <span>{ec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {requiredSkills.map((sk, idx) => (
                          <Badge key={idx} tone="neutral" className="font-mono text-[10.5px]">
                            {sk}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
