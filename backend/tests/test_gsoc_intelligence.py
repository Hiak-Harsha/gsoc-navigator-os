import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_gsoc_eligibility_assessment():
    resp = client.get("/api/gsoc/eligibility")
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_eligible"] is True
    assert data["confidence"] == "High"
    assert len(data["verified_criteria"]) >= 2

def test_gsoc_timeline_verified_vs_estimated():
    resp = client.get("/api/gsoc/timeline")
    assert resp.status_code == 200
    timeline = resp.json()
    assert len(timeline) >= 5
    # Strict rule: 2027 dates must not be represented as confirmed until Google official announcement
    for milestone in timeline:
        assert "is_confirmed" in milestone
        assert milestone["is_confirmed"] is False # Must be flagged as Planning Estimate
        assert "Historical Planning Estimate" in milestone["status_note"]

def test_organizations_discovery_and_fit_scoring():
    """Test B: Organization discovery and fit scoring."""
    resp = client.get("/api/organizations")
    assert resp.status_code == 200
    orgs = resp.json()
    assert len(orgs) >= 3

    # Check SymPy details
    sympy_org = next((o for o in orgs if o["slug"] == "sympy"), None)
    assert sympy_org is not None
    assert sympy_org["fit_score"] >= 70.0
    assert sympy_org["is_confirmed_2027"] is False # Accurate verification!

    # Toggle shortlist
    toggle_resp = client.post(f"/api/organizations/{sympy_org['id']}/shortlist")
    assert toggle_resp.status_code == 200
    assert "is_shortlisted" in toggle_resp.json()
