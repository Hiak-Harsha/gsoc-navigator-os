import React from 'react';
import {
  Moon,
  PanelLeftClose,
  Settings,
  Sun,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NAV_ITEMS, type NavItem } from '../lib/navItems';

const SECTIONS: { key: NavItem['section']; label: string }[] = [
  { key: 'command', label: 'Command' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'application', label: 'Application' },
];

export interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  unreadCount: number;
  prCount?: number;
  orgCount?: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onCollapse?: () => void;
  userName?: string;
  userMeta?: string;
  readinessScore?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  unreadCount,
  prCount = 0,
  orgCount = 0,
  theme,
  onToggleTheme,
  onCollapse,
  userName = 'Madhava',
  userMeta = "GITAM · B.Tech CSE '28",
  readinessScore = 18.5,
}) => {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b bg-[var(--surface-glass)] backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-[256px] lg:border-r lg:border-b-0 z-20 select-none">
      {/* Apple × Microsoft Brand Header */}
      <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
        <div
          className="grid h-8 w-8 shrink-0 grid-cols-2 gap-0.5 rounded-lg border bg-[var(--surface)] p-1.5 shadow-apple"
          aria-hidden="true"
        >
          <span className="rounded-[2px] bg-[#D13438]" />
          <span className="rounded-[2px] bg-[#107C10]" />
          <span className="rounded-[2px] bg-[#0067B8]" />
          <span className="rounded-[2px] bg-[#FFB900]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold tracking-tight text-[var(--ink)]">
            GSoC Navigator
          </div>
          <div className="truncate font-mono text-[10.5px] text-[var(--ink-muted)]">
            OS 2027 · Readiness {readinessScore}%
          </div>
        </div>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            title="Close sidebar"
            aria-label="Close sidebar"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-[var(--surface-elevated)] text-[var(--ink-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--ink)] cursor-pointer"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grouped Navigation */}
      <nav className="thin-scroll flex-1 overflow-y-auto px-2.5 py-3" aria-label="GSoC Navigation">
        {SECTIONS.map((sec, sIdx) => {
          const items = NAV_ITEMS.filter((i) => i.section === sec.key);
          return (
            <div key={sec.key} className={sIdx > 0 ? 'mt-4' : ''}>
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
                {sec.label}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  let count: number | undefined;
                  let tone: 'neutral' | 'amber' | 'emerald' | 'accent' = 'neutral';

                  if (item.id === 'notifications' && unreadCount > 0) {
                    count = unreadCount;
                    tone = 'amber';
                  } else if (item.id === 'contributions' && prCount > 0) {
                    count = prCount;
                    tone = 'emerald';
                  } else if (item.id === 'organizations' && orgCount > 0) {
                    count = orgCount;
                    tone = 'accent';
                  }

                  return (
                    <NavRow
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      count={count}
                      tone={tone}
                      active={currentView === item.id}
                      onClick={() => onSelectView(item.id)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Compact Footer Controls */}
      <div className="space-y-2 border-t p-2.5">
        <div className="flex items-center justify-between rounded-lg border bg-[var(--surface)] px-3 py-2 shadow-apple">
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold text-[var(--ink)]">{userName}</div>
            <div className="truncate font-mono text-[10px] text-[var(--ink-muted)]">{userMeta}</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--emerald-soft)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--emerald)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)]" />
            STAGE 1
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border bg-[var(--surface)] px-2 text-[12px] font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)] cursor-pointer transition-colors"
          >
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            <span>{theme === 'light' ? 'Space Gray' : 'Light Gray'}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectView('settings')}
            className={cn(
              'flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border px-2 text-[12px] font-medium cursor-pointer transition-colors',
              currentView === 'settings'
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-bright)]'
                : 'bg-[var(--surface)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

interface NavRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  active: boolean;
  tone?: 'neutral' | 'amber' | 'emerald' | 'accent';
  onClick: () => void;
}

function NavRow({ icon: Icon, label, count, active, tone = 'neutral', onClick }: NavRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex min-h-[36px] w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer',
        active
          ? 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--ink)] shadow-apple'
          : 'border-transparent text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]'
      )}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[var(--accent)]"
        />
      )}
      <span className="flex min-w-0 items-center gap-2 pl-0.5">
        <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-[var(--accent-bright)]' : 'text-[var(--ink-muted)]')} />
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined && (
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-semibold',
            tone === 'amber' && 'bg-[var(--amber-soft)] text-[var(--amber)]',
            tone === 'emerald' && 'bg-[var(--emerald-soft)] text-[var(--emerald)]',
            tone === 'accent' && 'bg-[var(--accent-soft)] text-[var(--accent-bright)]',
            tone === 'neutral' && 'text-[var(--ink-muted)]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
