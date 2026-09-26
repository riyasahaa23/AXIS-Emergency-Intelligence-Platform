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

    response = client.post(f"/api/incidents/{incident_id}/responses")
    assert response.status_code == 200
    assert response.json()["priority"] == "urgent"


def test_scenario_comparison(client):
    incident = create_incident(client)
    comparison = client.post(
        f"/api/incidents/{incident['id']}/scenarios",
        json={"name": "Heavier rainfall", "severity_delta": 10},
    )
    assert comparison.status_code == 200
    assert comparison.json()["score_delta"] > 0
