import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_contributions_tracking_and_pr_review():
    """Test F & G: Live Contribution tracking, PR quality review, and maintainer feedback."""
    resp = client.get("/api/contributions")
    assert resp.status_code == 200
    contribs = resp.json()
    assert len(contribs) >= 1
    c = contribs[0]

    # Automated PR code review
    audit_resp = client.post("/api/contributions/audit-pr", json={
        "pr_number": c["pr_number"],
        "repository_id": c["repository_id"],
        "diff_or_code": "def test_rational_zero_exponent():\n    assert simplify(1/(x-x)) == S.ComplexInfinity"
    })
    assert audit_resp.status_code == 200
    audit_data = audit_resp.json()
    assert audit_data["score"] >= 80.0
    assert len(audit_data["strengths"]) > 0

    # Log maintainer review feedback
    feedback_resp = client.post(
        f"/api/contributions/{c['id']}/feedback?feedback_text=Looks+great+now.+Approved!&new_status=approved"
    )
    assert feedback_resp.status_code == 200
    assert feedback_resp.json()["new_status"] == "approved"

    # Verify user readiness score increased
    profile_resp = client.get("/api/profile")
    assert profile_resp.json()["overall_readiness_score"] > 20.0
