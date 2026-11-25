import React, { useEffect, useState } from 'react';
import { ArrowRight, Bug, Building2, Compass, ExternalLink, GitPullRequest, Search } from 'lucide-react';
import { NAV_ITEMS } from '../lib/navItems';
import { Badge } from './ui/Badge';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectView: (viewId: string) => void;
  contributions: any[];
  organizations: any[];
  issues: any[];
  onStartCoaching: (issueId: number) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  onSelectView,
  contributions,
  organizations,
  issues,
  onStartCoaching,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();

  const matchingViews = NAV_ITEMS.filter(
    (item) =>
      !q ||
      item.label.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      (item.keywords || '').toLowerCase().includes(q)
  ).slice(0, 6);

  const matchingPRs = contributions
    .filter(
      (c) =>
        !q ||
        String(c.pr_number).includes(q) ||
        (c.pr_title || '').toLowerCase().includes(q) ||
        (c.branch_name || '').toLowerCase().includes(q)
    )
    .slice(0, 4);

  const matchingOrgs = organizations
    .filter(
      (o) =>
        !q ||
        (o.name || '').toLowerCase().includes(q) ||
        (o.primary_languages || '').toLowerCase().includes(q)
    )
    .slice(0, 4);

  const matchingIssues = issues
    .filter(
      (i) =>
        !q ||
        String(i.number).includes(q) ||
        (i.title || '').toLowerCase().includes(q)
    )
    .slice(0, 4);

  const hasResults =
    matchingViews.length > 0 ||
    matchingPRs.length > 0 ||
    matchingOrgs.length > 0 ||
    matchingIssues.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 pt-[12vh] backdrop-blur-[3px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[92%] max-w-[640px] overflow-hidden rounded-xl border bg-[var(--surface)] shadow-2xl animate-fade-up">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 text-[var(--ink-muted)]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to any view, PR #, organization, or issue..."
            className="flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
          />
          <kbd className="rounded border bg-[var(--surface-elevated)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ink-muted)]">
            ESC
          </kbd>
        </div>

        <div className="thin-scroll max-h-[430px] overflow-y-auto p-2 space-y-3">
          {!hasResults && (
            <div className="py-10 text-center text-sm text-[var(--ink-muted)]">
              No matching views, PRs, organizations, or issues.
            </div>
          )}

          {matchingViews.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                Navigation Views
              </div>
              {matchingViews.map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      onSelectView(v.id);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--surface-elevated)] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 text-[var(--accent-bright)] shrink-0" />
                      <span className="truncate text-[13px] font-medium text-[var(--ink)]">{v.label}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[var(--ink-muted)]">
                      {v.section}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {matchingPRs.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                Tracked Pull Requests
              </div>
              {matchingPRs.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-[var(--surface-elevated)]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('contributions');
                      onClose();
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left cursor-pointer"
                  >
                    <GitPullRequest className="h-4 w-4 text-[var(--emerald)] shrink-0" />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-[var(--ink)]">
                        #{c.pr_number} · {c.pr_title}
                      </div>
                      <div className="truncate font-mono text-[10px] text-[var(--ink-muted)]">
                        {c.branch_name} · status: {c.status}
                      </div>
                    </div>
                  </button>
                  <a
                    href={c.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open PR on GitHub"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-[var(--surface)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {matchingOrgs.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                Organizations
              </div>
              {matchingOrgs.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    onSelectView('organizations');
                    onClose();
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--surface-elevated)] cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Building2 className="h-4 w-4 text-[var(--violet)] shrink-0" />
                    <span className="truncate text-[13px] font-medium text-[var(--ink)]">{org.name}</span>
                  </span>
                  <Badge tone="accent">Fit {org.fit_score}%</Badge>
                </button>
              ))}
            </div>
          )}

          {matchingIssues.length > 0 && (
            <div>
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                Indexed Issues
              </div>
              {matchingIssues.map((iss) => (
                <button
                  key={iss.id}
                  type="button"
                  onClick={() => {
                    onStartCoaching(iss.id);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--surface-elevated)] cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Bug className="h-4 w-4 text-[var(--amber)] shrink-0" />
                    <span className="truncate text-[13px] font-medium text-[var(--ink)]">
                      #{iss.number} · {iss.title}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--accent-bright)] shrink-0">
                    <Compass className="h-3 w-3" /> Coach
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
