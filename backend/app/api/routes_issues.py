from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from app.database import get_db
from app.models.issue import Issue
from app.models.organization import Repository
from app.schemas.issue import IssueOut
from app.services.github_service import github_service
from app.services.issue_analyzer import issue_analyzer
from app.api.routes_profile import get_or_create_default_user

router = APIRouter(prefix="/issues", tags=["Issues & Bug Discovery"])

@router.get("", response_model=List[IssueOut])
def list_issues(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    user = get_or_create_default_user(db)
    # Ensure all registered repositories have issues seeded
    repos = db.query(Repository).all()
    for repo in repos:
        if db.query(Issue).filter(Issue.repository_id == repo.id).count() == 0:
            sync_repo_issues_internal(repo.id, db, user)

    query = db.query(Issue)
    if category:
        query = query.filter(Issue.category == category)
    if severity:
        query = query.filter(Issue.severity == severity)
    if difficulty:
        query = query.filter(Issue.difficulty == difficulty)

    return query.order_by(Issue.match_score.desc()).all()

def sync_repo_issues_internal(repo_id: int, db: Session, user):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        return
    parts = repo.full_name.split("/")
    owner, repo_name = parts[0], parts[1]

    # Use default issues from github_service
    import asyncio
    raw_issues = asyncio.run(github_service.get_open_issues(owner, repo_name))
    for r_iss in raw_issues:
        classified = issue_analyzer.analyze_and_classify(r_iss, user)
        issue = Issue(
            repository_id=repo.id,
            number=r_iss["number"],
            title=r_iss["title"],
            html_url=r_iss["html_url"],
            body=r_iss["body"],
            labels=json.dumps(r_iss["labels"]),
            severity=classified["severity"],
            difficulty=classified["difficulty"],
            category=classified["category"],
            match_score=classified["match_score"],
            match_rationale=classified["match_rationale"],
            required_skills=json.dumps(classified["required_skills"]),
            missing_skills=json.dumps(classified["missing_skills"]),
            investigation_strategy=classified["investigation_strategy"],
            possible_direction=classified["possible_direction"],
            testing_requirements=classified["testing_requirements"],
            edge_cases=json.dumps(classified["edge_cases"]),
            estimated_effort_hours=classified["estimated_effort_hours"],
            learning_value=classified["learning_value"],
            gsoc_relevance=classified["gsoc_relevance"]
        )
        db.add(issue)
    db.commit()

@router.post("/sync/{repo_id}")
async def sync_repo_issues(repo_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    parts = repo.full_name.split("/")
    owner, repo_name = parts[0], parts[1]
    raw_issues = await github_service.get_open_issues(owner, repo_name)
    synced = []
    for r_iss in raw_issues:
        existing = db.query(Issue).filter(Issue.repository_id == repo.id, Issue.number == r_iss["number"]).first()
        if not existing:
            classified = issue_analyzer.analyze_and_classify(r_iss, user)
            issue = Issue(
                repository_id=repo.id,
                number=r_iss["number"],
                title=r_iss["title"],
                html_url=r_iss["html_url"],
                body=r_iss["body"],
                labels=json.dumps(r_iss["labels"]),
                severity=classified["severity"],
                difficulty=classified["difficulty"],
                category=classified["category"],
                match_score=classified["match_score"],
                match_rationale=classified["match_rationale"],
                required_skills=json.dumps(classified["required_skills"]),
                missing_skills=json.dumps(classified["missing_skills"]),
                investigation_strategy=classified["investigation_strategy"],
                possible_direction=classified["possible_direction"],
                testing_requirements=classified["testing_requirements"],
                edge_cases=json.dumps(classified["edge_cases"]),
                estimated_effort_hours=classified["estimated_effort_hours"],
                learning_value=classified["learning_value"],
                gsoc_relevance=classified["gsoc_relevance"]
            )
            db.add(issue)
            synced.append(r_iss["number"])
    db.commit()
    return {"status": "success", "synced_issues_count": len(synced)}
