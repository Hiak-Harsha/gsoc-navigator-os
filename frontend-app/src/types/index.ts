export interface User {
  id: number;
  name: string;
  email: string;
  education: string;
  university: string;
  graduation_year: number;
  academic_stage: string;
  github_username: string | null;
  interests: string;
  current_level: string;
  overall_readiness_score: number;
  current_stage: number;
  created_at: string;
  updated_at: string;
  skills: Skill[];
}

export interface Skill {
  id: number;
  user_id: number;
  name: string;
  category: string;
  estimated_level: number;
  verified_evidence: string | null;
  practical_experience: string | null;
  relevant_projects: string | null;
  weaknesses: string | null;
  recommended_tasks: string | null;
  last_assessed_at: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  website: string;
  gsoc_url: string | null;
  description: string | null;
  past_participation_years: string;
  is_confirmed_2027: boolean;
  confirmed_source_url: string | null;
  primary_languages: string;
  topics: string;
  community_channel: string | null;
  contribution_guide_url: string | null;
  ideas_list_url: string | null;
  fit_score: number;
  confidence_level: string;
  fit_reasons: string;
  skill_gaps: string;
  suggested_strategy: string | null;
  is_shortlisted: boolean;
  repositories: Repository[];
}

export interface Repository {
  id: number;
  organization_id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  description: string | null;
  primary_language: string | null;
  languages: string;
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  architecture_summary: string | null;
  entry_points: string;
  build_instructions: string | null;
  test_instructions: string | null;
  contribution_guide_summary: string | null;
}

export interface Issue {
  id: number;
  repository_id: number;
  number: number;
  title: string;
  html_url: string;
  body: string | null;
  state: string;
  labels: string;
  severity: "S0" | "S1" | "S2" | "S3" | "S4";
  difficulty: "L1" | "L2" | "L3" | "L4" | "L5";
  category: "start_now" | "stretch" | "advanced";
  match_score: number;
  match_rationale: string | null;
  required_skills: string;
  missing_skills: string;
  investigation_strategy: string | null;
  possible_direction: string | null;
  testing_requirements: string | null;
  edge_cases: string;
  estimated_effort_hours: number;
  learning_value: string | null;
  gsoc_relevance: string | null;
  is_actively_available: boolean;
}

export interface CoachingSession {
  id: number;
  issue_id: number;
  user_id: number;
  current_step: number;
  mode: "mentor" | "assistance";
  problem_summary: string | null;
  concepts: string;
  investigation_notes: string | null;
  hypotheses: string;
  root_cause_confirmed: boolean;
  root_cause_description: string | null;
  patch_diff: string | null;
  test_plan: string | null;
  review_feedback: string;
  pr_title_draft: string | null;
  pr_description_draft: string | null;
  is_completed: boolean;
}

export interface Contribution {
  id: number;
  user_id: number;
  repository_id: number;
  issue_id: number | null;
  pr_number: number;
  pr_title: string;
  pr_url: string;
  status: "draft" | "opened" | "changes_requested" | "approved" | "merged" | "closed";
  branch_name: string | null;
  commits_count: number;
  files_changed: string;
  lines_added: number;
  lines_deleted: number;
  review_comments_count: number;
  review_feedback_summary: string | null;
  code_quality_assessment: string | null;
  recurring_weaknesses_identified: string;
  demonstrated_skills: string;
  date_started: string;
  date_merged: string | null;
}

export interface Proposal {
  id: number;
  user_id: number;
  organization_id: number;
  title: string;
  project_idea_title: string | null;
  project_idea_url: string | null;
  status: string;
  version: number;
  abstract: string | null;
  problem_statement: string | null;
  proposed_solution: string | null;
  architecture_overview: string | null;
  weekly_milestones: string;
  deliverables: string;
  testing_strategy: string | null;
  risks_and_mitigation: string | null;
  prior_contributions: string;
  review_score: number;
  audit_warnings: string;
  strengths: string;
}

export interface MonitoredSource {
  id: number;
  name: string;
  url: string;
  category: string;
  is_official: boolean;
  check_interval_seconds: number;
  last_checked_at: string | null;
  current_version_summary: string | null;
  health_status: "active" | "delayed" | "failed" | "source_unavailable" | "manual_verification_required";
  error_details: string | null;
}

export interface Notification {
  id: number;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  summary: string;
  source_url: string | null;
  personal_impact: string | null;
  action_required: string | null;
  deadline: string | null;
  is_read: boolean;
  channel: string;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  priority: "critical" | "high" | "medium" | "low";
  reason: string | null;
  estimated_hours: number;
  deadline: string | null;
  status: "pending" | "in_progress" | "completed" | "deferred" | "rejected";
  completion_criteria: string | null;
  linked_entity_type: string | null;
  linked_entity_id: number | null;
}
