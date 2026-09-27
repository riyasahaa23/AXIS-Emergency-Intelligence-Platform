def create_incident(client):
    response = client.post(
        "/api/incidents",
        json={
            "title": "River flooding",
            "hazard_type": "flood",
            "location": "Zone 4",
            "severity": 80,
            "exposure": 70,
            "population": 12000,
            "vulnerability": 60,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_incident_analysis_and_response(client):
    incident = create_incident(client)
    incident_id = incident["id"]

    analysis = client.post(f"/api/incidents/{incident_id}/analysis")
    assert analysis.status_code == 200
    assert analysis.json()["risk"]["level"] == "high"
    assert analysis.json()["verification"]["is_valid"] is True
    assert 0 <= analysis.json()["risk"]["lower_bound"] <= analysis.json()["risk"]["score"] <= analysis.json()["risk"]["upper_bound"] <= 100

    response = client.post(f"/api/incidents/{incident_id}/responses")
    assert response.status_code == 200
    assert response.json()["priority"] == "urgent"
    assert response.json()["approval_required"] is True
    assert response.json()["execution_status"] == "recommendation_only"


def test_scenario_comparison(client):
    incident = create_incident(client)
    comparison = client.post(
        f"/api/incidents/{incident['id']}/scenarios",
        json={"name": "Heavier rainfall", "severity_delta": 10},
    )
    assert comparison.status_code == 200
    assert comparison.json()["score_delta"] > 0

    live = client.get(f"/api/incidents/{incident['id']}").json()
    assert live["severity"] == incident["severity"]
    assert comparison.json()["baseline_version"] == incident["version"]
    assert comparison.json()["projected_incident"]["severity"] == 90


def test_scenario_comparison_is_deterministic(client):
    incident = create_incident(client)
    payload = {"name": "Evacuation", "severity_delta": -10, "population_delta": -1000}
    first = client.post(f"/api/incidents/{incident['id']}/scenarios", json=payload)
    second = client.post(f"/api/incidents/{incident['id']}/scenarios", json=payload)
    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()


def test_incident_timeline_and_optimistic_versioning(client):
    incident = create_incident(client)
    timeline = client.get(f"/api/incidents/{incident['id']}/timeline")
    assert timeline.status_code == 200
    assert [event["event_type"] for event in timeline.json()] == ["INCIDENT_CREATED"]
    assert timeline.json()[0]["version"] == 1

    updated = client.patch(
        f"/api/incidents/{incident['id']}",
        json={"expected_version": 1, "severity": 85},
    )
    assert updated.status_code == 200
    assert updated.json()["version"] == 2

    stale = client.patch(
        f"/api/incidents/{incident['id']}",
        json={"expected_version": 1, "severity": 90},
    )
    assert stale.status_code == 409
    assert stale.json()["detail"]["code"] == "INCIDENT_VERSION_CONFLICT"
