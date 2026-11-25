import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  Cpu,
  ExternalLink,
  GitBranch,
  GitMerge,
  GitPullRequest,
  LayoutGrid,
  Lightbulb,
  List,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { BentoCard } from '../components/magic/BentoCard';
import { NumberTicker } from '../components/magic/NumberTicker';
import { ShimmerButton } from '../components/magic/ShimmerButton';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Sheet } from '../components/ui/Sheet';
import { cn, safeParseJson } from '../lib/utils';

export interface ContributionsViewProps {
  showToast?: (msg: string, error?: boolean) => void;
}

export const ContributionsView: React.FC<ContributionsViewProps> = ({ showToast }) => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveReports, setLiveReports] = useState<Record<number, any>>({});
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('gn_pr_view_mode');
    return saved === 'list' ? 'list' : 'grid';
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'merged'>('all');
  const [selectedPR, setSelectedPR] = useState<any | null>(null);
  const [masterclassTab, setMasterclassTab] = useState<'blueprint' | 'rootcause' | 'testing' | 'interview'>('blueprint');

  useEffect(() => {
    localStorage.setItem('gn_pr_view_mode', viewMode);
  }, [viewMode]);

  const syncLiveStatus = async () => {
    try {
      setSyncing(true);
      const res = await api.syncPRLiveStatus();
      if (res && res.reports) {
        const map: Record<number, any> = {};
        res.reports.forEach((r: any) => {
          map[r.pr_number] = r;
        });
        setLiveReports(map);
      }
      setLastSynced(new Date().toLocaleTimeString());
      const data = await api.getContributions();
      setContributions(data);
    } catch (err) {
      console.error('Failed to sync live PR status:', err);
      showToast?.('Could not sync GitHub live PR status', true);
    } finally {
      setSyncing(false);
    }
  };

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

  useEffect(() => {
    loadContributions();
    syncLiveStatus();
    const interval = setInterval(syncLiveStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      const live = liveReports[c.pr_number] || {};
      const isMerged = c.status === 'merged' || live.is_merged;
      if (statusFilter === 'merged') return isMerged;
      if (statusFilter === 'open') return !isMerged;
      return true;
    });
  }, [contributions, liveReports, statusFilter]);

  const mergedCount = contributions.filter((c) => c.status === 'merged' || liveReports[c.pr_number]?.is_merged).length;
  const hasMergedPR = mergedCount > 0;
  const passingPRs = contributions.filter((c) => {
    const live = liveReports[c.pr_number];
    return live && live.ci_total > 0 && live.ci_passed === live.ci_total;
  }).length;

  const openMasterclassSheet = (contrib: any) => {
    setMasterclassTab('blueprint');
    setSelectedPR(contrib);
  };

  if (loading && contributions.length === 0) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Loading Live PR Sentinel &amp; Masterclass Intelligence...
      </div>
    );
  }

  const selectedLive = selectedPR ? liveReports[selectedPR.pr_number] || {} : {};
  const selectedFiles = selectedPR ? safeParseJson<string[]>(selectedPR.files_changed, []) : [];
  const selectedSkills = selectedPR ? safeParseJson<string[]>(selectedPR.demonstrated_skills, []) : [];
  const selectedMasterclass = selectedPR ? safeParseJson<any>(selectedPR.learning_breakdown, null) : null;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Merged Celebratory Alert */}
      {hasMergedPR && (
        <div className="flex items-center gap-3 rounded-xl border border-[color:var(--violet)]/40 bg-[var(--violet-soft)] p-4 text-[var(--ink)] shadow-apple">
          <Sparkles className="h-5 w-5 shrink-0 text-[var(--violet)] animate-pulse" />
          <div className="text-[12.5px]">
            <strong className="font-semibold text-[var(--violet)]">Contribution Merged!</strong> Your code has officially landed upstream—a decisive proof point for your GSoC portfolio.
          </div>
        </div>
      )}

      {/* Bento Live Sentinel Header */}
      <section className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-12">
        <BentoCard className="md:col-span-2 xl:col-span-6 flex flex-col justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-20 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #0067B8 0%, #107C10 60%, #5E5CE6 100%)' }}
          />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--emerald)] animate-ping" />
                <span>Live PR Sentinel &amp; CI Watcher</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <span className="text-3xl font-bold tracking-tight text-[var(--ink)]">
                  <NumberTicker value={contributions.length} />
                </span>
                <span className="text-[12.5px] text-[var(--ink-muted)]">
                  tracked upstream pull requests (60s auto-polling)
                </span>
              </div>
            </div>

            <ShimmerButton
              onClick={() => {
                syncLiveStatus();
                showToast?.('Synchronizing GitHub PR CI telemetry...');
              }}
              disabled={syncing}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', syncing && 'animate-spin')} />
              <span>{syncing ? 'Syncing...' : 'Sync GitHub'}</span>
            </ShimmerButton>
          </div>

          {/* Protocol Compliance Gates */}
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border bg-[var(--input-bg)] px-3 py-2 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-[var(--ink-secondary)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-bright)]" /> Protocol Gates:
            </span>
            <Badge tone="emerald">
              <CheckCircle className="h-3 w-3" /> AI Disclosure
            </Badge>
            <Badge tone="emerald">
              <CheckCircle className="h-3 w-3" /> .mailmap Verified
            </Badge>
            <Badge tone="emerald">
              <CheckCircle className="h-3 w-3" /> Unit &amp; Doctests
            </Badge>
            <Badge tone="emerald">
              <CheckCircle className="h-3 w-3" /> Changelog Added
            </Badge>
          </div>
        </BentoCard>

        <BentoCard className="xl:col-span-3 flex flex-col justify-between" onClick={() => setStatusFilter('open')}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
              CI Verified Healthy
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--emerald-soft)] text-[var(--emerald)]">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[var(--ink)]">
              <NumberTicker value={passingPRs} />
            </span>
            <Badge tone="emerald">Green Checks</Badge>
          </div>
          <div className="mt-3 text-[11px] text-[var(--ink-muted)]">
            {lastSynced ? `Last checked at ${lastSynced}` : 'Live GitHub REST API telemetry'}
          </div>
        </BentoCard>

        <BentoCard className="xl:col-span-3 flex flex-col justify-between" onClick={() => setStatusFilter('merged')}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
              Landed Upstream
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--violet-soft)] text-[var(--violet)]">
              <GitMerge className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[var(--ink)]">
              <NumberTicker value={mergedCount} />
            </span>
            <Badge tone={mergedCount > 0 ? 'violet' : 'neutral'}>
              {mergedCount > 0 ? 'Merged' : 'In Review'}
            </Badge>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
            <Clock className="h-3 w-3" />
            <span>Open any card below for its Masterclass</span>
          </div>
        </BentoCard>
      </section>

      {/* Workspace Navigator Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px] font-medium text-[var(--ink-muted)]">
          Showing <span className="font-semibold text-[var(--ink)]">{filteredContributions.length}</span> of{' '}
          {contributions.length} pull requests
          {statusFilter !== 'all' && ` · ${statusFilter}`}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status segmented pills */}
          <div className="inline-flex rounded-lg border bg-[var(--surface)] p-1 shadow-apple">
            {(['all', 'open', 'merged'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  'rounded-md px-3 py-1 text-[12px] font-medium capitalize transition-colors cursor-pointer',
                  statusFilter === st
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                )}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Grid / List View Switcher (exact match to Workspace Navigator) */}
          <div className="inline-flex rounded-lg border bg-[var(--surface)] p-1 shadow-apple">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="List view"
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md cursor-pointer',
                viewMode === 'list'
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PR Cards Grid / List (Modeled cleanly on Workspace Navigator ProjectCard) */}
      <section
        className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
            : 'flex flex-col gap-2.5'
        )}
      >
        {filteredContributions.map((contrib) => {
          const live = liveReports[contrib.pr_number] || {};
          const files = safeParseJson<string[]>(contrib.files_changed, []);
          const skills = safeParseJson<string[]>(contrib.demonstrated_skills, []);
          const masterclass = safeParseJson<any>(contrib.learning_breakdown, null);
          const isMerged = contrib.status === 'merged' || live.is_merged;
          const isApproved = contrib.status === 'approved';
          const hasFailures = (live.ci_failed || 0) > 0;
          const allPassed = live.ci_total > 0 && live.ci_passed === live.ci_total;

          const ciTone = isMerged
            ? 'violet'
            : allPassed
              ? 'emerald'
              : hasFailures
                ? 'amber'
                : 'accent';

          return (
            <article
              key={contrib.id}
              className={cn(
                'group rounded-2xl border bg-[var(--surface)] shadow-apple transition-all duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] animate-fade-up',
                viewMode === 'list'
                  ? 'flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between'
                  : 'flex min-w-0 flex-col justify-between p-5 space-y-4'
              )}
            >
              <div className={cn('min-w-0', viewMode === 'list' && 'flex-1 space-y-1')}>
                {/* Top Metadata Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="accent" className="font-mono font-semibold">
                      {isMerged ? <GitMerge className="h-3 w-3" /> : <GitPullRequest className="h-3 w-3" />}
                      PR #{contrib.pr_number}
                    </Badge>
                    <Badge tone={ciTone} className="font-mono uppercase">
                      {isMerged ? 'Merged' : isApproved ? 'Approved' : contrib.status}
                    </Badge>
                    {live.ci_total !== undefined && (
                      <Badge tone={allPassed ? 'emerald' : hasFailures ? 'amber' : 'neutral'} className="font-mono">
                        CI {live.ci_passed}/{live.ci_total}
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-[var(--ink-muted)]">
                    +{contrib.lines_added} / -{contrib.lines_deleted}
                  </span>
                </div>

                {/* PR Title */}
                <button
                  type="button"
                  onClick={() => openMasterclassSheet(contrib)}
                  className="block w-full text-left text-[15px] font-semibold leading-snug text-[var(--ink)] hover:text-[var(--accent-bright)] cursor-pointer"
                >
                  {contrib.pr_title}
                </button>

                {/* Branch & Alerts */}
                <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-[var(--ink-muted)] truncate">
                  <GitBranch className="h-3 w-3 shrink-0" />
                  <span className="truncate">{contrib.branch_name || 'main'}</span>
                  <span>· {contrib.commits_count} commit(s)</span>
                </div>

                {viewMode === 'grid' && (
                  <>
                    {live.alerts && live.alerts.length > 0 && (
                      <div className="mt-3 rounded-lg border bg-[var(--input-bg)] px-3 py-2 text-[11.5px] text-[var(--ink-secondary)]">
                        {live.alerts[0]}
                      </div>
                    )}

                    {/* Files & Skills Preview */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {files.slice(0, 2).map((f, i) => (
                        <Badge key={i} tone="neutral" className="font-mono text-[10.5px] max-w-full truncate">
                          {f}
                        </Badge>
                      ))}
                      {skills.slice(0, 3).map((s, i) => (
                        <Badge key={`sk-${i}`} tone="accent" className="text-[10.5px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Card Footer Actions */}
              <div
                className={cn(
                  'flex items-center gap-2 shrink-0',
                  viewMode === 'grid' && 'border-t pt-3 justify-between'
                )}
              >
                {masterclass ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openMasterclassSheet(contrib)}
                    className={viewMode === 'grid' ? 'flex-1' : ''}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Open Masterclass</span>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openMasterclassSheet(contrib)}
                    className={viewMode === 'grid' ? 'flex-1' : ''}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Inspect Details</span>
                  </Button>
                )}

                <a
                  href={contrib.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border bg-[var(--surface-elevated)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                >
                  <span>GitHub</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          );
        })}
      </section>

      {/* Slide-Over Masterclass & Inspection Sheet (Workspace Navigator PreviewSheet UX) */}
      <Sheet
        open={Boolean(selectedPR)}
        onClose={() => setSelectedPR(null)}
        eyebrow={selectedPR ? `PR #${selectedPR.pr_number} · ${selectedPR.branch_name || 'upstream'}` : undefined}
        title={selectedPR?.pr_title || ''}
        subtitle={selectedPR?.pr_url}
        widthClass="max-w-[780px]"
        headerActions={
          selectedPR && (
            <>
              <Badge tone={selectedLive.is_merged || selectedPR.status === 'merged' ? 'violet' : 'emerald'}>
                Status: {selectedLive.is_merged ? 'Merged' : selectedPR.status}
              </Badge>
              {selectedLive.ci_total !== undefined && (
                <Badge tone={selectedLive.ci_passed === selectedLive.ci_total ? 'emerald' : 'amber'}>
                  CI Checks: {selectedLive.ci_passed}/{selectedLive.ci_total} passing
                </Badge>
              )}
              <a
                href={selectedPR.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border bg-[var(--surface)] px-3 text-[12px] font-semibold text-[var(--accent-bright)] hover:border-[var(--border-strong)]"
              >
                <span>Open on GitHub</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </>
          )
        }
      >
        {selectedPR && (
          <div className="space-y-5">
            {selectedPR.review_feedback_summary && (
              <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--amber)]">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Live CI &amp; Maintainer Triage Status</span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
                  {selectedPR.review_feedback_summary}
                </p>
              </div>
            )}

            {/* Changed Files & Skills */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 space-y-2">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Subsystem Files Changed
                </div>
                <ul className="space-y-1 font-mono text-[11.5px] text-[var(--ink-secondary)]">
                  {selectedFiles.map((file, idx) => (
                    <li key={idx} className="truncate">
                      • {file}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 space-y-2">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Demonstrated Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((skill, idx) => (
                    <Badge key={idx} tone="accent">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 4-Tab Engineer's Masterclass */}
            {selectedMasterclass && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border bg-[var(--input-bg)] p-1">
                  {[
                    { id: 'blueprint', label: '1. Solve Without AI' },
                    { id: 'rootcause', label: '2. Root Cause & Fix' },
                    { id: 'testing', label: '3. Testing Strategy' },
                    { id: 'interview', label: '4. Maintainer Defense' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMasterclassTab(tab.id as any)}
                      className={cn(
                        'flex-1 rounded-lg px-2.5 py-2 font-mono text-[11.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap',
                        masterclassTab === tab.id
                          ? 'bg-[var(--surface)] text-[var(--ink)] shadow-apple border border-[var(--border-hairline)]'
                          : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {masterclassTab === 'blueprint' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-[var(--surface-elevated)] p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>What Was Broken &amp; Real World Impact</span>
                      </div>
                      <p className="text-[12.5px] leading-relaxed text-[var(--ink)]">
                        {selectedMasterclass.what_was_broken}
                      </p>
                      <p className="border-t pt-2 text-[12px] italic leading-relaxed text-[var(--ink-muted)]">
                        <strong className="not-italic text-[var(--ink-secondary)]">Impact:</strong>{' '}
                        {selectedMasterclass.real_world_impact}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--amber)]">
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span>Step-by-Step Blueprint to Solve Without AI</span>
                      </div>
                      {selectedMasterclass.how_to_solve_without_ai?.map((step: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex gap-3 rounded-xl border bg-[var(--surface)] p-3 text-[12.5px] leading-relaxed text-[var(--ink-secondary)]"
                        >
                          <span className="font-mono font-bold text-[var(--accent-bright)] shrink-0">
                            {idx + 1}.
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {masterclassTab === 'rootcause' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-[var(--surface-elevated)] p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--violet)]">
                        <Cpu className="h-3.5 w-3.5" />
                        <span>Technical Root Cause Analysis</span>
                      </div>
                      <p className="text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
                        {selectedMasterclass.root_cause_analysis}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-[var(--surface-elevated)] p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--emerald)]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Solution &amp; Line-by-Line Rationale</span>
                      </div>
                      <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
                        {selectedMasterclass.code_solution_explained}
                      </p>
                    </div>
                  </div>
                )}

                {masterclassTab === 'testing' && (
                  <div className="rounded-xl border bg-[var(--surface-elevated)] p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-bright)]">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Testing &amp; Verification Strategy</span>
                    </div>
                    <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
                      {selectedMasterclass.testing_strategy}
                    </p>
                  </div>
                )}

                {masterclassTab === 'interview' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--emerald)]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Maintainer Defense &amp; Interview Talking Points</span>
                    </div>
                    <p className="text-[12px] text-[var(--ink-muted)]">
                      If a GSoC mentor asks:{' '}
                      <span className="italic text-[var(--ink)]">
                        "Can you walk me through your contribution to this repository?"
                      </span>
                    </p>
                    <div className="space-y-2">
                      {selectedMasterclass.interview_talking_points?.map((point: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-[color:var(--emerald)]/30 bg-[var(--emerald-soft)] p-3 text-[12.5px] text-[var(--ink)]"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--emerald)]" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
};
