"""
Tally API — SQLAlchemy async engine and declarative base.
Import Base from here in every ORM model, then import the models
in alembic/env.py so migrations can detect schema changes.
"""

from sqlalchemy.ext.asyncio import AsyncAttrs, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

# ── Async engine ──────────────────────────────────────────────────────────────

engine = create_async_engine(
    settings.database_url,
    # Echo SQL in debug mode only — never in production
    echo=settings.debug,
    # Connection pool settings tuned for a single-process FastAPI app
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Check connections before use (handles DB restarts)
)


# ── Declarative base ──────────────────────────────────────────────────────────

class Base(AsyncAttrs, DeclarativeBase):
    """
    Base class for all ORM models.
    AsyncAttrs mixin adds async-friendly relationship loading helpers.
    """
    pass
