import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeTone = 'neutral' | 'accent' | 'emerald' | 'amber' | 'violet' | 'rose';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--surface-elevated)] text-[var(--ink-secondary)] border-[var(--border-hairline)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-bright)] border-[color:var(--accent-bright)]/30',
  emerald: 'bg-[var(--emerald-soft)] text-[var(--emerald)] border-[color:var(--emerald)]/30',
  amber: 'bg-[var(--amber-soft)] text-[var(--amber)] border-[color:var(--amber)]/35',
  violet: 'bg-[var(--violet-soft)] text-[var(--violet)] border-[color:var(--violet)]/35',
  rose: 'bg-[var(--rose-soft)] text-[var(--rose)] border-[color:var(--rose)]/35',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = 'neutral', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-tight',
        TONES[tone] || TONES.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
