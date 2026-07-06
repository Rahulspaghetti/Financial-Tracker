"""
Tally API — Subscriptions router.

GET /api/v1/subscriptions — Detected recurring charges.
"""

from fastapi import APIRouter

from app.api.v1.subscriptions.schemas import SubscriptionResponse
from app.core.deps import CurrentUser, DbSession
from app.services.subscription_service import detect_subscriptions

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get(
    "",
    response_model=list[SubscriptionResponse],
    summary="List detected recurring subscriptions",
)
async def list_subscriptions(
    current_user: CurrentUser,
    db: DbSession,
) -> list[SubscriptionResponse]:
    return await detect_subscriptions(db, current_user.id)
