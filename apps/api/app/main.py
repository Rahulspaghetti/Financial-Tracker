"""
Tally API — FastAPI application factory.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.accounts.router import router as accounts_router
from app.api.v1.auth.router import router as auth_router
from app.api.v1.plaid.router import router as plaid_router
from app.api.v1.subscriptions.router import router as subscriptions_router
from app.api.v1.transactions.router import router as transactions_router
from app.api.v1.users.router import router as users_router
from app.core.config import get_settings
from app.db.base import engine

settings = get_settings()


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: nothing to do here in Phase 1 (migrations run via Alembic CLI).
    # Phase 2: warm up connection pool, initialise Plaid client, etc.
    yield
    # Shutdown: dispose engine to close all pooled connections cleanly.
    await engine.dispose()


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Tally personal finance API",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    api_prefix = "/api/v1"
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(users_router, prefix=api_prefix)
    app.include_router(transactions_router, prefix=api_prefix)
    app.include_router(plaid_router, prefix=api_prefix)
    app.include_router(accounts_router, prefix=api_prefix)
    app.include_router(subscriptions_router, prefix=api_prefix)

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", include_in_schema=False)
    async def health() -> JSONResponse:
        return JSONResponse({"status": "ok", "version": settings.app_version})

    return app


# ── ASGI entrypoint ───────────────────────────────────────────────────────────

app = create_app()
