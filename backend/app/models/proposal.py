from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    title = Column(String(500), nullable=False)
    project_idea_title = Column(String(500), nullable=True)
    project_idea_url = Column(String(500), nullable=True)
    status = Column(String(50), default="draft")
    version = Column(Integer, default=1)
    
    abstract = Column(Text, nullable=True)
    problem_statement = Column(Text, nullable=True)
    proposed_solution = Column(Text, nullable=True)
    architecture_overview = Column(Text, nullable=True)
    weekly_milestones = Column(Text, default="[]")
    deliverables = Column(Text, default="[]")
    testing_strategy = Column(Text, nullable=True)
    risks_and_mitigation = Column(Text, nullable=True)
    prior_contributions = Column(Text, default="[]")
    
    review_score = Column(Float, default=0.0)
    audit_warnings = Column(Text, default="[]")
    strengths = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="proposals")
    organization = relationship("Organization", back_populates="proposals")
