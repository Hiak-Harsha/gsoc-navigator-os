from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.gsoc_intelligence import gsoc_intelligence
from app.api.routes_profile import get_or_create_default_user

router = APIRouter(prefix="/gsoc", tags=["GSoC Intelligence"])

@router.get("/eligibility")
def get_eligibility(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    profile_data = {
        "graduation_year": user.graduation_year,
        "university": user.university,
        "academic_stage": user.academic_stage
    }
    return gsoc_intelligence.verify_eligibility(profile_data)

@router.get("/timeline")
def get_timeline():
    return gsoc_intelligence.get_timeline_2027()

@router.get("/resources")
def get_resources():
    return gsoc_intelligence.OFFICIAL_SOURCES
