import pytest
from fastapi import HTTPException

from app.auth.dependencies import require_scope
from app.auth.gateway import AuthContext


class Request:
    state = type("State", (), {"auth": AuthContext("readonly", frozenset({"read"}), "api_key")})()


@pytest.mark.asyncio
async def test_scope_dependency_rejects_readonly_operator_action():
    with pytest.raises(HTTPException) as error:
        await require_scope("ingest")(Request())
    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_scope_dependency_accepts_operator_scope():
    request = Request()
    request.state.auth = AuthContext("operator", frozenset({"ingest"}), "api_key")
    assert await require_scope("ingest")(request) is None
