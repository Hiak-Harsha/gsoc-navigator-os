from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class SkillBase(BaseModel):
    name: str
    category: str = "programming"
    estimated_level: int = 1
    verified_evidence: Optional[str] = None
    practical_experience: Optional[str] = None
    relevant_projects: Optional[str] = None
    weaknesses: Optional[str] = None
    recommended_tasks: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    estimated_level: Optional[int] = None
    verified_evidence: Optional[str] = None
    practical_experience: Optional[str] = None
    relevant_projects: Optional[str] = None
    weaknesses: Optional[str] = None
    recommended_tasks: Optional[str] = None

class SkillOut(SkillBase):
    id: int
    user_id: int
    last_assessed_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    name: str
    email: str
    education: str = "B.Tech Computer Science and Engineering"
    university: str = "GITAM University, Visakhapatnam"
    graduation_year: int = 2028
    academic_stage: str = "Third year"
    github_username: Optional[str] = None
    interests: str = "Software engineering, AI/ML, open-source development, systems"
    current_level: str = "Developing practical engineering and open-source skills"

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    github_username: Optional[str] = None
    interests: Optional[str] = None
    current_level: Optional[str] = None
    overall_readiness_score: Optional[float] = None
    current_stage: Optional[int] = None

class UserOut(UserBase):
    id: int
    overall_readiness_score: float
    current_stage: int
    created_at: datetime
    updated_at: datetime
    skills: List[SkillOut] = []
    model_config = ConfigDict(from_attributes=True)
