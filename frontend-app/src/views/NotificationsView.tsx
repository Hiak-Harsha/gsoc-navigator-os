import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Bell, Check } from 'lucide-react';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export interface NotificationsViewProps {
  showToast?: (msg: string, error?: boolean) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ showToast }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      showToast?.('Notification marked as read');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to update notification', true);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Loading persistent notification center...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amber-soft)] text-[var(--amber)]">
          <Bell className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">Persistent Notification Center</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
            Server-side change detection: PR status updates, policy notices, deadline shifts, and org announcements.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border bg-[var(--surface)] py-16 text-center text-[13px] text-[var(--ink-muted)] shadow-apple">
            No pending notifications. Background PR &amp; GSoC monitoring is active.
          </div>
        ) : (
          notifications.map((notif) => {
            const pTone: BadgeTone =
              notif.priority === 'critical'
                ? 'rose'
                : notif.priority === 'high'
                  ? 'amber'
                  : 'accent';

            return (
              <article
                key={notif.id}
                className={cn(
                  'rounded-2xl border p-5 shadow-apple space-y-2.5 transition-all',
                  notif.is_read ? 'bg-[var(--input-bg)] opacity-65' : 'bg-[var(--surface)]'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={pTone} className="font-mono uppercase text-[10px]">
                      {notif.priority}
                    </Badge>
                    <h2 className="text-[14px] font-bold text-[var(--ink)]">{notif.title}</h2>
                  </div>

                  {!notif.is_read && (
                    <Button variant="secondary" size="sm" onClick={() => handleMarkRead(notif.id)}>
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark as Read</span>
                    </Button>
                  )}
                </div>

                <p className="text-[13px] leading-relaxed text-[var(--ink-secondary)]">{notif.summary}</p>
                {notif.action_required && (
                  <div className="rounded-xl border border-[color:var(--emerald)]/30 bg-[var(--emerald-soft)] px-3 py-2 font-mono text-[11.5px] text-[var(--ink)]">
                    Action Required: {notif.action_required}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
