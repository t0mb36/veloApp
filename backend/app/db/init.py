"""Database initialization module.

Creates all tables on application startup if they don't exist.
This is useful for development and initial deployments.
For production, consider using Alembic migrations for more control.
"""

from sqlalchemy import text

from app.db.models.base import Base
from app.db.session import engine

# Import all models to ensure they're registered with Base.metadata
from app.db.models import item, user  # noqa: F401


async def init_db() -> None:
    """Create all database tables if they don't exist.

    Uses SQLAlchemy's create_all which is idempotent - it only creates
    tables that don't already exist.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def check_db_connection() -> bool:
    """Check if the database is reachable.

    Returns:
        True if connection successful, False otherwise.
    """
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
