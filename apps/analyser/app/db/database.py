from collections.abc import AsyncIterator

from app.core.config import normalize_database_url


def create_async_engine(database_url: str):
    """Create a SQLAlchemy engine lazily so local in-memory mode needs no DB package."""
    if not database_url:
        return None
    try:
        from sqlalchemy.ext.asyncio import (
            create_async_engine as sqlalchemy_create_async_engine,
        )
    except ImportError as exc:
        raise RuntimeError("Install the 'database' extra to use PostgreSQL") from exc
    return sqlalchemy_create_async_engine(normalize_database_url(database_url), pool_pre_ping=True)


async def dispose_engine(engine) -> None:
    if engine is not None:
        await engine.dispose()


async def session_scope(engine) -> AsyncIterator[object]:
    if engine is None:
        raise RuntimeError("A database engine is required for database sessions")
    from sqlalchemy.ext.asyncio import async_sessionmaker

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
