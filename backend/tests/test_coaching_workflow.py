import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_coaching_workflow_state_progression():
    """Test E: 8-Step Contribution Coaching Workflow."""
    issues = client.get("/api/issues").json()
    target_issue = issues[0]

    # Start coaching session
    start_resp = client.post("/api/coaching/start", json={
        "issue_id": target_issue["id"],
        "mode": "mentor"
    })
    assert start_resp.status_code == 200
    session = start_resp.json()
    session_id = session["id"]
    assert session["current_step"] == 1

    # Fetch guidance for Step 1 (Understand)
    guide_resp = client.get(f"/api/coaching/{session_id}")
    assert guide_resp.status_code == 200
    guide_data = guide_resp.json()
    assert guide_data["step_guidance"]["step"] == 1
    assert "Understand" in guide_data["step_guidance"]["name"]

    # Progress to Step 4 (Debug) with confirmed root cause
    step4_resp = client.post(f"/api/coaching/{session_id}/step", json={
        "step": 4,
        "notes": "Traced exception to unhandled Rational division by zero",
        "root_cause_confirmed": True,
        "root_cause_description": "Rational exponent evaluation produces unhandled zero division in simplification loop"
    })
    assert step4_resp.status_code == 200
    assert step4_resp.json()["current_step"] == 4
    assert step4_resp.json()["root_cause_confirmed"] is True

    # Complete Step 8 (Submit)
    step8_resp = client.post(f"/api/coaching/{session_id}/step", json={
        "step": 8,
        "notes": "PR description and commit message approved."
    })
    assert step8_resp.status_code == 200
    assert step8_resp.json()["is_completed"] is True
