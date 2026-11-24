from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ContributionBase(BaseModel):
    repository_id: int
    issue_id: Optional[int] = None
    pr_number: int
    pr_title: str
    pr_url: str
    status: str = "opened"
    branch_name: Optional[str] = None
    commits_count: int = 1
    files_changed: str = "[]"
    lines_added: int = 0
    lines_deleted: int = 0
    review_comments_count: int = 0
    review_feedback_summary: Optional[str] = None
    code_quality_assessment: Optional[str] = None
    recurring_weaknesses_identified: str = "[]"
    demonstrated_skills: str = "[]"
    learning_breakdown: Optional[str] = None

class ContributionCreate(ContributionBase):
    pass

class ContributionUpdate(BaseModel):
    status: Optional[str] = None
    commits_count: Optional[int] = None
    files_changed: Optional[str] = None
    lines_added: Optional[int] = None
    lines_deleted: Optional[int] = None
    review_comments_count: Optional[int] = None
    review_feedback_summary: Optional[str] = None
    code_quality_assessment: Optional[str] = None
    recurring_weaknesses_identified: Optional[str] = None
    demonstrated_skills: Optional[str] = None
    date_merged: Optional[datetime] = None

class ContributionOut(ContributionBase):
    id: int
    user_id: int
    date_started: datetime
    date_merged: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PRReviewRequest(BaseModel):
    pr_number: int
    repository_id: int
    diff_or_code: Optional[str] = None
