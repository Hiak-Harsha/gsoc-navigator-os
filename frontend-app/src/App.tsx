import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { api } from './api/client';
import { cn } from './lib/utils';

// Views
import { OverviewView } from './views/OverviewView';
import { GSoCIntelligenceView } from './views/GSoCIntelligenceView';
import { OrganizationsView } from './views/OrganizationsView';
import { RepositoriesView } from './views/RepositoriesView';
import { ContributionsView } from './views/ContributionsView';
import { IssueExplorerView } from './views/IssueExplorerView';
import { ContributionMentorView } from './views/ContributionMentorView';
import { PullRequestsView } from './views/PullRequestsView';
import { SkillDevelopmentView } from './views/SkillDevelopmentView';
import { ProjectIdeasView } from './views/ProjectIdeasView';
import { ProposalStudioView } from './views/ProposalStudioView';
import { TimelineView } from './views/TimelineView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';

export function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('gn_theme_v2');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem('gn_sidebar_open') !== 'false');
  const [cmdOpen, setCmdOpen] = useState(false);

  const [readinessScore, setReadinessScore] = useState(18.5);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [contributions, setContributions] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [activeCoachingIssueId, setActiveCoachingIssueId] = useState<number | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error: boolean; visible: boolean }>({
    msg: '',
    error: false,
    visible: false,
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(theme);
    localStorage.setItem('gn_theme_v2', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('gn_sidebar_open', String(sidebarOpen));
  }, [sidebarOpen]);

  const showToast = useCallback((msg: string, error = false) => {
    setToast({ msg, error, visible: true });
    window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
  }, []);

  const refreshCoreState = useCallback(async () => {
    try {
      const [profile, notifs, contribs, orgs, issueList] = await Promise.all([
        api.getProfile(),
        api.getNotifications(true),
        api.getContributions().catch(() => []),
        api.getOrganizations().catch(() => []),
        api.getIssues().catch(() => []),
      ]);
      if (profile) {
        setUserProfile(profile);
        if (profile.overall_readiness_score !== undefined) {
          setReadinessScore(profile.overall_readiness_score);
        }
      }
      setUnreadNotifications(notifs.length);
      setContributions(contribs);
      setOrganizations(orgs);
      setIssues(issueList);
    } catch (err) {
      console.error('Error refreshing core state:', err);
    }
  }, []);

  useEffect(() => {
    refreshCoreState();
  }, [currentView, refreshCoreState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleGlobalSync = async () => {
    try {
      setIsSyncing(true);
      await Promise.all([api.triggerCheck(), api.syncPRLiveStatus().catch(() => null)]);
      await refreshCoreState();
      showToast('Synchronized GitHub PR Sentinel & GSoC Monitors');
    } catch (err: any) {
      showToast(err?.message || 'Synchronization failed', true);
    } finally {
      setIsSyncing(false);
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'overview':
        return 'Command Center';
      case 'gsoc-intel':
        return 'GSoC Intelligence';
      case 'organizations':
        return 'Organizations';
      case 'repositories':
        return 'Repositories';
      case 'contributions':
        return 'Live PR Sentinel';
      case 'issues':
        return 'Issue Explorer';
      case 'mentor':
        return 'Contribution Mentor';
      case 'prs':
        return 'PR Quality Reviewer';
      case 'skills':
        return 'Skill Profile';
      case 'project-ideas':
        return 'Project Ideas';
      case 'proposals':
        return 'Proposal Studio';
      case 'timeline':
        return 'Timeline & Deadlines';
      case 'notifications':
        return 'Notifications';
      case 'settings':
        return 'Settings';
      default:
        return 'GSoC Navigator OS';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--canvas)] text-[var(--ink)] lg:flex-row">
      {sidebarOpen && (
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          unreadCount={unreadNotifications}
          prCount={contributions.length}
          orgCount={organizations.filter((o) => o.is_shortlisted).length}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onCollapse={() => setSidebarOpen(false)}
          userName={userProfile?.name || 'Madhava'}
          userMeta={userProfile ? `${userProfile.university || 'GITAM'} · '${String(userProfile.graduation_year || 2028).slice(-2)}` : "GITAM · B.Tech CSE '28"}
          readinessScore={readinessScore}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={getViewTitle()}
          readinessScore={readinessScore}
          isSyncing={isSyncing}
          sidebarOpen={sidebarOpen}
          unreadNotifications={unreadNotifications}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCommandPalette={() => setCmdOpen(true)}
          onRefresh={handleGlobalSync}
          onOpenNotifications={() => setCurrentView('notifications')}
        />

        <main className="mx-auto w-full max-w-[1460px] flex-1 p-5 sm:p-6">
          {currentView === 'overview' && (
            <OverviewView onNavigate={setCurrentView} showToast={showToast} />
          )}
          {currentView === 'gsoc-intel' && <GSoCIntelligenceView />}
          {currentView === 'organizations' && (
            <OrganizationsView onNavigate={setCurrentView} showToast={showToast} />
          )}
          {currentView === 'repositories' && <RepositoriesView />}
          {currentView === 'contributions' && <ContributionsView showToast={showToast} />}
          {currentView === 'issues' && (
            <IssueExplorerView
              onStartCoaching={(issueId) => {
                setActiveCoachingIssueId(issueId);
                setCurrentView('mentor');
              }}
            />
          )}
          {currentView === 'mentor' && <ContributionMentorView activeIssueId={activeCoachingIssueId} showToast={showToast} />}
          {currentView === 'prs' && <PullRequestsView showToast={showToast} />}
          {currentView === 'skills' && <SkillDevelopmentView />}
          {currentView === 'project-ideas' && <ProjectIdeasView onNavigate={setCurrentView} />}
          {currentView === 'proposals' && <ProposalStudioView showToast={showToast} />}
          {currentView === 'timeline' && <TimelineView />}
          {currentView === 'notifications' && <NotificationsView showToast={showToast} />}
          {currentView === 'settings' && <SettingsView showToast={showToast} />}
        </main>
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelectView={setCurrentView}
        contributions={contributions}
        organizations={organizations}
        issues={issues}
        onStartCoaching={(issueId) => {
          setActiveCoachingIssueId(issueId);
          setCurrentView('mentor');
        }}
      />

      {/* Fluent-Apple Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed bottom-5 right-5 z-[110] rounded-lg border bg-[var(--surface-elevated)] px-4 py-2.5 text-[13px] font-medium shadow-xl transition-all duration-200',
          toast.error ? 'border-[var(--rose)] text-[var(--rose)]' : 'border-[var(--accent-bright)] text-[var(--ink)]',
          toast.visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        )}
      >
        {toast.msg}
      </div>
    </div>
  );
}

export default App;
