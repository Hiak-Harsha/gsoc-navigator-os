import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Bell, Check, ExternalLink, AlertTriangle, Info } from 'lucide-react';

export const NotificationsView: React.FC = () => {
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
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading notifications...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Persistent Notification Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-side change detection: critical policy updates, deadline shifts, and organization opportunities.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No pending notifications. Background monitoring is running.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-xl border space-y-2 transition-all ${
                notif.is_read ? 'bg-[#0f172a] border-slate-800 opacity-70' : 'bg-[#121a2d] border-[#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    notif.priority === 'critical' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                    notif.priority === 'high' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                    'bg-blue-950 text-blue-300 border-blue-800'
                  }`}>
                    {notif.priority}
                  </span>
                  <h2 className="text-xs font-bold text-white">{notif.title}</h2>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Read</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{notif.summary}</p>
              {notif.action_required && (
                <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                  Action Required: {notif.action_required}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
