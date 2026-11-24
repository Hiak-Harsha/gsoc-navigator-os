import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

client = TestClient(app)

def setup_module():
    Base.metadata.create_all(bind=engine)

def test_user_onboarding_and_persistence():
    """Test A: User onboarding, profile persistence, and skills assessment."""
    response = client.get("/api/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Madhava"
    assert "GITAM" in data["university"]
    assert data["graduation_year"] == 2028
    assert len(data["skills"]) >= 5

    # Update profile
    update_resp = client.put("/api/profile", json={"current_level": "Independent contributor in training"})
    assert update_resp.status_code == 200
    assert update_resp.json()["current_level"] == "Independent contributor in training"

def test_add_and_update_skill():
    skill_resp = client.post("/api/profile/skills", json={
        "name": "Symbolic Mathematics",
        "category": "concepts",
        "estimated_level": 2,
        "verified_evidence": "Solved issue #24891 locally and verified with pytest",
        "practical_experience": "Coursework and SymPy codebase exploration"
    })
    assert skill_resp.status_code == 200
    data = skill_resp.json()
    assert data["name"] == "Symbolic Mathematics"
    assert data["estimated_level"] == 2
