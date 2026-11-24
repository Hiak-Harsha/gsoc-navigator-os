from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime
from app.database import get_db
from app.models.contribution import Contribution
from app.schemas.contribution import ContributionOut, ContributionCreate, PRReviewRequest
from app.services.pr_intelligence import pr_intelligence
from app.api.routes_profile import get_or_create_default_user

router = APIRouter(prefix="/contributions", tags=["Contributions & PR Intelligence"])

@router.get("", response_model=List[ContributionOut])
def list_contributions(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    # Seed real PR if empty to demonstrate timeline
    if db.query(Contribution).count() == 0:
        c = Contribution(
            user_id=user.id,
            repository_id=1,
            pr_number=31302,
            pr_title="fix(stats): fix MarginalDistribution.pdf on JointDistribution and add tests",
            pr_url="https://github.com/sympy/sympy/pull/31302",
            status="opened",
            branch_name="fix-marginal-distribution-pdf",
            commits_count=1,
            files_changed=json.dumps(["sympy/stats/joint_rv.py", "sympy/stats/tests/test_joint_rv.py"]),
            lines_added=39,
            lines_deleted=5,
            review_comments_count=0,
            review_feedback_summary="Pull request opened on sympy/sympy and awaiting automated CI testing.",
            code_quality_assessment="100% compliant with SymPy AI Policy, PR template, and test guidelines.",
            recurring_weaknesses_identified=json.dumps([]),
            demonstrated_skills=json.dumps(["SymPy Stats Subsystem", "Analytical Derivations", "Regression Testing", "Git PR Workflow"])
        )
        db.add(c)
        db.commit()

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
