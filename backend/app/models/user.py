from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    education = Column(String(255), default="B.Tech Computer Science and Engineering")
    university = Column(String(255), default="GITAM University, Visakhapatnam")
    graduation_year = Column(Integer, default=2028)
    academic_stage = Column(String(100), default="Third year")
    github_username = Column(String(100), nullable=True, index=True)
    interests = Column(Text, default="Software engineering, AI/ML, open-source development, systems")
    current_level = Column(String(100), default="Developing practical engineering and open-source skills")
    
    # Progress and readiness scores
    overall_readiness_score = Column(Float, default=18.5)
    current_stage = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    skills = relationship("Skill", back_populates="user", cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="user", cascade="all, delete-orphan")
    coaching_sessions = relationship("CoachingSession", back_populates="user", cascade="all, delete-orphan")
    proposals = relationship("Proposal", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False, index=True)
    category = Column(String(100), default="programming")
    estimated_level = Column(Integer, default=1)
    verified_evidence = Column(Text, nullable=True)
    practical_experience = Column(Text, nullable=True)
    relevant_projects = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    recommended_tasks = Column(Text, nullable=True)
    last_assessed_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="skills")
