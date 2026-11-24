from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from app.database import get_db
from app.models.organization import Organization, Repository
from app.schemas.organization import OrganizationOut, OrgComparisonRequest
from app.services.org_matcher import org_matcher
from app.api.routes_profile import get_or_create_default_user

router = APIRouter(prefix="/organizations", tags=["Organizations"])

def seed_organizations_if_empty(db: Session, user):
    for raw_org_data in org_matcher.CURATED_ORGS:
        org_data = dict(raw_org_data)
        repos_data = org_data.pop("repositories", [])
        slug = org_data["slug"]
        existing = db.query(Organization).filter(Organization.slug == slug).first()
        fit = org_matcher.calculate_fit_score(org_data, user)
        if not existing:
            org = Organization(**org_data)
            org.fit_score = fit["fit_score"]
            org.confidence_level = fit["confidence_level"]
            org.fit_reasons = json.dumps(fit["fit_reasons"])
            org.skill_gaps = json.dumps(fit["skill_gaps"])
            org.suggested_strategy = fit["suggested_strategy"]
            # Pre-shortlist the top 3 highest-probability, verified mentor organizations
            if slug in ["sympy", "sunpy", "python-software-foundation"]:
                org.is_shortlisted = True
            db.add(org)
            db.commit()
            db.refresh(org)

            for repo_data in repos_data:
                repo = Repository(organization_id=org.id, **repo_data)
                db.add(repo)
            db.commit()
        else:
            # Update score and probability metadata
            for k in ["annual_slots", "competition_level", "target_contributions_required", "contribution_breakdown", "portfolio_role", "acceptance_probability_rating"]:
                if k in org_data:
                    setattr(existing, k, org_data[k])
            existing.fit_score = fit["fit_score"]
            existing.confidence_level = fit["confidence_level"]
            existing.fit_reasons = json.dumps(fit["fit_reasons"])
            existing.skill_gaps = json.dumps(fit["skill_gaps"])
            existing.suggested_strategy = fit["suggested_strategy"]
            db.commit()

@router.get("", response_model=List[OrganizationOut])
def list_organizations(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    seed_organizations_if_empty(db, user)
    return db.query(Organization).order_by(Organization.fit_score.desc()).all()

@router.post("/{org_id}/shortlist")
def toggle_shortlist(org_id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    org.is_shortlisted = not org.is_shortlisted
    db.commit()
    return {"id": org.id, "is_shortlisted": org.is_shortlisted}

@router.post("/compare")
def compare_organizations(payload: OrgComparisonRequest, db: Session = Depends(get_db)):
    orgs = db.query(Organization).filter(Organization.id.in_(payload.org_ids)).all()
    results = []
    for org in orgs:
        results.append({
            "id": org.id,
            "name": org.name,
            "fit_score": org.fit_score,
            "is_confirmed_2027": org.is_confirmed_2027,
            "languages": json.loads(org.primary_languages or "[]"),
            "topics": json.loads(org.topics or "[]"),
            "skill_gaps": json.loads(org.skill_gaps or "[]"),
            "community_channel": org.community_channel,
            "guidelines_url": org.contribution_guide_url
        })
    return results
