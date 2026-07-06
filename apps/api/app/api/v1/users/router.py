"""
Tally API — Users router.

GET /api/v1/users/me  — Return the authenticated user's profile.
"""

from fastapi import APIRouter

from app.api.v1.users.schemas import UserResponse
from app.core.deps import CurrentUser

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the authenticated user's profile",
)
async def get_me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)
