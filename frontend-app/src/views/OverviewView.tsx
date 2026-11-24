import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  GitPullRequest,
  Building2,
  ListTodo
} from 'lucide-react';

export const OverviewView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<any>(null);
  const [briefing, setBriefing] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ovData, bfData, taskData] = await Promise.all([
        api.getOverview(),
        api.getBriefing(),
        api.getTasks()
      ]);
      setOverview(ovData);
      setBriefing(bfData);
      setTasks(taskData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading execution command center...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Today's Strategic Focus */}
      <div className="bg-gradient-to-r from-[#131f37] to-[#0f172a] border border-[#253755] rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-400 font-semibold tracking-wide uppercase">
                {briefing?.date}
              </span>
              <span className="text-[11px] font-mono bg-blue-900/40 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded">
                {briefing?.current_stage}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Where You Stand Today & What to Execute Next
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Targeting <span className="text-blue-300 font-medium">GSoC 2027</span>. Current focus: establishing local repository builds, reproducing confirmed issues, and achieving verified pull request merges.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('issues')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>Explore Start-Now Issues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121a2d] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Overall Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{overview?.user?.readiness_score}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Evidence-based progression (Stage 1)</div>
        </div>

        <div className="bg-[#121a2d] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Shortlisted Orgs</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{overview?.stats?.shortlisted_orgs}</div>
          <div className="text-[11px] text-slate-400 mt-1">High compatibility target orgs</div>
        </div>

        <div className="bg-[#121a2d] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Tracked PRs</span>
            <GitPullRequest className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{overview?.stats?.total_contributions}</div>
          <div className="text-[11px] text-slate-400 mt-1">Live synchronized on GitHub</div>
        </div>

        <div className="bg-[#121a2d] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Tasks</span>
            <ListTodo className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{overview?.stats?.pending_tasks}</div>
          <div className="text-[11px] text-slate-400 mt-1">Prioritized engineering actions</div>
        </div>
      </div>

      {/* Main Execution Split: Tasks & Today's Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prioritized Task Engine */}
        <div className="lg:col-span-2 bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Prioritized Task Engine</h3>
              <p className="text-[11px] text-slate-400">High-leverage engineering actions ranked by GSoC preparation impact</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{tasks.filter(t => t.status === 'completed').length} / {tasks.length} Completed</span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id, task.status)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                    isDone
                      ? 'bg-[#0f172a]/60 border-slate-800 opacity-60'
                      : 'bg-[#162238] border-[#253755] hover:border-blue-500/50'
                  }`}
                >
                  <button className="mt-0.5 text-slate-400 hover:text-blue-400">
                    <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                        task.priority === 'critical' ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40' :
                        task.priority === 'high' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40' :
                        'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.estimated_hours}h estimated
                      </span>
                      {task.completion_criteria && (
                        <span>Criteria: {task.completion_criteria}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Daily Intelligence Briefing & Alert Stream */}
        <div className="space-y-6">
          <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Daily Intelligence Briefing</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#162238] border border-[#253755] rounded-lg p-3">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">GSoC 2027 Status</span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  Historical planning estimates active. Official 2027 timeline and mentoring org applications expected in Jan/Feb 2027.
                </p>
              </div>

              <div className="bg-[#162238] border border-[#253755] rounded-lg p-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Immediate Recommendation</span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  Focus on <strong className="text-white">SymPy</strong>: 7+ years GSoC participant, Python stack match, and 3 open beginner issues indexed.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Monitoring Health</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Official GSoC Portal</span>
                <span className="font-mono text-[11px] text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Student Guide</span>
                <span className="font-mono text-[11px] text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Open Source FAQ</span>
                <span className="font-mono text-[11px] text-emerald-400">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
