import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { api } from './api/client';

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
  const [readinessScore, setReadinessScore] = useState(18.5);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeCoachingIssueId, setActiveCoachingIssueId] = useState<number | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    refreshCoreState();
  }, [currentView]);

  const refreshCoreState = async () => {
    try {
      const [profile, notifs] = await Promise.all([
        api.getProfile(),
        api.getNotifications(true)
      ]);
      if (profile?.overall_readiness_score !== undefined) {
        setReadinessScore(profile.overall_readiness_score);
      }
      setUnreadNotifications(notifs.length);
    } catch (err) {
      console.error("Error refreshing core state:", err);
    }
  };

  const handleGlobalSync = async () => {
    try {
      setIsSyncing(true);
      await api.triggerCheck();
      await refreshCoreState();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'overview': return 'Command Center';
      case 'gsoc-intel': return 'GSoC Intelligence & Verification';
      case 'organizations': return 'Organization Discovery & Fit Engine';
      case 'repositories': return 'Repository Intelligence & Explorer';
      case 'contributions': return 'Live Contribution Tracking';
      case 'issues': return 'Intelligent Issue Explorer';
      case 'mentor': return 'Personal Contribution Coach';
      case 'prs': return 'Pull Request Quality Intelligence';
      case 'skills': return 'Living Skill Profile & Evidence';
      case 'project-ideas': return 'GSoC Project Ideas';
      case 'proposals': return 'GSoC Proposal Development Studio';
      case 'timeline': return 'Program Timeline & Deadlines';
      case 'notifications': return 'Persistent Notification Center';
      case 'settings': return 'System Settings';
      default: return 'GSoC Navigator OS';
    }
  };

  return (
    <div className="flex bg-[#0b0f19] min-h-screen text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        unreadCount={unreadNotifications}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header
          title={getViewTitle()}
          readinessScore={readinessScore}
          isSyncing={isSyncing}
          onRefresh={handleGlobalSync}
        />

        <main className="flex-1 pb-16">
          {currentView === 'overview' && <OverviewView onNavigate={setCurrentView} />}
          {currentView === 'gsoc-intel' && <GSoCIntelligenceView />}
          {currentView === 'organizations' && <OrganizationsView onNavigate={setCurrentView} />}
          {currentView === 'repositories' && <RepositoriesView />}
          {currentView === 'contributions' && <ContributionsView />}
          {currentView === 'issues' && (
            <IssueExplorerView
              onStartCoaching={(issueId) => {
                setActiveCoachingIssueId(issueId);
                setCurrentView('mentor');
              }}
            />
          )}
          {currentView === 'mentor' && <ContributionMentorView activeIssueId={activeCoachingIssueId} />}
          {currentView === 'prs' && <PullRequestsView />}
          {currentView === 'skills' && <SkillDevelopmentView />}
          {currentView === 'project-ideas' && <ProjectIdeasView onNavigate={setCurrentView} />}
          {currentView === 'proposals' && <ProposalStudioView />}
          {currentView === 'timeline' && <TimelineView />}
          {currentView === 'notifications' && <NotificationsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default App;
