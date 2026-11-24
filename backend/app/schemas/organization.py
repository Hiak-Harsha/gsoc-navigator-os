from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class RepositoryBase(BaseModel):
    name: str
    full_name: str
    html_url: str
    default_branch: str = "main"
    description: Optional[str] = None
    primary_language: Optional[str] = None
    languages: Optional[str] = "{}"
    stars_count: int = 0
    forks_count: int = 0
    open_issues_count: int = 0
    architecture_summary: Optional[str] = None
    entry_points: Optional[str] = "[]"
    build_instructions: Optional[str] = None
    test_instructions: Optional[str] = None
    contribution_guide_summary: Optional[str] = None

class RepositoryOut(RepositoryBase):
    id: int
    organization_id: int
    last_synced_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrganizationBase(BaseModel):
    name: str
    slug: str
    website: str
    gsoc_url: Optional[str] = None
    description: Optional[str] = None
    past_participation_years: str = "[]"
    is_confirmed_2027: bool = False
    confirmed_source_url: Optional[str] = None
    primary_languages: str = "[]"
    topics: str = "[]"
    community_channel: Optional[str] = None
    contribution_guide_url: Optional[str] = None
    ideas_list_url: Optional[str] = None
    fit_score: float = 0.0
    confidence_level: str = "Medium"
    fit_reasons: str = "[]"
    skill_gaps: str = "[]"
    suggested_strategy: Optional[str] = None
    is_shortlisted: bool = False

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationOut(OrganizationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    repositories: List[RepositoryOut] = []
    model_config = ConfigDict(from_attributes=True)

class OrgComparisonRequest(BaseModel):
    org_ids: List[int]
