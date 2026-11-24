from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class MonitoredSourceBase(BaseModel):
    name: str
    url: str
    category: str = "program_rules"
    is_official: bool = True
    check_interval_seconds: int = 3600

class MonitoredSourceOut(MonitoredSourceBase):
    id: int
    last_checked_at: Optional[datetime] = None
    last_content_hash: Optional[str] = None
    current_version_summary: Optional[str] = None
    health_status: str
    error_details: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SourceVersionOut(BaseModel):
    id: int
    source_id: int
    content_hash: str
    raw_snippet: Optional[str] = None
    detected_diff: Optional[str] = None
    semantic_change_summary: str
    personal_impact_analysis: Optional[str] = None
    action_required: Optional[str] = None
    is_policy_change: bool = False
    importance: str
    detected_at: datetime
    model_config = ConfigDict(from_attributes=True)

class NotificationBase(BaseModel):
    priority: str = "medium"
    category: str = "general"
    title: str
    summary: str
    source_url: Optional[str] = None
    personal_impact: Optional[str] = None
    action_required: Optional[str] = None
    deadline: Optional[datetime] = None
    is_read: bool = False
    channel: str = "in_app"

class NotificationOut(NotificationBase):
    id: int
    user_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    reason: Optional[str] = None
    estimated_hours: float = 2.0
    deadline: Optional[datetime] = None
    status: str = "pending"
    completion_criteria: Optional[str] = None
    linked_entity_type: Optional[str] = None
    linked_entity_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None

class TaskOut(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
