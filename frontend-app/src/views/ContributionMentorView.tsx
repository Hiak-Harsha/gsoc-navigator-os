import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export interface ContributionMentorViewProps {
  activeIssueId?: number;
  showToast?: (msg: string, error?: boolean) => void;
}

export const ContributionMentorView: React.FC<ContributionMentorViewProps> = ({
  activeIssueId,
  showToast,
}) => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [stepNotes, setStepNotes] = useState('');
  const [patchDiff, setPatchDiff] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initOrLoadSession();
  }, [activeIssueId]);

  const initOrLoadSession = async () => {
    try {
      setLoading(true);
      let targetIssueId = activeIssueId;
      if (!targetIssueId) {
        const issues = await api.getIssues();
        if (issues.length > 0) targetIssueId = issues[0].id;
      }

      if (targetIssueId) {
        const session = await api.startCoaching(targetIssueId, 'mentor');
        const fullData = await api.getCoachingSession(session.id);
        setSessionData(fullData);
        setStepNotes(fullData.session.investigation_notes || '');
        setPatchDiff(fullData.session.patch_diff || '');
      }
    } catch (err) {
      console.error(err);
      showToast?.('Failed to initialize coaching session', true);
    } finally {
      setLoading(false);
    }
  };

  const handleStepTransition = async (nextStep: number) => {
    if (!sessionData) return;
    try {
      await api.updateCoachingStep(sessionData.session.id, {
        step: nextStep,
        notes: stepNotes,
        patch_diff: patchDiff,
        root_cause_confirmed: nextStep >= 5,
      });
      const refreshed = await api.getCoachingSession(sessionData.session.id);
      setSessionData(refreshed);
      showToast?.(`Saved & moved to Step ${nextStep}`);
    } catch (err) {
      console.error(err);
      showToast?.('Could not update coaching step', true);
    }
  };

  if (loading || !sessionData) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Initializing 8-Step Engineering Mentor...
      </div>
    );
  }

  const { session, issue, step_guidance } = sessionData;
  const steps = [
    'Understand',
    'Investigate',
    'Learn',
    'Debug',
    'Implement',
    'Test',
    'Review',
    'Submit Prep',
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-bright)]">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">
            Personal Contribution Coaching Agent
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
            Issue #{issue.number}: <strong className="text-[var(--ink)]">{issue.title}</strong>
          </p>
        </div>
      </div>

      {/* 8-Step Interactive Progress Bar */}
      <div className="rounded-2xl border bg-[var(--surface)] p-3.5 shadow-apple">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {steps.map((name, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < session.current_step;
            const isCurrent = stepNum === session.current_step;

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => handleStepTransition(stepNum)}
                className={cn(
                  'relative rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer',
                  isCurrent
                    ? 'border-[var(--accent-bright)] bg-[var(--accent-soft)] text-[var(--ink)] shadow-apple'
                    : isCompleted
                      ? 'border-[color:var(--emerald)]/35 bg-[var(--emerald-soft)] text-[var(--emerald)]'
                      : 'bg-[var(--input-bg)] text-[var(--ink-muted)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
                )}
              >
                <div className="font-mono text-[10px] uppercase">Step {stepNum}</div>
                <div className="truncate text-[12px] font-semibold">{name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-[15px] font-semibold text-[var(--ink)]">
              Step {step_guidance.step}: {step_guidance.name}
            </h2>
            <Badge tone="accent" className="font-mono">
              MODE: {session.mode.toUpperCase()}
            </Badge>
          </div>

          <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 space-y-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
              Step Goal
            </div>
            <p className="text-[13px] font-medium text-[var(--ink)]">{step_guidance.goal}</p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Mentor Guidance
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border bg-[var(--input-bg)] p-4 font-mono text-[12px] leading-relaxed text-[var(--ink-secondary)]">
              {step_guidance.guidance}
            </pre>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[12.5px] font-semibold text-[var(--ink)]">
              Your Investigation Notes &amp; Hypotheses
            </label>
            <textarea
              value={stepNotes}
              onChange={(e) => setStepNotes(e.target.value)}
              placeholder="Document your observations, test outputs, or code findings..."
              className="h-24 w-full rounded-xl border bg-[var(--input-bg)] p-3 font-mono text-[12px] text-[var(--ink)] outline-none focus:border-[var(--accent-bright)]"
            />
          </div>

          {session.current_step >= 5 && (
            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-semibold text-[var(--ink)]">
                Draft Code Patch / Diff
              </label>
              <textarea
                value={patchDiff}
                onChange={(e) => setPatchDiff(e.target.value)}
                placeholder="Paste your unified diff or updated implementation..."
                className="h-32 w-full rounded-xl border bg-[var(--input-bg)] p-3 font-mono text-[12px] text-[var(--ink)] outline-none focus:border-[var(--accent-bright)]"
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleStepTransition(Math.max(1, session.current_step - 1))}
              disabled={session.current_step === 1}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous Step</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStepTransition(Math.min(8, session.current_step + 1))}
            >
              <span>{session.current_step === 8 ? 'Complete Session' : 'Save & Advance Step'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3">
            <h3 className="text-[14px] font-semibold text-[var(--ink)]">Target Problem</h3>
            <p className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
              {issue.body}
            </p>
          </section>

          <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3">
            <h3 className="text-[14px] font-semibold text-[var(--ink)]">Draft Commit &amp; PR Metadata</h3>
            <div className="space-y-1.5">
              <span className="font-mono text-[10.5px] uppercase text-[var(--ink-muted)]">Commit Message</span>
              <code className="block rounded-xl border bg-[var(--input-bg)] p-3 font-mono text-[12px] text-[var(--emerald)]">
                {session.pr_title_draft}
              </code>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
