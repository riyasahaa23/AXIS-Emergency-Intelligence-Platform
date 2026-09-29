from app.core.config import normalize_database_url


def test_normalize_render_postgres_url():
    assert normalize_database_url("postgresql://user:pass@host/db") == "postgresql+asyncpg://user:pass@host/db"


def test_normalize_legacy_postgres_url():
    assert normalize_database_url("postgres://user:pass@host/db") == "postgresql+asyncpg://user:pass@host/db"


def test_preserve_async_postgres_url():
    url = "postgresql+asyncpg://user:pass@host/db"
    assert normalize_database_url(url) == url
