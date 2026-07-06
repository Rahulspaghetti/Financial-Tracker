"""
Tally API — Accounts router.

GET /api/v1/accounts — List linked accounts for the current user.
"""

from fastapi import APIRouter
from sqlalchemy import select

from app.api.v1.accounts.schemas import AccountResponse
from app.core.deps import CurrentUser, DbSession
from app.models.account import Account

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get(
    "",
    response_model=list[AccountResponse],
    summary="List linked accounts for the authenticated user",
)
async def list_accounts(
    current_user: CurrentUser,
    db: DbSession,
) -> list[AccountResponse]:
    result = await db.execute(
        select(Account)
        .where(Account.user_id == current_user.id)
        .order_by(Account.institution_name, Account.name)
    )
    accounts = result.scalars().all()
    return [AccountResponse.model_validate(a) for a in accounts]
