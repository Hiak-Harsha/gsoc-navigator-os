import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_repository_exploration():
    """Test C: Repository intelligence and file hierarchy exploration."""
    orgs = client.get("/api/organizations").json()
    repo_id = orgs[0]["repositories"][0]["id"]
    
    resp = client.get(f"/api/repositories/{repo_id}")
    assert resp.status_code == 200
    repo = resp.json()
    assert repo["name"] == "sympy"
    assert "sympy" in repo["full_name"]

    tree_resp = client.get(f"/api/repositories/{repo_id}/tree")
    assert tree_resp.status_code == 200
    tree_data = tree_resp.json()
    assert "tree" in tree_data
    assert len(tree_data["tree"]) > 0

def test_issue_discovery_and_dual_classification():
    """Test D: Issue recommendation with Severity (S0-S4) and Difficulty (L1-L5)."""
    resp = client.get("/api/issues")
    assert resp.status_code == 200
    issues = resp.json()
    assert len(issues) >= 2

    first_issue = issues[0]
    assert first_issue["severity"] in ["S0", "S1", "S2", "S3", "S4"]
    assert first_issue["difficulty"] in ["L1", "L2", "L3", "L4", "L5"]
    assert first_issue["category"] in ["start_now", "stretch", "advanced"]
    assert first_issue["match_score"] > 0
    assert first_issue["investigation_strategy"] is not None
