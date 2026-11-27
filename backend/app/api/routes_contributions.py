from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime
from app.database import get_db
from app.models.contribution import Contribution
from app.schemas.contribution import ContributionOut, ContributionCreate, PRReviewRequest
from app.services.pr_intelligence import pr_intelligence
from app.services.pr_monitor import pr_monitor
from app.services.portfolio_seed import ensure_portfolio_seeded
from app.api.routes_profile import get_or_create_default_user

router = APIRouter(prefix="/contributions", tags=["Contributions & PR Intelligence"])

@router.get("/live-status")
def get_live_status(db: Session = Depends(get_db)):
    """Fetch real-time GitHub status, CI checks, and bot reviews for all PRs."""
    return pr_monitor.sync_all(db)

@router.post("/sync-live-status")
def sync_live_status(db: Session = Depends(get_db)):
    """Force sync database state with live GitHub checks and merges."""
    reports = pr_monitor.sync_all(db)
    return {"status": "synchronized", "synced_count": len(reports), "reports": reports}


@router.get("", response_model=List[ContributionOut])
def list_contributions(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    ensure_portfolio_seeded(db, user)
    return db.query(Contribution).filter(Contribution.user_id == user.id).order_by(Contribution.created_at.desc()).all()

@router.post("/audit-pr")
def audit_pr(payload: PRReviewRequest):
    code = payload.diff_or_code or "def test_example(): assert True"
    return pr_intelligence.audit_pr_code(code, f"PR #{payload.pr_number}")

@router.post("/{contribution_id}/feedback")
def log_feedback(contribution_id: int, feedback_text: str, new_status: str, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    contrib = db.query(Contribution).filter(Contribution.id == contribution_id).first()
    if not contrib:
        raise HTTPException(status_code=404, detail="Contribution not found")

    pr_intelligence.record_maintainer_feedback(contrib, user, feedback_text, new_status)
    db.commit()
    db.refresh(contrib)
    return {"status": "success", "contribution": contrib.pr_title, "new_status": contrib.status}
