from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Skill
from app.schemas.user import UserCreate, UserUpdate, UserOut, SkillCreate, SkillUpdate, SkillOut

router = APIRouter(prefix="/profile", tags=["Profile & Skills"])

def get_or_create_default_user(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User(
            name="Madhava",
            email="madhava@student.gitam.edu",
            education="B.Tech Computer Science and Engineering",
            university="GITAM University, Visakhapatnam",
            graduation_year=2028,
            academic_stage="Third year",
            github_username="madhav-gitam",
            interests="Software engineering, AI/ML, open-source development, systems",
            current_level="Developing practical engineering and open-source skills",
            overall_readiness_score=18.5,
            current_stage=1
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Seed initial skill profile with verified evidence distinction
        initial_skills = [
            Skill(user_id=user.id, name="Python", category="programming", estimated_level=3, practical_experience="Academic coursework & script development", weaknesses="Metaclasses, asyncio internals"),
            Skill(user_id=user.id, name="C", category="programming", estimated_level=2, practical_experience="Operating systems lab assignments", weaknesses="Complex memory management, pointers to functions"),
            Skill(user_id=user.id, name="Java", category="programming", estimated_level=2, practical_experience="Object oriented programming courses", weaknesses="JVM tuning, concurrency libraries"),
            Skill(user_id=user.id, name="Git & GitHub", category="tools", estimated_level=2, practical_experience="Basic commits and pushes", weaknesses="Interactive rebasing, bisecting bugs, merge conflict resolution"),
            Skill(user_id=user.id, name="Data Structures & Algorithms", category="concepts", estimated_level=3, practical_experience="Coursework & standard problem solving", weaknesses="Graph theory proofs, dynamic programming optimization")
        ]
        db.add_all(initial_skills)
        db.commit()
        db.refresh(user)
    return user

@router.get("", response_model=UserOut)
def get_profile(db: Session = Depends(get_db)):
    return get_or_create_default_user(db)

@router.put("", response_model=UserOut)
def update_profile(data: UserUpdate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(user, field, val)
    db.commit()
    db.refresh(user)
    return user

@router.post("/skills", response_model=SkillOut)
def add_or_update_skill(skill_in: SkillCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    existing = db.query(Skill).filter(Skill.user_id == user.id, Skill.name == skill_in.name).first()
    if existing:
        for field, val in skill_in.model_dump(exclude_unset=True).items():
            setattr(existing, field, val)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_skill = Skill(user_id=user.id, **skill_in.model_dump())
        db.add(new_skill)
        db.commit()
        db.refresh(new_skill)
        return new_skill
