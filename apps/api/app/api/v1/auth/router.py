"""
Tally API — Auth router.

POST /api/v1/auth/google   — Validate Google id_token, upsert user, return Tally JWTs.
POST /api/v1/auth/refresh  — Exchange a valid refresh token for a new access token.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.exceptions import GoogleAuthError
from google.oauth2 import id_token as google_id_token
from google.auth.transport.requests import Request as GoogleRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.schemas import GoogleAuthRequest, RefreshRequest, TokenResponse
from app.core.config import get_settings
from app.core.deps import DbSession
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post(
    "/google",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Exchange a Google id_token for Tally JWTs",
)
async def google_auth(
    body: GoogleAuthRequest,
    db: DbSession,
) -> TokenResponse:
    """
    1. Verify the Google id_token with Google's public keys.
    2. Upsert the user record in the database.
    3. Return a Tally access_token + refresh_token pair.
    """
    # ── Verify Google token ───────────────────────────────────────────────────
    try:
        id_info: dict[str, Any] = google_id_token.verify_oauth2_token(
            body.id_token,
            GoogleRequest(),
            settings.google_client_id,
        )
    except (GoogleAuthError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {exc}",
        ) from exc

    google_id = str(id_info["sub"])
    email: str = id_info["email"]
    name: str = id_info.get("name", email.split("@")[0])
    avatar_url: str | None = id_info.get("picture")

    # ── Upsert user ───────────────────────────────────────────────────────────
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user is None:
        # Check for existing email match (account linking)
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

    if user is None:
        user = User(
            email=email,
            google_id=google_id,
            name=name,
            avatar_url=avatar_url,
        )
        db.add(user)
        await db.flush()  # Populate user.id before creating tokens
    else:
        # Update mutable fields
        user.google_id = google_id
        user.name = name
        user.avatar_url = avatar_url

    # ── Issue tokens ──────────────────────────────────────────────────────────
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Exchange a refresh token for a new access token",
)
async def refresh_token(
    body: RefreshRequest,
    db: DbSession,
) -> TokenResponse:
    """
    Verify the refresh token, confirm the user still exists, and issue
    a fresh access token (plus a rotated refresh token).
    """
    from jose import JWTError

    try:
        user_id = verify_refresh_token(body.refresh_token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        ) from exc

    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        expires_in=settings.access_token_expire_minutes * 60,
    )
