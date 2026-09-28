def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "axis-analyser"}


def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "axis_http_requests_total" in response.text


def test_cors_allows_local_frontend(client):
    response = client.options(
        "/api/incidents",
        headers={
            "Origin": "http://localhost:5180",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5180"


def test_readiness_reports_development_fallback(client):
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "degraded"


def test_readiness_is_public_for_orchestrators(client):
    response = client.get("/health/ready")
    assert response.status_code != 401


def test_telemetry_uses_incident_store(client):
    response = client.get("/api/data/telemetry")
    assert response.status_code == 200
    payload = response.json()
    assert payload["dataSources"] > 0
    assert payload["activeIncidents"] == 0


def test_production_readiness_fails_closed_without_database(client):
    settings = client.app.state.settings
    original_environment = settings.environment
    original_database_engine = client.app.state.database_engine
    try:
        settings.environment = "production"
        client.app.state.database_engine = None
        response = client.get("/health/ready")
        assert response.status_code == 503
        assert response.json()["status"] == "not_ready"
    finally:
        settings.environment = original_environment
        client.app.state.database_engine = original_database_engine
