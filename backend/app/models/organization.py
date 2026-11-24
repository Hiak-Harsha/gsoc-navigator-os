from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    website = Column(String(500), nullable=False)
    gsoc_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    
    past_participation_years = Column(Text, default="[]")
    is_confirmed_2027 = Column(Boolean, default=False)
    confirmed_source_url = Column(String(500), nullable=True)
    
    primary_languages = Column(Text, default="[]")
    topics = Column(Text, default="[]")
    community_channel = Column(String(500), nullable=True)
    contribution_guide_url = Column(String(500), nullable=True)
    ideas_list_url = Column(String(500), nullable=True)
    
    fit_score = Column(Float, default=0.0)
    confidence_level = Column(String(50), default="Medium")
    fit_reasons = Column(Text, default="[]")
    skill_gaps = Column(Text, default="[]")
    suggested_strategy = Column(Text, nullable=True)
    
    is_shortlisted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    repositories = relationship("Repository", back_populates="organization", cascade="all, delete-orphan")
    proposals = relationship("Proposal", back_populates="organization")

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    full_name = Column(String(255), unique=True, index=True, nullable=False)
    html_url = Column(String(500), nullable=False)
    default_branch = Column(String(100), default="main")
    description = Column(Text, nullable=True)
    
    primary_language = Column(String(100), nullable=True)
    languages = Column(Text, default="{}")
    stars_count = Column(Integer, default=0)
    forks_count = Column(Integer, default=0)
    open_issues_count = Column(Integer, default=0)
    
    architecture_summary = Column(Text, nullable=True)
    entry_points = Column(Text, default="[]")
    build_instructions = Column(Text, nullable=True)
    test_instructions = Column(Text, nullable=True)
    contribution_guide_summary = Column(Text, nullable=True)
    last_synced_at = Column(DateTime, default=utc_now)

    organization = relationship("Organization", back_populates="repositories")
    issues = relationship("Issue", back_populates="repository", cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="repository")
