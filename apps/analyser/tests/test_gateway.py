from app.auth.gateway import AuthContext


def test_auth_context_has_explicit_scopes():
    context = AuthContext("operator", frozenset({"read", "analyse"}), "api_key")
    assert "analyse" in context.scopes
    assert context.method == "api_key"
