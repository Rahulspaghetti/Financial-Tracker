"""
Tally API — Auth request/response schemas.
"""

from pydantic import BaseModel, Field


class GoogleAuthRequest(BaseModel):
    """Body for POST /api/v1/auth/google — exchange a Google id_token for Tally JWTs."""

    id_token: str = Field(..., description="Google OAuth2 id_token from the frontend")


class TokenResponse(BaseModel):
    """Tally JWT pair returned after successful authentication."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Access token lifetime in seconds")


class RefreshRequest(BaseModel):
    """Body for POST /api/v1/auth/refresh."""

    refresh_token: str
