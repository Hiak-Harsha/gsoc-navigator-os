import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { getSmartSuggestions } from '../api/ollamaBridge';
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  GitBranch,
  GitPullRequest,
  Layers,
  ListTodo,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { BentoCard } from '../components/magic/BentoCard';
import { NumberTicker } from '../components/magic/NumberTicker';
import { ShimmerButton } from '../components/magic/ShimmerButton';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export interface OverviewViewProps {
  onNavigate: (view: string) => void;
  onOpenCopilot?: () => void;
  showToast?: (msg: string, error?: boolean) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenCopilot,
  showToast,
}) => {
  const [overview, setOverview] = useState<any>(null);
  const [briefing, setBriefing] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ovData, bfData, taskData, contribData, aiData] = await Promise.all([
        api.getOverview(),
        api.getBriefing(),
        api.getTasks(),
        api.getContributions().catch(() => []),
        getSmartSuggestions().catch(() => null),
      ]);
      setOverview(ovData);
      setBriefing(bfData);
      setTasks(taskData);
      setContributions(contribData);
      setAiSuggestions(aiData);
    } catch (err) {
      console.error(err);
      showToast?.('Failed to load Command Center metrics', true);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      showToast?.(newStatus === 'completed' ? 'Task marked completed' : 'Task reopened');
    } catch (err) {
      console.error(err);
      showToast?.('Could not update task status', true);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Synchronizing GSoC Command Center &amp; Ollama Telemetry...
      </div>
    );
  }

  const readiness = Number(overview?.user?.readiness_score ?? 0);
  const shortlisted = Number(overview?.stats?.shortlisted_orgs ?? 0);
  const totalContribs = Number(overview?.stats?.total_contributions ?? contributions.length);
  const pendingTasks = Number(overview?.stats?.pending_tasks ?? tasks.filter((t) => t.status !== 'completed').length);
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const mergedCount = contributions.filter((c) => c.status === 'merged').length;
  const openCount = Math.max(0, totalContribs - mergedCount);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Apple × Microsoft Bento Overview Grid */}
      <section aria-label="GSoC Bento Overview" className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-12">
        <BentoCard className="md:col-span-2 xl:col-span-6 flex flex-col justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'linear-gradient(135deg, #0067B8 0%, #107C10 55%, #FFB900 100%)',
            }}
          />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                <Layers className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                <span>GSoC 2027 Command</span>
                {briefing?.current_stage && <Badge tone="accent">{briefing.current_stage}</Badge>}
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-3xl font-bold tracking-tight text-[var(--ink)]">
                  <NumberTicker value={readiness} decimals={1} />%
                </span>
                <span className="text-[12.5px] text-[var(--ink-muted)]">
                  readiness across {totalContribs} live PRs &amp; {shortlisted} target orgs
                </span>
              </div>
            </div>

            <ShimmerButton onClick={() => onNavigate('issues')}>
              <span>Explore Issues</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </ShimmerButton>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--input-bg)]">
              <div
                className="h-full bg-[#0067B8]"
                style={{ width: `${Math.min(50, Math.max(12, readiness))}%` }}
              />
              <div
                className="h-full bg-[#107C10]"
                style={{ width: `${Math.min(35, Math.max(10, totalContribs * 8))}%` }}
              />
              <div
                className="h-full bg-[#FFB900]"
                style={{ width: `${Math.min(25, Math.max(8, shortlisted * 7))}%` }}
              />
              <div
                className="h-full bg-[#5e5ce6]"
                style={{ width: `${Math.min(20, Math.max(6, completedTasks * 6))}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--ink-muted)]">
              <span>{briefing?.date || 'Active Preparation Cycle'}</span>
              <span>
                {completedTasks}/{tasks.length} tasks done
              </span>
            </div>
          </div>

          {contributions.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-lg border bg-[var(--input-bg)] py-1.5">
              <div className="animate-marquee gap-2 px-2">
                {[...contributions, ...contributions].map((pr, idx) => (
                  <button
                    key={`${pr.id}-${idx}`}
                    type="button"
                    onClick={() => onNavigate('contributions')}
                    className="inline-flex items-center gap-1.5 rounded-md border bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--ink-secondary)] hover:border-[var(--accent-bright)] hover:text-[var(--ink)] cursor-pointer whitespace-nowrap"
                  >
                    <GitBranch
                      className={cn(
                        'h-3 w-3',
                        pr.status === 'merged' ? 'text-[var(--violet)]' : 'text-[var(--emerald)]'
                      )}
                    />
                    <span className="font-mono font-semibold text-[var(--accent-bright)]">#{pr.pr_number}</span>
                    <span className="max-w-[180px] truncate font-medium">{pr.branch_name || pr.pr_title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </BentoCard>

        <BentoCard className="xl:col-span-3 flex flex-col justify-between" onClick={() => onNavigate('organizations')}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
              Shortlisted Orgs
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-bright)]">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-3xl font-bold tracking-tight text-[var(--ink)]">
              <NumberTicker value={shortlisted} />
            </span>
            <Badge tone="accent">Fit Engine Active</Badge>
          </div>
          <div className="mt-3 text-[11px] text-[var(--ink-muted)]">
            High compatibility Python &amp; scientific computing targets
          </div>
        </BentoCard>

        <BentoCard className="xl:col-span-3 flex flex-col justify-between" onClick={() => onNavigate('contributions')}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
              Tracked PRs
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--emerald-soft)] text-[var(--emerald)]">
              <GitPullRequest className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-3xl font-bold tracking-tight text-[var(--ink)]">
              <NumberTicker value={totalContribs} />
            </span>
            <Badge tone={mergedCount > 0 ? 'violet' : 'emerald'}>
              {mergedCount > 0 ? `${mergedCount} merged` : 'Live GitHub Sync'}
            </Badge>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex h-1 w-full overflow-hidden rounded-full bg-[var(--input-bg)]">
              <div
                className="h-full bg-[var(--violet)]"
                style={{ width: `${totalContribs ? Math.round((mergedCount / totalContribs) * 100) : 0}%` }}
              />
              <div
                className="h-full bg-[var(--emerald)]"
                style={{ width: `${totalContribs ? Math.round((openCount / totalContribs) * 100) : 100}%` }}
              />
            </div>
            <div className="text-[11px] text-[var(--ink-muted)]">
              {openCount} open in CI · {mergedCount} landed upstream
            </div>
          </div>
        </BentoCard>
      </section>

      {/* Main Execution Split */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: Prioritized Task Engine */}
        <section className="lg:col-span-2 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--amber-soft)] text-[var(--amber)]">
                <ListTodo className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">Prioritized Task Engine</h2>
                <p className="text-[11.5px] text-[var(--ink-muted)]">
                  High-leverage engineering actions ranked by GSoC preparation impact
                </p>
              </div>
            </div>
            <Badge tone="neutral" className="font-mono">
              {pendingTasks} pending · {completedTasks}/{tasks.length} done
            </Badge>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isDone = task.status === 'completed';
              const priorityTone =
                task.priority === 'critical' ? 'rose' : task.priority === 'high' ? 'amber' : 'accent';

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleTaskToggle(task.id, task.status)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer',
                    isDone
                      ? 'bg-[var(--input-bg)] opacity-60'
                      : 'bg-[var(--surface-elevated)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]'
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      isDone ? 'text-[var(--emerald)]' : 'text-[var(--ink-muted)]'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'text-[13px] font-semibold',
                          isDone ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink)]'
                        )}
                      >
                        {task.title}
                      </span>
                      <Badge tone={priorityTone} className="uppercase font-mono text-[10px]">
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-[12px] text-[var(--ink-secondary)] line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-4 font-mono text-[10.5px] text-[var(--ink-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {task.estimated_hours}h est.
                      </span>
                      {task.completion_criteria && <span>Criteria: {task.completion_criteria}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Column: Ollama Copilot Suggestions + Monitoring Health */}
        <div className="space-y-5">
          <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-[var(--emerald)]" />
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">Ollama Copilot Advisor</h2>
              </div>
              {aiSuggestions?.generated_by && (
                <Badge tone={String(aiSuggestions.generated_by).includes('ollama') ? 'emerald' : 'accent'} className="font-mono text-[10px]">
                  {aiSuggestions.generated_by}
                </Badge>
              )}
            </div>

            {aiSuggestions ? (
              <div className="space-y-2.5">
                <div className="rounded-xl border bg-[var(--surface-elevated)] p-3 space-y-1">
                  <div className="text-[12.5px] font-semibold text-[var(--ink)]">
                    {aiSuggestions.headline}
                  </div>
                  <div className="text-[11.5px] text-[var(--accent-bright)]">
                    Next: {aiSuggestions.priority_action}
                  </div>
                </div>

                {aiSuggestions.suggestions?.slice(0, 2).map((s: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => s.action_view && onNavigate(s.action_view)}
                    className="block w-full rounded-xl border bg-[var(--input-bg)] p-3 text-left transition-colors hover:border-[var(--border-strong)] cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-[var(--ink)]">{s.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)]" />
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-[var(--ink-secondary)] line-clamp-2">{s.reason}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 space-y-1">
                <Badge tone="accent">Immediate Focus</Badge>
                <p className="pt-1 text-[12px] leading-relaxed text-[var(--ink-secondary)]">
                  Keep SymPy, SunPy, and CERN-HSF CI suites green and verify bot policy gates.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button variant="primary" size="sm" onClick={onOpenCopilot || (() => onNavigate('contributions'))}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask Ollama Copilot</span>
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-[14px] font-semibold text-[var(--ink)]">Monitoring Health</h2>
              <TrendingUp className="h-4 w-4 text-[var(--emerald)]" />
            </div>
            <div className="space-y-2.5 text-[12.5px]">
              {['Official GSoC Portal', 'Student Guide', 'Open Source FAQ', 'GitHub REST CI Watcher'].map((src) => (
                <div key={src} className="flex items-center justify-between text-[var(--ink-secondary)]">
                  <span>{src}</span>
                  <Badge tone="emerald" className="font-mono text-[10px]">
                    ACTIVE
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
