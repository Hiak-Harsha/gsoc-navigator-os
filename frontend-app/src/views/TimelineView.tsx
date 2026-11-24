import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CalendarDays, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading timeline schedule...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Timeline & Milestone Tracker</h1>
        <p className="text-xs text-slate-400 mt-1">
          Timezone-aware GSoC 2027 program timeline. Dates are verified against official calendars and clearly flagged as planning estimates.
        </p>
      </div>

      <div className="space-y-4">
        {timeline.map((item, idx) => (
          <div key={idx} className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-mono text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <h2 className="text-sm font-bold text-white">{item.stage}</h2>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800/40 px-2 py-0.5 rounded">
                  {item.status_note}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300">
                {new Date(item.start_date).toLocaleDateString()} — {new Date(item.end_date).toLocaleDateString()}
              </div>
            </div>

            <p className="text-xs text-slate-300">{item.action_item}</p>
            <div className="text-[10px] text-slate-500 font-mono">Source Provenance: {item.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
