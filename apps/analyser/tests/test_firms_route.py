from fastapi.testclient import TestClient

from app.main import app


def test_firms_route_reports_missing_key():
    with TestClient(app) as client:
        response = client.post("/api/data/firms/fetch", json={})
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "SOURCE_NOT_CONFIGURED"
