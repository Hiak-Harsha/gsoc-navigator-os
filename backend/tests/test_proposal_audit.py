import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_proposal_studio_milestone_and_audit():
    """Test: GSoC Proposal Studio milestone audit, buffer weeks, and scoring."""
    resp = client.get("/api/proposals")
    assert resp.status_code == 200
    proposals = resp.json()
    assert len(proposals) >= 1
    prop = proposals[0]

    # Run critical proposal audit
    audit_resp = client.post(f"/api/proposals/{prop['id']}/audit")
    assert audit_resp.status_code == 200
    audit_data = audit_resp.json()
    assert audit_data["review_score"] >= 70.0
    assert "strengths" in audit_data
    assert "readiness_summary" in audit_data
