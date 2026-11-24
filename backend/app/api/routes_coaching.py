from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.issue import Issue, CoachingSession
from app.schemas.issue import CoachingSessionCreate, CoachingStepUpdate, CoachingSessionOut
from app.services.coaching_agent import coaching_agent
from app.api.routes_profile import get_or_create_default_user

router = APIRouter(prefix="/coaching", tags=["Personal Contribution Coach"])

@router.post("/start", response_model=CoachingSessionOut)
def start_coaching(payload: CoachingSessionCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    issue = db.query(Issue).filter(Issue.id == payload.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    session = CoachingSession(
        issue_id=issue.id,
        user_id=user.id,
        mode=payload.mode
    )
    coaching_agent.initialize_session(session, issue)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/{session_id}")
def get_coaching_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(CoachingSession).filter(CoachingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    issue = session.issue
    guidance = coaching_agent.get_step_guidance(session, issue)
    return {
        "session": session,
        "issue": issue,
        "step_guidance": guidance
    }

@router.post("/{session_id}/step", response_model=CoachingSessionOut)
def update_coaching_step(session_id: int, payload: CoachingStepUpdate, db: Session = Depends(get_db)):
    session = db.query(CoachingSession).filter(CoachingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.current_step = payload.step
    if payload.notes:
        session.investigation_notes = payload.notes
    if payload.root_cause_confirmed is not None:
        session.root_cause_confirmed = payload.root_cause_confirmed
    if payload.root_cause_description:
        session.root_cause_description = payload.root_cause_description
    if payload.patch_diff:
        session.patch_diff = payload.patch_diff
    if payload.test_plan:
        session.test_plan = payload.test_plan
    if payload.mode:
        session.mode = payload.mode
    if payload.step >= 8:
        session.is_completed = True

    db.commit()
    db.refresh(session)
    return session
