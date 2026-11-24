const API_BASE = '/api';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {}
    throw new Error(`API Error (${response.status}): ${errorDetail}`);
  }

  return response.json();
}

export const api = {
  // Dashboard & Command Center
  getOverview: () => apiFetch<any>('/dashboard/overview'),
  getBriefing: () => apiFetch<any>('/dashboard/briefing'),
  getWeeklyReview: () => apiFetch<any>('/dashboard/weekly-review'),
  getTasks: () => apiFetch<any[]>('/dashboard/tasks'),
  updateTaskStatus: (id: number, status: string) => apiFetch<any>(`/dashboard/tasks/${id}/status?status=${status}`, { method: 'POST' }),

  // User Profile & Living Skills
  getProfile: () => apiFetch<any>('/profile'),
  updateProfile: (data: any) => apiFetch<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  addSkill: (data: any) => apiFetch<any>('/profile/skills', { method: 'POST', body: JSON.stringify(data) }),

  // GSoC Intelligence & Timeline
  getEligibility: () => apiFetch<any>('/gsoc/eligibility'),
  getTimeline: () => apiFetch<any[]>('/gsoc/timeline'),
  getResources: () => apiFetch<any[]>('/gsoc/resources'),

  // Organizations
  getOrganizations: () => apiFetch<any[]>('/organizations'),
  toggleShortlist: (id: number) => apiFetch<any>(`/organizations/${id}/shortlist`, { method: 'POST' }),
  compareOrganizations: (ids: number[]) => apiFetch<any[]>('/organizations/compare', { method: 'POST', body: JSON.stringify({ org_ids: ids }) }),

  // Repositories
  getRepository: (id: number) => apiFetch<any>(`/repositories/${id}`),
  getRepositoryTree: (id: number) => apiFetch<any>(`/repositories/${id}/tree`),

  // Issues & Bug Classifier
  getIssues: (params?: { category?: string; severity?: string; difficulty?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any[]>(`/issues${q ? `?${q}` : ''}`);
  },
  syncIssues: (repoId: number) => apiFetch<any>(`/issues/sync/${repoId}`, { method: 'POST' }),

  // Coaching Workflow (8 steps)
  startCoaching: (issueId: number, mode: string = 'mentor') => apiFetch<any>('/coaching/start', { method: 'POST', body: JSON.stringify({ issue_id: issueId, mode }) }),
  getCoachingSession: (sessionId: number) => apiFetch<any>(`/coaching/${sessionId}`),
  updateCoachingStep: (sessionId: number, data: any) => apiFetch<any>(`/coaching/${sessionId}/step`, { method: 'POST', body: JSON.stringify(data) }),

  // Contributions & PR Intelligence
  getContributions: () => apiFetch<any[]>('/contributions'),
  auditPR: (data: { pr_number: number; repository_id: number; diff_or_code: string }) => apiFetch<any>('/contributions/audit-pr', { method: 'POST', body: JSON.stringify(data) }),
  logFeedback: (id: number, feedback: string, newStatus: string) => apiFetch<any>(`/contributions/${id}/feedback?feedback_text=${encodeURIComponent(feedback)}&new_status=${encodeURIComponent(newStatus)}`, { method: 'POST' }),

  // Proposals
  getProposals: () => apiFetch<any[]>('/proposals'),
  getProposal: (id: number) => apiFetch<any>(`/proposals/${id}`),
  createProposal: (data: any) => apiFetch<any>('/proposals', { method: 'POST', body: JSON.stringify(data) }),
  updateProposal: (id: number, data: any) => apiFetch<any>(`/proposals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  auditProposal: (id: number) => apiFetch<any>(`/proposals/${id}/audit`, { method: 'POST' }),

  // Monitoring & Notifications
  getSources: () => apiFetch<any[]>('/monitoring/sources'),
  triggerCheck: () => apiFetch<any>('/monitoring/check', { method: 'POST' }),
  getNotifications: (unreadOnly: boolean = false) => apiFetch<any[]>(`/monitoring/notifications?unread_only=${unreadOnly}`),
  markNotificationRead: (id: number) => apiFetch<any>(`/monitoring/notifications/${id}/read`, { method: 'PUT' })
};
