from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from app.database import get_db
from app.models.proposal import Proposal
from app.models.organization import Organization
from app.schemas.proposal import ProposalOut, ProposalCreate, ProposalUpdate, ProposalAuditResult
from app.services.proposal_service import proposal_service
from app.api.routes_profile import get_or_create_default_user

router = APIRouter(prefix="/proposals", tags=["Proposal Studio"])

@router.get("", response_model=List[ProposalOut])
def list_proposals(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    if db.query(Proposal).count() == 0:
        org = db.query(Organization).first()
        org_id = org.id if org else 1
        sample_milestones = [
            {"week": 1, "milestone": "Community Bonding & Dev Setup", "deliverables": "Run full test suite locally, agree on API signatures with mentors.", "tests": "Validate local build."},
            {"week": 2, "milestone": "Refactor Matrix Exponentiation Guard", "deliverables": "Implement dimensional check in sympy.matrices.dense.", "tests": "Add unit tests for non-square matrices."},
            {"week": 3, "milestone": "Series Expansion Boundary Handlers", "deliverables": "Handle symbolic dimension boundaries.", "tests": "Regression tests in test_dense.py."},
            {"week": 4, "milestone": "Midterm Checkpoint & Docs", "deliverables": "Complete docstring coverage and Sphinx documentation.", "tests": "Run doctests."},
            {"week": 5, "milestone": "Buffer Week & Mentor Feedback", "deliverables": "Catch up on edge case review notes from mentors.", "tests": "Full benchmark suite."},
            {"week": 6, "milestone": "Final Polish & Submission", "deliverables": "Merge final PRs, clean git history.", "tests": "CI/CD full green validation."}
        ]
        p = Proposal(
            user_id=user.id,
            organization_id=org_id,
            title="Enhancing Matrix Exponential Computation and Error Boundaries in SymPy",
            project_idea_title="Modernize Matrix Exponential Algorithms",
            status="draft",
            abstract="This project aims to harden and optimize matrix exponential functions in SymPy matrices module.",
            problem_statement="Currently non-square inputs to matrix exp raise raw exceptions without diagnostic information, and sparse symbolic cases lack bounded series expansion.",
            proposed_solution="Introduce dedicated ShapeValidation layers, enhance error messages, and implement accelerated Taylor series expansion.",
            architecture_overview="Modular enhancements inside sympy/matrices/dense.py and sympy/matrices/expressions.",
            weekly_milestones=json.dumps(sample_milestones),
            deliverables=json.dumps(["ShapeError validation", "Accelerated series solver", "Documentation & Tutorial"]),
            testing_strategy="Pytest unit tests with parameterized fixtures across dense and sparse symbolic matrices.",
            risks_and_mitigation="Designated Week 5 as a dedicated buffer week to handle mid-term exam schedule without falling behind.",
            prior_contributions=json.dumps(["https://github.com/sympy/sympy/pull/24901"])
        )
        db.add(p)
        db.commit()

    return db.query(Proposal).filter(Proposal.user_id == user.id).all()

@router.get("/{proposal_id}", response_model=ProposalOut)
def get_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@router.post("", response_model=ProposalOut)
def create_proposal(data: ProposalCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    proposal = Proposal(user_id=user.id, **data.model_dump())
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal

@router.put("/{proposal_id}", response_model=ProposalOut)
def update_proposal(proposal_id: int, data: ProposalUpdate, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(proposal, field, val)
    db.commit()
    db.refresh(proposal)
    return proposal

@router.post("/{proposal_id}/audit", response_model=ProposalAuditResult)
def audit_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    audit_res = proposal_service.audit_proposal(proposal)
    db.commit()
    return audit_res
