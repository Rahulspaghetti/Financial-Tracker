"""
Tally API — Application settings.
All values are read from environment variables (or a .env file via pydantic-settings).
"""

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ───────────────────────────────────────────────────────────────────
    app_name: str = "Tally API"
    app_version: str = "0.1.0"
    debug: bool = False

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://tally:tally_dev@localhost:5432/tally"

    # ── JWT / Auth ────────────────────────────────────────────────────────────
    jwt_secret: str = "change_me_in_production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    # ── Google OAuth ──────────────────────────────────────────────────────────
    google_client_id: str = ""

    # ── Plaid ─────────────────────────────────────────────────────────────────
    plaid_env: Literal["sandbox", "development", "production"] = "sandbox"
    plaid_client_id: str = ""
    plaid_secret: str = ""
    # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    plaid_token_encryption_key: str = ""

    # ── Anthropic ─────────────────────────────────────────────────────────────
    anthropic_api_key: str = ""

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list, e.g. "http://localhost:3000,https://app.tally.money"
    allowed_origins: str = "http://localhost:3000"

    @computed_field  # type: ignore[misc]
    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (loaded once at startup)."""
    return Settings()
