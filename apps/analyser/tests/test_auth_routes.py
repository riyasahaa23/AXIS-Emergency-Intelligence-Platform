def test_cookie_session_requires_csrf_on_state_change(client):
    registered = client.post(
        "/api/auth/register",
        json={"email": "csrf@example.com", "password": "correct horse battery"},
    )
    assert registered.status_code == 201
    csrf = client.cookies.get("axis_csrf")
    assert csrf

    denied = client.post("/api/auth/logout")
    assert denied.status_code == 403

    allowed = client.post("/api/auth/logout", headers={"x-csrf-token": csrf})
    assert allowed.status_code == 200
