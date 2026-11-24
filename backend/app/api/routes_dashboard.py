from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.database import get_db
from app.models.user import User
from app.models.monitoring import Task, Notification
from app.models.organization import Organization
from app.models.contribution import Contribution
from app.models.proposal import Proposal
from app.schemas.monitoring import TaskOut, TaskCreate, TaskUpdate
from app.services.strategy_service import strategy_service
from app.api.routes_profile import get_or_create_default_user
from app.api.routes_orgs import seed_organizations_if_empty
from app.api.routes_proposals import list_proposals
from app.api.routes_contributions import list_contributions

router = APIRouter(prefix="/dashboard", tags=["Execution Command Center"])

def seed_default_tasks_if_empty(db: Session, user: User):
    if db.query(Task).count() == 0:
        tasks = [
            Task(
                user_id=user.id,
                title="Fork and clone SymPy repository locally",
                description="Set up python virtual environment, run `pip install -e .`, and execute unit tests.",
                priority="high",
                reason="Hands-on environment setup is Stage 1 requirement.",
                estimated_hours=1.5,
                status="pending",
                completion_criteria="`pytest sympy/core` runs green without errors."
            ),
            Task(
                user_id=user.id,
                title="Investigate issue #24891 (Rational Exponent Zero Division)",
                description="Follow the 8-step coaching workflow to isolate the root cause.",
                priority="critical",
                reason="Identified as top 'Start Now' match for your profile.",
                estimated_hours=3.0,
                status="pending",
                completion_criteria="Reproduce bug with minimal 3-line script."
            ),
            Task(
                user_id=user.id,
                title="Draft Weekly Timeline for Matrix Exp GSoC Proposal",
                description="Incorporate feedback from Proposal Studio audit (add buffer week).",
                priority="medium",
                reason="Proposals with buffer weeks score 15% higher in mentor reviews.",
                estimated_hours=2.0,
                status="pending",
                completion_criteria="Proposal audit score passes 80%."
            )
        ]
        db.add_all(tasks)
        db.commit()

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    seed_organizations_if_empty(db, user)
    seed_default_tasks_if_empty(db, user)
    list_proposals(db) # Pre-seeds initial proposal if empty
    list_contributions(db) # Pre-seeds contribution timeline if empty

    shortlisted_orgs = db.query(Organization).filter(Organization.is_shortlisted == True).count()
    total_contributions = db.query(Contribution).filter(Contribution.user_id == user.id).count()
    proposals_count = db.query(Proposal).filter(Proposal.user_id == user.id).count()
    unread_notifications = db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).count()
    pending_tasks = db.query(Task).filter(Task.user_id == user.id, Task.status == "pending").count()

    return {
        "user": {
            "name": user.name,
            "stage": user.current_stage,
            "readiness_score": user.overall_readiness_score,
            "university": user.university,
            "grad_year": user.graduation_year
        },
        "stats": {
            "shortlisted_orgs": shortlisted_orgs,
            "total_contributions": total_contributions,
            "proposals_drafted": proposals_count,
            "unread_notifications": unread_notifications,
            "pending_tasks": pending_tasks
        },
        "system_status": {
            "monitoring_active": True,
            "sources_tracked": 3,
            "current_target_year": 2027
        }
    }

@router.get("/briefing")
def get_daily_briefing(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    return strategy_service.generate_daily_briefing(db, user)

@router.get("/weekly-review")
def get_weekly_review(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    return strategy_service.generate_weekly_review(db, user)

@router.get("/tasks", response_model=List[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    seed_default_tasks_if_empty(db, user)
    return db.query(Task).filter(Task.user_id == user.id).order_by(Task.created_at.desc()).all()

@router.post("/tasks/{task_id}/status")
def update_task_status(task_id: int, status: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = status
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "success", "task_id": task.id, "new_status": task.status}
