from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.organization import Repository
from app.schemas.organization import RepositoryOut
from app.services.github_service import github_service

router = APIRouter(prefix="/repositories", tags=["Repositories"])

@router.get("/{repo_id}", response_model=RepositoryOut)
def get_repository(repo_id: int, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo

@router.get("/{repo_id}/tree")
async def get_repository_tree(repo_id: int, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    parts = repo.full_name.split("/")
    owner, repo_name = parts[0], parts[1]
    tree = await github_service.get_repository_tree(owner, repo_name, repo.default_branch)
    return {"repository": repo.full_name, "tree": tree}
