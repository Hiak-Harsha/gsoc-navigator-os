from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProposalBase(BaseModel):
    organization_id: int
    title: str
    project_idea_title: Optional[str] = None
    project_idea_url: Optional[str] = None
    status: str = "draft"
    version: int = 1
    abstract: Optional[str] = None
    problem_statement: Optional[str] = None
    proposed_solution: Optional[str] = None
    architecture_overview: Optional[str] = None
    weekly_milestones: str = "[]"
    deliverables: str = "[]"
    testing_strategy: Optional[str] = None
    risks_and_mitigation: Optional[str] = None
    prior_contributions: str = "[]"
    review_score: float = 0.0
    audit_warnings: str = "[]"
    strengths: str = "[]"

class ProposalCreate(ProposalBase):
    pass

class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    problem_statement: Optional[str] = None
    proposed_solution: Optional[str] = None
    architecture_overview: Optional[str] = None
    weekly_milestones: Optional[str] = None
    deliverables: Optional[str] = None
    testing_strategy: Optional[str] = None
    risks_and_mitigation: Optional[str] = None
    prior_contributions: Optional[str] = None
    status: Optional[str] = None

class ProposalOut(ProposalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProposalAuditResult(BaseModel):
    review_score: float
    audit_warnings: List[str]
    strengths: List[str]
    readiness_summary: str
