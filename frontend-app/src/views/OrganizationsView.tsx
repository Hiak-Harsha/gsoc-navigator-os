import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Bookmark, BookmarkCheck, Building2, Check, ExternalLink } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Sheet } from '../components/ui/Sheet';
import { cn, safeParseJson } from '../lib/utils';

export interface OrganizationsViewProps {
  onNavigate: (view: string) => void;
  showToast?: (msg: string, error?: boolean) => void;
}

export const OrganizationsView: React.FC<OrganizationsViewProps> = ({ onNavigate, showToast }) => {
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
      showToast?.('Failed to load organizations', true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShortlist = async (orgId: number) => {
    try {
      const res = await api.toggleShortlist(orgId);
      setOrganizations((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, is_shortlisted: res.is_shortlisted } : o))
      );
      showToast?.(res.is_shortlisted ? 'Organization shortlisted' : 'Removed from shortlist');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to toggle shortlist', true);
    }
  };

  const handleToggleCompare = (orgId: number) => {
    if (selectedOrgs.includes(orgId)) {
      setSelectedOrgs(selectedOrgs.filter((id) => id !== orgId));
    } else {
      if (selectedOrgs.length >= 3) {
        showToast?.('You can compare up to 3 organizations at once', true);
        return;
      }
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
      showToast?.('Comparison failed', true);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Discovering GSoC mentoring organizations...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-bright)]">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">
              Organization Discovery &amp; Fit Engine
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
              Compatibility scoring across your stack, community responsiveness, and past GSoC slot consistency.
            </p>
          </div>
        </div>
        {selectedOrgs.length >= 2 && (
          <Button variant="primary" onClick={handleRunComparison}>
            Compare Selected ({selectedOrgs.length})
          </Button>
        )}
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {organizations.map((org) => {
          const languages = safeParseJson<string[]>(org.primary_languages, []);
          const topics = safeParseJson<string[]>(org.topics, []);
          const fitReasons = safeParseJson<string[]>(org.fit_reasons, []);
          const yearsCount = safeParseJson<any[]>(org.past_participation_years, []).length;
          const isSelected = selectedOrgs.includes(org.id);

          return (
            <article
              key={org.id}
              className={cn(
                'flex flex-col justify-between rounded-2xl border bg-[var(--surface)] p-5 shadow-apple transition-all hover:border-[var(--border-strong)] space-y-4',
                org.is_shortlisted && 'border-[color:var(--accent-bright)]/50'
              )}
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[16px] font-bold text-[var(--ink)]">{org.name}</h2>
                      <Badge tone="accent" className="font-mono">
                        Fit {org.fit_score}%
                      </Badge>
                      <Badge tone="amber" className="text-[10.5px]">
                        2027 Pending Feb
                      </Badge>
                    </div>
                    <div className="font-mono text-[11px] text-[var(--ink-muted)]">
                      {yearsCount} past GSoC editions
                    </div>
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] text-[var(--accent-bright)] hover:underline"
                    >
                      <span className="truncate">{org.website}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant={isSelected ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleCompare(org.id)}
                    >
                      {isSelected ? 'Comparing' : 'Compare'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleToggleShortlist(org.id)}
                      title={org.is_shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                      className={cn(
                        'min-h-[34px] min-w-[34px]',
                        org.is_shortlisted && 'text-[var(--amber)] border-[color:var(--amber)]/40 bg-[var(--amber-soft)]'
                      )}
                    >
                      {org.is_shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <p className="text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">{org.description}</p>

                {/* Strategic Targets */}
                <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="amber">{org.portfolio_role || 'Primary Target'}</Badge>
                      <Badge tone="emerald">{org.annual_slots || '10-18 slots/yr'}</Badge>
                      <Badge tone="neutral">{org.competition_level || 'Medium'}</Badge>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-[var(--accent-bright)]">
                      Target: {org.target_contributions_required || 3} Merged PRs
                    </span>
                  </div>
                  <div className="rounded-lg border bg-[var(--surface)] px-3 py-2 text-[11.5px] text-[var(--ink-secondary)]">
                    <strong className="text-[var(--ink)]">Selection Strategy: </strong>
                    {org.contribution_breakdown || '1 Starter Bug Fix (L1/L2) + 1 Subsystem PR (L3) + Proposal Draft'}
                  </div>
                </div>

                {/* Stack Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((lang, idx) => (
                    <Badge key={`l-${idx}`} tone="accent" className="font-mono">
                      {lang}
                    </Badge>
                  ))}
                  {topics.map((top, idx) => (
                    <Badge key={`t-${idx}`} tone="neutral" className="font-mono">
                      {top}
                    </Badge>
                  ))}
                </div>

                {/* Fit Rationale */}
                {fitReasons.length > 0 && (
                  <div className="rounded-xl border bg-[var(--input-bg)] p-3 space-y-1.5">
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                      Fit Rationale
                    </div>
                    <ul className="space-y-1">
                      {fitReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[12px] text-[var(--ink-secondary)]">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--emerald)]" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <a
                  href={org.contribution_guide_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent-bright)] hover:underline"
                >
                  <span>Contributing Guidelines</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Button variant="secondary" size="sm" onClick={() => onNavigate('repositories')}>
                  Explore Codebase
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Sheet */}
      <Sheet
        open={Boolean(comparison)}
        onClose={() => setComparison(null)}
        eyebrow="Organization Fit Engine"
        title="Side-by-Side Comparison"
        widthClass="max-w-[720px]"
      >
        {comparison && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {comparison.map((c) => (
              <div key={c.id} className="rounded-xl border bg-[var(--surface-elevated)] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-[var(--ink)]">{c.name}</h3>
                  <Badge tone="accent" className="font-mono">
                    {c.fit_score}% Fit
                  </Badge>
                </div>
                <div className="text-[12px] text-[var(--ink-secondary)]">
                  <strong className="text-[var(--ink)]">Languages:</strong> {c.languages?.join(', ')}
                </div>
                <div className="text-[12px] text-[var(--ink-secondary)]">
                  <strong className="text-[var(--ink)]">Skill Gaps:</strong>{' '}
                  {c.skill_gaps?.length ? c.skill_gaps.join(', ') : 'None identified'}
                </div>
                <div className="font-mono text-[11px] text-[var(--ink-muted)]">
                  Channel: {c.community_channel || 'Official Mailing List / Discourse'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  );
};
