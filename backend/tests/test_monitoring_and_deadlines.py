import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_monitoring_sources_and_check():
    """Test H, J, K: Source ingestion, persistent monitoring health, and notifications."""
    resp = client.get("/api/monitoring/sources")
    assert resp.status_code == 200
    sources = resp.json()
    assert len(sources) >= 3

    # Trigger manual background check
    check_resp = client.post("/api/monitoring/check")
    assert check_resp.status_code == 200
    assert check_resp.json()["status"] == "success"

    # List notifications
    notif_resp = client.get("/api/monitoring/notifications")
    assert notif_resp.status_code == 200

def test_dashboard_and_task_engine():
    """Test I & L: Central execution command center, daily briefing, and task status."""
    overview_resp = client.get("/api/dashboard/overview")
    assert overview_resp.status_code == 200
    overview = overview_resp.json()
    assert overview["system_status"]["monitoring_active"] is True
    assert overview["system_status"]["current_target_year"] == 2027

    briefing_resp = client.get("/api/dashboard/briefing")
    assert briefing_resp.status_code == 200
    briefing = briefing_resp.json()
    assert "top_priorities" in briefing

    tasks_resp = client.get("/api/dashboard/tasks")
    assert tasks_resp.status_code == 200
    tasks = tasks_resp.json()
    assert len(tasks) >= 2

    # Update task status
    task_id = tasks[0]["id"]
    update_task = client.post(f"/api/dashboard/tasks/{task_id}/status?status=completed")
    assert update_task.status_code == 200
    assert update_task.json()["new_status"] == "completed"
