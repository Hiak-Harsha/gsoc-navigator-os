from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    github_issue_id = Column(Integer, index=True, nullable=True)
    number = Column(Integer, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    html_url = Column(String(500), nullable=False)
    body = Column(Text, nullable=True)
    state = Column(String(50), default="open")
    labels = Column(Text, default="[]")
    
    severity = Column(String(10), default="S2")
    difficulty = Column(String(10), default="L2")
    category = Column(String(50), default="start_now")
    
    match_score = Column(Float, default=70.0)
    match_rationale = Column(Text, nullable=True)
    required_skills = Column(Text, default="[]")
    missing_skills = Column(Text, default="[]")
    relevant_files = Column(Text, default="[]")
    investigation_strategy = Column(Text, nullable=True)
    possible_direction = Column(Text, nullable=True)
    testing_requirements = Column(Text, nullable=True)
    edge_cases = Column(Text, default="[]")
    estimated_effort_hours = Column(Float, default=4.0)
    learning_value = Column(Text, nullable=True)
    gsoc_relevance = Column(Text, nullable=True)
    is_actively_available = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    repository = relationship("Repository", back_populates="issues")
    coaching_sessions = relationship("CoachingSession", back_populates="issue", cascade="all, delete-orphan")

class CoachingSession(Base):
    __tablename__ = "coaching_sessions"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    current_step = Column(Integer, default=1)
    mode = Column(String(50), default="mentor")
    
    problem_summary = Column(Text, nullable=True)
    concepts = Column(Text, default="[]")
    investigation_notes = Column(Text, nullable=True)
    hypotheses = Column(Text, default="[]")
    root_cause_confirmed = Column(Boolean, default=False)
    root_cause_description = Column(Text, nullable=True)
    patch_diff = Column(Text, nullable=True)
    test_plan = Column(Text, nullable=True)
    review_feedback = Column(Text, default="[]")
    pr_title_draft = Column(String(255), nullable=True)
    pr_description_draft = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    issue = relationship("Issue", back_populates="coaching_sessions")
    user = relationship("User", back_populates="coaching_sessions")
