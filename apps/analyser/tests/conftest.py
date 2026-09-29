import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(autouse=True)
def clear_settings_cache(monkeypatch):
    # Tests must not inherit credentials or anonymous-mode settings from a
    # developer's local .env file.
    monkeypatch.setenv("AXIS_ENVIRONMENT", "development")
    monkeypatch.setenv("AXIS_ALLOW_ANONYMOUS_DEMO", "true")
    monkeypatch.setenv("AXIS_ALLOW_IN_MEMORY_FALLBACK", "true")
    # Keep unit tests deterministic and independent of a developer's running
    # PostgreSQL/Redis containers. Integration coverage supplies these URLs
    # explicitly when real services are intended.
    monkeypatch.setenv("AXIS_DATABASE_URL", "")
    monkeypatch.setenv("AXIS_REDIS_URL", "")
    monkeypatch.setenv("AXIS_FIRMS_MAP_KEY", "")
    from app.core.config import get_settings

    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
