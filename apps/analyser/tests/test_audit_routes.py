def test_audit_events_are_listed_and_exported(client):
    response = client.get("/api/audit")
    assert response.status_code == 200
    assert "events" in response.json()

    exported = client.get("/api/audit/export")
    assert exported.status_code == 200
    assert "action" in exported.text
