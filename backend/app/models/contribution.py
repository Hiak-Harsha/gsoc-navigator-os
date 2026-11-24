from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True)
    
    pr_number = Column(Integer, nullable=False, index=True)
    pr_title = Column(String(500), nullable=False)
    pr_url = Column(String(500), nullable=False)
    status = Column(String(50), default="opened")
    branch_name = Column(String(100), nullable=True)
    
    commits_count = Column(Integer, default=1)
    files_changed = Column(Text, default="[]")
    lines_added = Column(Integer, default=0)
    lines_deleted = Column(Integer, default=0)
    
    review_comments_count = Column(Integer, default=0)
    review_feedback_summary = Column(Text, nullable=True)
    code_quality_assessment = Column(Text, nullable=True)
    recurring_weaknesses_identified = Column(Text, default="[]")
    demonstrated_skills = Column(Text, default="[]")
    learning_breakdown = Column(Text, nullable=True)
    
    date_started = Column(DateTime, default=utc_now)
    date_merged = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="contributions")
    repository = relationship("Repository", back_populates="contributions")
