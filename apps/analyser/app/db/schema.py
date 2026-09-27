from pathlib import Path


async def initialize_schema(engine) -> None:
    """Apply the checked-in schema when a real database is configured."""
    from sqlalchemy import text

    schema = Path(__file__).with_name("schema.sql").read_text()
    statements = [statement.strip() for statement in schema.split(";") if statement.strip()]
    async with engine.begin() as connection:
        for statement in statements:
            await connection.execute(text(statement))
