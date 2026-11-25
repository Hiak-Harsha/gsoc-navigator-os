import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Calendar, CheckCircle2, FileText, Play } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ShimmerButton } from '../components/magic/ShimmerButton';
import { cn, safeParseJson } from '../lib/utils';

export interface ProposalStudioViewProps {
  showToast?: (msg: string, error?: boolean) => void;
}

export const ProposalStudioView: React.FC<ProposalStudioViewProps> = ({ showToast }) => {
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
      showToast?.(`Proposal audited · Review score ${res.review_score}%`);
    } catch (err) {
      console.error(err);
      showToast?.('Proposal audit failed', true);
    } finally {
      setIsAuditing(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Loading Proposal Development Studio...
      </div>
    );
  }

  const milestones = activeProposal ? safeParseJson<any[]>(activeProposal.weekly_milestones, []) : [];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-bright)]">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">
              GSoC Proposal Development Studio
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
              Author technical GSoC proposals, structure week-by-week deliverables with buffers, and run critical peer audits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {proposals.length > 1 && (
            <div className="inline-flex rounded-lg border bg-[var(--input-bg)] p-1">
              {proposals.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveProposal(p);
                    setAuditResult(null);
                  }}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-[12px] font-medium cursor-pointer',
                    activeProposal?.id === p.id
                      ? 'bg-[var(--surface)] text-[var(--ink)] shadow-apple'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  )}
                >
                  Draft #{p.id}
                </button>
              ))}
            </div>
          )}

          {activeProposal && (
            <ShimmerButton onClick={handleRunAudit} disabled={isAuditing}>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isAuditing ? 'Auditing...' : 'Run Critical Audit'}</span>
            </ShimmerButton>
          )}
        </div>
      </div>

      {activeProposal && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3.5">
                <h2 className="text-[16px] font-bold text-[var(--ink)]">{activeProposal.title}</h2>
                <Badge tone="emerald" className="font-mono font-bold">
                  Score: {activeProposal.review_score}%
                </Badge>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
                    Problem Statement
                  </div>
                  <p className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
                    {activeProposal.problem_statement}
                  </p>
                </div>

                <div>
                  <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
                    Proposed Solution &amp; Architecture
                  </div>
                  <p className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
                    {activeProposal.proposed_solution}
                  </p>
                </div>
              </div>
            </section>

            {/* Milestones */}
            <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Calendar className="h-4 w-4 text-[var(--violet)]" />
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">Timeline &amp; Weekly Deliverables</h2>
              </div>

              <div className="space-y-2.5">
                {milestones.map((m: any, idx: number) => {
                  const isBuffer = String(m.milestone || '').toLowerCase().includes('buffer');
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'rounded-xl border p-3.5 space-y-1.5',
                        isBuffer
                          ? 'border-[color:var(--amber)]/40 bg-[var(--amber-soft)]'
                          : 'bg-[var(--surface-elevated)]'
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-[var(--ink)]">
                          Week {m.week}: {m.milestone}
                        </span>
                        {isBuffer && <Badge tone="amber">Risk Buffer Week</Badge>}
                      </div>
                      <div className="font-mono text-[11.5px] text-[var(--ink-secondary)]">
                        Deliverables: {m.deliverables}
                      </div>
                      <div className="font-mono text-[10.5px] text-[var(--ink-muted)]">
                        Verification: {m.tests}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3.5">
              <h3 className="text-[14px] font-semibold text-[var(--ink)] border-b pb-2.5">
                Critical Audit Feedback
              </h3>
              {auditResult ? (
                <div className="space-y-3">
                  <div className="rounded-xl border bg-[var(--surface-elevated)] p-3 text-[12.5px] text-[var(--ink)]">
                    {auditResult.readiness_summary}
                  </div>
                  {auditResult.audit_warnings?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--amber)]">
                        Warnings to Address
                      </div>
                      {auditResult.audit_warnings.map((w: string, i: number) => (
                        <div
                          key={i}
                          className="rounded-xl border border-[color:var(--amber)]/35 bg-[var(--amber-soft)] p-2.5 text-[12px] text-[var(--ink)]"
                        >
                          • {w}
                        </div>
                      ))}
                    </div>
                  )}
                  {auditResult.strengths?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--emerald)]">
                        Strengths
                      </div>
                      {auditResult.strengths.map((s: string, i: number) => (
                        <div
                          key={i}
                          className="rounded-xl border border-[color:var(--emerald)]/30 bg-[var(--emerald-soft)] p-2.5 text-[12px] text-[var(--ink)]"
                        >
                          • {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-4 text-[12.5px] text-[var(--ink-muted)]">
                  Run critical audit to evaluate buffer weeks, milestone specificity, and mentor readiness score.
                </p>
              )}
            </section>

            <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3">
              <h3 className="text-[14px] font-semibold text-[var(--ink)] border-b pb-2.5">
                Proposal Checklist
              </h3>
              <ul className="space-y-2 text-[12.5px] text-[var(--ink-secondary)]">
                {[
                  'Problem statement grounded in actual code',
                  '12-week structured milestones',
                  'Buffer week included for risk mitigation',
                  'Linked prior merged/open PRs',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--emerald)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
