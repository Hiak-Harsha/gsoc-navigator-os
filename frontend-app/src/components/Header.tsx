import React from 'react';
import { Bell, BellRing, Bot, PanelLeftOpen, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { ShimmerButton } from './magic/ShimmerButton';
import { cn } from '../lib/utils';

export interface HeaderProps {
  title: string;
  readinessScore: number;
  isSyncing: boolean;
  sidebarOpen: boolean;
  unreadNotifications: number;
  ollamaActive?: boolean;
  desktopAlertsEnabled?: boolean;
  onOpenSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenCopilot: () => void;
  onToggleDesktopAlerts: () => void;
  onRefresh: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  readinessScore,
  isSyncing,
  sidebarOpen,
  unreadNotifications,
  ollamaActive = false,
  desktopAlertsEnabled = false,
  onOpenSidebar,
  onOpenCommandPalette,
  onOpenCopilot,
  onToggleDesktopAlerts,
  onRefresh,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2.5 border-b bg-[var(--surface-glass)] px-5 py-3 backdrop-blur-xl">
      {/* Left: Sidebar Toggle + Command Search Pill */}
      <div className="flex min-w-[210px] flex-1 items-center gap-2.5 max-w-[480px]">
        {!sidebarOpen && (
          <Button
            variant="secondary"
            size="icon"
            title="Open Sidebar"
            aria-label="Open Sidebar"
            onClick={onOpenSidebar}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        )}

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-xl border bg-[var(--input-bg)] px-3 text-left transition-colors hover:border-[var(--border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bright)] cursor-pointer"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
            <span className="truncate text-[13px] text-[var(--ink-muted)]">
              <strong className="font-semibold text-[var(--ink)]">{title}</strong> · Jump to any view, PR, or issue...
            </span>
          </span>
          <kbd className="shrink-0 rounded border bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ink-muted)]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Copilot, Desktop Alerts, Readiness, Notifications & Sync */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Readiness Meter Pill */}
        <div className="hidden xl:flex items-center gap-2.5 rounded-lg border bg-[var(--surface)] px-3 min-h-[40px] shadow-apple">
          <ShieldCheck className="h-4 w-4 text-[var(--accent-bright)] shrink-0" />
          <div className="w-16 overflow-hidden rounded-full bg-[var(--input-bg)] h-1.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--emerald)] transition-all duration-500"
              style={{ width: `${Math.min(100, readinessScore)}%` }}
            />
          </div>
          <span className="font-mono text-[11.5px] font-semibold text-[var(--ink)]">{readinessScore}%</span>
        </div>

        <Button
          variant={ollamaActive ? 'emerald' : 'secondary'}
          onClick={onOpenCopilot}
          title="Open Ollama GSoC Copilot & Proactive Suggestions"
        >
          <Bot className="h-4 w-4" />
          <span>{ollamaActive ? 'Ollama Copilot' : 'AI Copilot'}</span>
        </Button>

        <Button
          variant="secondary"
          size="icon"
          title={desktopAlertsEnabled ? 'Desktop Notifications Active' : 'Enable Desktop PR Notifications'}
          aria-label="Toggle desktop notifications"
          onClick={onToggleDesktopAlerts}
          className={desktopAlertsEnabled ? 'border-[color:var(--emerald)]/40 text-[var(--emerald)]' : ''}
        >
          <BellRing className="h-4 w-4" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          title="Notifications Center"
          aria-label="Open notifications"
          onClick={onOpenNotifications}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--amber)] px-1 font-mono text-[9.5px] font-bold text-black">
              {unreadNotifications}
            </span>
          )}
        </Button>

        <ShimmerButton onClick={onRefresh} disabled={isSyncing}>
          <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
        </ShimmerButton>
      </div>
    </header>
  );
};
