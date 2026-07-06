"""
Alembic env.py — wired to the async SQLAlchemy engine.

Run migrations:
    alembic upgrade head

Generate a new migration:
    alembic revision --autogenerate -m "describe the change"
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# ── Import all models so Alembic can detect schema changes ───────────────────
# This must happen before Base.metadata is accessed.
from app.db.base import Base  # noqa: F401 — registers Base.metadata
from app.models.user import User  # noqa: F401
from app.models.plaid_item import PlaidItem  # noqa: F401
from app.models.account import Account  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.core.config import get_settings

settings = get_settings()

# ── Alembic config object ──────────────────────────────────────────────────
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata object for 'autogenerate' support
target_metadata = Base.metadata


# ── Offline migrations (generate SQL without DB connection) ───────────────────

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.database_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online migrations (run against a live DB) ─────────────────────────────────

def do_run_migrations(connection: object) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)  # type: ignore[arg-type]
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create an async engine and run migrations."""
    async_engine = create_async_engine(settings.database_url)
    async with async_engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await async_engine.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


# ── Entry point ───────────────────────────────────────────────────────────────

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
