import pytest

from app.auth.service import AuthService


@pytest.mark.asyncio
async def test_refresh_rotates_in_memory_session_token():
    service = AuthService()
    user = await service.register("operator@example.com", "correct horse battery")
    logged_in, old_token = await service.login(user["email"], "correct horse battery")

    refreshed, new_token = await service.refresh(old_token)

    assert refreshed == logged_in
    assert new_token != old_token
    assert await service.authenticate(old_token) is None
    assert (await service.authenticate(new_token)).subject == user["id"]
