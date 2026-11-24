import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Building2,
  FolderGit2,
  GitPullRequest,
  Bug,
  GraduationCap,
  Code2,
  Sparkles,
  Lightbulb,
  FileText,
  CalendarDays,
  Bell,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  unreadCount: number;
}

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'gsoc-intel', label: 'GSoC Intelligence', icon: Compass },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
  { id: 'contributions', label: 'Contributions', icon: GitPullRequest },
  { id: 'issues', label: 'Issue Explorer', icon: Bug },
  { id: 'mentor', label: 'Contribution Mentor', icon: GraduationCap },
  { id: 'prs', label: 'Pull Requests', icon: Code2 },
  { id: 'skills', label: 'Skill Development', icon: Sparkles },
  { id: 'project-ideas', label: 'Project Ideas', icon: Lightbulb },
  { id: 'proposals', label: 'Proposal Studio', icon: FileText },
  { id: 'timeline', label: 'Timeline & Deadlines', icon: CalendarDays },
  { id: 'notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, unreadCount }) => {
  return (
    <aside className="w-64 bg-[#0d1322] border-r border-[#1e293b] flex flex-col h-screen fixed left-0 top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e293b] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg shadow-sm">
          G
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-wide text-white leading-tight">GSoC Navigator</h1>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
            OS 2027 v1.0
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
          Execution & Intelligence
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#162032]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badgeKey === 'notifications' && unreadCount > 0 && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Status Footer */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0a0f1d]">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-medium text-slate-200">Madhava</div>
            <div className="text-[10px] text-slate-400 font-mono">GITAM • B.Tech CSE '28</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-emerald-400">STAGE 1</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
