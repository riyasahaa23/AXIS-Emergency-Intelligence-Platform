def test_incident_actions_and_notifications(client):
    incident_response = client.post(
        "/api/incidents",
        json={"title": "Workflow fire", "hazard_type": "wildfire", "location": "Test sector"},
    )
    assert incident_response.status_code == 201
    incident_id = incident_response.json()["id"]

    action_response = client.post(
        f"/api/incidents/{incident_id}/actions",
        json={
            "action_type": "assign",
            "message": "Dispatch the regional response team",
            "assignee": "anonymous-development",
        },
    )
    assert action_response.status_code == 201
    assert action_response.json()["action_type"] == "assign"

    actions = client.get(f"/api/incidents/{incident_id}/actions")
    assert actions.status_code == 200
    assert len(actions.json()) == 1

    notifications = client.get("/api/notifications?unread_only=true")
    assert notifications.status_code == 200
    assert notifications.json()[0]["incident_id"] == incident_id

    notification_id = notifications.json()[0]["id"]
    marked = client.post(f"/api/notifications/{notification_id}/read")
    assert marked.status_code == 200
    assert marked.json()["read"] is True


def test_response_plans_are_persisted_in_local_runtime(client):
    incident_response = client.post(
        "/api/incidents",
        json={"title": "Workflow flood", "hazard_type": "flood", "location": "River sector", "severity": 80},
    )
    incident_id = incident_response.json()["id"]

    plan_response = client.post(f"/api/incidents/{incident_id}/responses")
    assert plan_response.status_code == 200
    plan = plan_response.json()
    assert plan["execution_status"] == "recommendation_only"

    listed = client.get(f"/api/incidents/{incident_id}/response-plans")
    assert listed.status_code == 200
    assert listed.json()[0]["plan_id"] == plan["plan_id"]


def test_incident_geojson_and_csv_exports_include_provenance(client):
    incident_response = client.post(
        "/api/incidents",
        json={"title": "GIS fire", "hazard_type": "wildfire", "location": "GIS sector", "latitude": 12.3, "longitude": 45.6, "source_id": "test", "external_id": "gis-1"},
    )
    incident_id = incident_response.json()["id"]

    geojson = client.get("/api/incidents/geojson?min_lat=12&min_lng=45&max_lat=13&max_lng=46")
    assert geojson.status_code == 200
    assert geojson.json()["features"][0]["id"] == incident_id
    assert geojson.json()["features"][0]["properties"]["source_id"] == "test"

    exported = client.get("/api/incidents/export?format=csv")
    assert exported.status_code == 200
    assert "source_id" in exported.text
    assert incident_id in exported.text
