from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class MonitoredSource(Base):
    __tablename__ = "monitored_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False, unique=True)
    category = Column(String(100), default="program_rules")
    is_official = Column(Boolean, default=True)
    
    check_interval_seconds = Column(Integer, default=3600)
    last_checked_at = Column(DateTime, nullable=True)
    last_content_hash = Column(String(64), nullable=True)
    current_version_summary = Column(Text, nullable=True)
    
    health_status = Column(String(50), default="active")
    error_details = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    versions = relationship("SourceVersion", back_populates="source", cascade="all, delete-orphan")

class SourceVersion(Base):
    __tablename__ = "source_versions"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("monitored_sources.id"), nullable=False)
    content_hash = Column(String(64), nullable=False)
    raw_snippet = Column(Text, nullable=True)
    detected_diff = Column(Text, nullable=True)
    semantic_change_summary = Column(Text, nullable=False)
    
    personal_impact_analysis = Column(Text, nullable=True)
    action_required = Column(Text, nullable=True)
    is_policy_change = Column(Boolean, default=False)
    importance = Column(String(50), default="medium")
    
    detected_at = Column(DateTime, default=utc_now)

    source = relationship("MonitoredSource", back_populates="versions")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    priority = Column(String(50), default="medium")
    category = Column(String(100), default="general")
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    personal_impact = Column(Text, nullable=True)
    action_required = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True)
    
    is_read = Column(Boolean, default=False)
    channel = Column(String(50), default="in_app")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(50), default="medium")
    reason = Column(Text, nullable=True)
    estimated_hours = Column(Float, default=2.0)
    deadline = Column(DateTime, nullable=True)
    
    status = Column(String(50), default="pending")
    completion_criteria = Column(Text, nullable=True)
    linked_entity_type = Column(String(50), nullable=True)
    linked_entity_id = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="tasks")
