import React from 'react';
import {
  Bell,
  Bug,
  Building2,
  CalendarDays,
  Code2,
  Compass,
  FileText,
  FolderGit2,
  GitPullRequest,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: 'command' | 'discovery' | 'engineering' | 'application';
  keywords?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Command Center', icon: LayoutDashboard, section: 'command', keywords: 'home dashboard briefing tasks' },
  { id: 'contributions', label: 'Live PR Sentinel', icon: GitPullRequest, section: 'command', keywords: 'prs github ci monitor masterclass' },
  { id: 'gsoc-intel', label: 'GSoC Intelligence', icon: Compass, section: 'command', keywords: 'rules eligibility official faq' },
  { id: 'notifications', label: 'Notifications', icon: Bell, section: 'command', keywords: 'alerts updates deadlines' },

  { id: 'organizations', label: 'Organizations', icon: Building2, section: 'discovery', keywords: 'sympy sunpy cern shortlist fit' },
  { id: 'repositories', label: 'Repositories', icon: FolderGit2, section: 'discovery', keywords: 'codebase architecture build test' },
  { id: 'issues', label: 'Issue Explorer', icon: Bug, section: 'discovery', keywords: 'bugs severity difficulty start now' },
  { id: 'project-ideas', label: 'Project Ideas', icon: Lightbulb, section: 'discovery', keywords: 'ideas archive topics' },

  { id: 'mentor', label: 'Contribution Mentor', icon: GraduationCap, section: 'engineering', keywords: 'coaching steps guide root cause' },
  { id: 'prs', label: 'PR Reviewer', icon: Code2, section: 'engineering', keywords: 'diff audit antipatterns lint' },
  { id: 'skills', label: 'Skill Profile', icon: Sparkles, section: 'engineering', keywords: 'evidence python c git' },

  { id: 'proposals', label: 'Proposal Studio', icon: FileText, section: 'application', keywords: 'milestones buffer draft audit' },
  { id: 'timeline', label: 'Timeline & Deadlines', icon: CalendarDays, section: 'application', keywords: 'schedule calendar dates' },
];
