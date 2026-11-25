import React, { useState } from 'react';
import { api } from '../api/client';
import { AlertTriangle, CheckCircle2, Code2, Play, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ShimmerButton } from '../components/magic/ShimmerButton';
import { cn } from '../lib/utils';

export interface PullRequestsViewProps {
  showToast?: (msg: string, error?: boolean) => void;
}

export const PullRequestsView: React.FC<PullRequestsViewProps> = ({ showToast }) => {
  const [prDiff, setPrDiff] = useState(
    `def simplify_rational_power(base, exp):
    # Guard against division by zero in rational power expansion
    if base == 0 and exp < 0:
        return S.ComplexInfinity
    return base ** exp

def test_simplify_rational_power():
    assert simplify_rational_power(0, -1) == S.ComplexInfinity`
  );
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = async () => {
    try {
      setIsAuditing(true);
      const res = await api.auditPR({
        pr_number: 24901,
        repository_id: 1,
        diff_or_code: prDiff,
      });
      setAuditResult(res);
      showToast?.(`PR Audit complete · Score ${res.score}%`);
    } catch (err) {
      console.error(err);
      showToast?.('PR audit failed', true);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-bright)]">
            <Code2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">
              Pull Request Intelligence &amp; Code Reviewer
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
              Pre-submission peer review: detects missing regression tests, broad exceptions, and maintainability risks.
            </p>
          </div>
        </div>

        <ShimmerButton onClick={handleRunAudit} disabled={isAuditing}>
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{isAuditing ? 'Auditing...' : 'Run PR Quality Audit'}</span>
        </ShimmerButton>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">Pull Request Code Diff</h2>
            <Badge tone="neutral" className="font-mono">
              Python / Unified Diff
            </Badge>
          </div>
          <textarea
            value={prDiff}
            onChange={(e) => setPrDiff(e.target.value)}
            className="h-80 w-full rounded-xl border bg-[var(--input-bg)] p-3.5 font-mono text-[12px] text-[var(--ink)] outline-none focus:border-[var(--accent-bright)]"
          />
        </section>

        <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">Automated Review Feedback</h2>
            {auditResult && (
              <Badge tone={auditResult.score >= 80 ? 'emerald' : 'amber'} className="font-mono font-bold">
                Score: {auditResult.score}%
              </Badge>
            )}
          </div>

          {!auditResult ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-2 text-center text-[var(--ink-muted)]">
              <Sparkles className="h-8 w-8 opacity-50" />
              <p className="max-w-sm text-[12.5px]">
                Click <strong className="text-[var(--ink)]">Run PR Quality Audit</strong> to inspect your diff for test coverage and antipatterns.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 space-y-1">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
                  Assessment
                </div>
                <p className="text-[12.5px] leading-relaxed text-[var(--ink)]">
                  {auditResult.quality_assessment}
                </p>
              </div>

              {auditResult.warnings?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--amber)]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Detected Antipatterns &amp; Warnings</span>
                  </div>
                  <ul className="space-y-1.5">
                    {auditResult.warnings.map((w: string, idx: number) => (
                      <li
                        key={idx}
                        className={cn(
                          'rounded-xl border border-[color:var(--amber)]/35 bg-[var(--amber-soft)] px-3 py-2 text-[12px] text-[var(--ink)]'
                        )}
                      >
                        • {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {auditResult.strengths?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--emerald)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Strengths</span>
                  </div>
                  <ul className="space-y-1.5">
                    {auditResult.strengths.map((s: string, idx: number) => (
                      <li
                        key={idx}
                        className="rounded-xl border border-[color:var(--emerald)]/30 bg-[var(--emerald-soft)] px-3 py-2 text-[12px] text-[var(--ink)]"
                      >
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
