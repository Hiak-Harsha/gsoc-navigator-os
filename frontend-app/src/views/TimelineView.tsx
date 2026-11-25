import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CalendarDays } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const TimelineView: React.FC = () => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const data = await api.getTimeline();
      setTimeline(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Loading timeline schedule...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-bright)]">
          <CalendarDays className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">Timeline &amp; Milestone Tracker</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
            Timezone-aware GSoC 2027 program schedule verified against official calendars with clear planning estimates.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {timeline.map((item, idx) => (
          <article
            key={idx}
            className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-2 transition-all hover:border-[var(--border-strong)]"
          >
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-soft)] font-mono text-[11px] font-bold text-[var(--accent-bright)]">
                  {idx + 1}
                </span>
                <h2 className="text-[14.5px] font-bold text-[var(--ink)]">{item.stage}</h2>
                <Badge tone="amber" className="font-mono text-[10.5px]">
                  {item.status_note}
                </Badge>
              </div>
              <div className="font-mono text-[12px] font-semibold text-[var(--ink-secondary)]">
                {new Date(item.start_date).toLocaleDateString()} — {new Date(item.end_date).toLocaleDateString()}
              </div>
            </div>

            <p className="text-[13px] text-[var(--ink-secondary)]">{item.action_item}</p>
            <div className="font-mono text-[10.5px] text-[var(--ink-muted)]">
              Source Provenance: {item.source}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
