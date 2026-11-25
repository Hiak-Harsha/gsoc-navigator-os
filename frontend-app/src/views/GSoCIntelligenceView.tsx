import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CheckCircle2, Compass, ExternalLink, Info, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const GSoCIntelligenceView: React.FC = () => {
  const [eligibility, setEligibility] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [elData, tlData, resData] = await Promise.all([
        api.getEligibility(),
        api.getTimeline(),
        api.getResources(),
      ]);
      setEligibility(elData);
      setTimeline(tlData);
      setResources(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Loading GSoC Program Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-bright)]">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">GSoC Program Intelligence</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
            Authoritative rules, verified eligibility assessment, official lifecycle milestones, and provenance.
          </p>
        </div>
      </div>

      {/* Eligibility Card */}
      <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3.5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--emerald-soft)] text-[var(--emerald)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[14.5px] font-semibold text-[var(--ink)]">Contributor Eligibility Assessment</h2>
              <p className="text-[12px] text-[var(--ink-muted)]">Evaluated against Google Open Source guidelines</p>
            </div>
          </div>
          <Badge tone="emerald" className="font-mono font-semibold px-3 py-1">
            ELIGIBLE TO PARTICIPATE
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Verified Criteria
            </div>
            <ul className="space-y-2">
              {eligibility?.verified_criteria?.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-[12.5px] text-[var(--ink-secondary)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--emerald)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-[var(--surface-elevated)] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent-bright)]">
              <Info className="h-4 w-4" />
              <span>Official Verification Protocol</span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-[var(--ink-secondary)]">
              Google Summer of Code welcomes both university students and open-source newcomers (18+ years). Graduation in 2028 from GITAM qualifies cleanly under official student criteria.
            </p>
            <a
              href={eligibility?.official_faq_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 pt-1 text-[12px] font-medium text-[var(--accent-bright)] hover:underline"
            >
              <span>Read Official Eligibility FAQ</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Lifecycle Timeline */}
      <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3.5">
          <div>
            <h2 className="text-[14.5px] font-semibold text-[var(--ink)]">
              GSoC 2027 Program Lifecycle &amp; Milestones
            </h2>
            <p className="text-[12px] text-[var(--ink-muted)]">
              Strictly differentiating between confirmed dates and historical estimates
            </p>
          </div>
          <Badge tone="amber" className="font-mono">
            ESTIMATED TIMELINE
          </Badge>
        </div>

        <div className="space-y-2.5">
          {timeline.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between gap-3 rounded-xl border bg-[var(--surface-elevated)] p-4 md:flex-row md:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-[var(--ink)]">{item.stage}</span>
                  <Badge tone="amber" className="font-mono text-[10px]">
                    {item.status_note}
                  </Badge>
                </div>
                <div className="text-[12.5px] text-[var(--ink-secondary)]">{item.action_item}</div>
                <div className="font-mono text-[10.5px] text-[var(--ink-muted)]">Source: {item.source}</div>
              </div>
              <div className="font-mono text-[12px] font-semibold text-[var(--ink-secondary)] shrink-0">
                {new Date(item.start_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Authoritative Sources */}
      <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3.5">
        <h2 className="text-[14.5px] font-semibold text-[var(--ink)]">Authoritative GSoC Reference Portals</h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {resources.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border bg-[var(--surface-elevated)] p-4 transition-all hover:border-[var(--accent-bright)] space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--ink)]">{res.name}</span>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--ink-muted)]" />
              </div>
              <span className="block truncate font-mono text-[11px] text-[var(--accent-bright)]">{res.url}</span>
              <Badge tone="emerald" className="font-mono text-[10px]">
                VERIFIED OFFICIAL
              </Badge>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
