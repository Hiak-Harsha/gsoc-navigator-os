from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class IssueBase(BaseModel):
    number: int
    title: str
    html_url: str
    body: Optional[str] = None
    state: str = "open"
    labels: str = "[]"
    severity: str = "S2" # S0 to S4
    difficulty: str = "L2" # L1 to L5
    category: str = "start_now" # start_now, stretch, advanced
    match_score: float = 70.0
    match_rationale: Optional[str] = None
    required_skills: str = "[]"
    missing_skills: str = "[]"
    relevant_files: str = "[]"
    investigation_strategy: Optional[str] = None
    possible_direction: Optional[str] = None
    testing_requirements: Optional[str] = None
    edge_cases: str = "[]"
    estimated_effort_hours: float = 4.0
    learning_value: Optional[str] = None
    gsoc_relevance: Optional[str] = None
    is_actively_available: bool = True

class IssueOut(IssueBase):
    id: int
    repository_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CoachingSessionCreate(BaseModel):
    issue_id: int
    mode: str = "mentor"

class CoachingStepUpdate(BaseModel):
    step: int
    notes: Optional[str] = None
    hypotheses: Optional[List[str]] = None
    root_cause_confirmed: Optional[bool] = None
    root_cause_description: Optional[str] = None
    patch_diff: Optional[str] = None
    test_plan: Optional[str] = None
    mode: Optional[str] = None

class CoachingSessionOut(BaseModel):
    id: int
    issue_id: int
    user_id: int
    current_step: int
    mode: str
    problem_summary: Optional[str] = None
    concepts: str = "[]"
    investigation_notes: Optional[str] = None
    hypotheses: str = "[]"
    root_cause_confirmed: bool = False
    root_cause_description: Optional[str] = None
    patch_diff: Optional[str] = None
    test_plan: Optional[str] = None
    review_feedback: str = "[]"
    pr_title_draft: Optional[str] = None
    pr_description_draft: Optional[str] = None
    is_completed: bool = False
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
