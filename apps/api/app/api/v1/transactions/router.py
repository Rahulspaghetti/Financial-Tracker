"""
Tally API — Transactions router.

GET /api/v1/transactions        — Paginated list of transactions for the current user.
GET /api/v1/transactions/summary — Spending summary for a given period (Phase 2).
"""

from datetime import date

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.api.v1.transactions.schemas import (
    PaginatedResponse,
    SpendingSummaryResponse,
    TransactionResponse,
)
from app.core.deps import CurrentUser, DbSession
from app.models.account import Account
from app.models.transaction import Transaction
from app.services.transaction_service import get_spending_summary

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get(
    "",
    response_model=PaginatedResponse[TransactionResponse],
    summary="List transactions for the authenticated user",
)
async def list_transactions(
    current_user: CurrentUser,
    db: DbSession,
    account_id: str | None = Query(None),
    category_id: str | None = Query(None),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    search: str | None = Query(None, max_length=200),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
) -> PaginatedResponse[TransactionResponse]:
    """
    Returns a paginated list of transactions belonging to the current user.
    Supports optional filtering by account, category, date range, and search text.
    """
    # Base query — join through accounts to enforce user ownership
    stmt = (
        select(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .where(Account.user_id == current_user.id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
    )

    if account_id:
        stmt = stmt.where(Transaction.account_id == account_id)
    if category_id:
        stmt = stmt.where(Transaction.category_id == category_id)
    if start_date:
        stmt = stmt.where(Transaction.date >= start_date)
    if end_date:
        stmt = stmt.where(Transaction.date <= end_date)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            Transaction.name.ilike(pattern) | Transaction.merchant_name.ilike(pattern)
        )

    # Count total matching rows
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = (await db.execute(count_stmt)).scalar_one()

    # Apply pagination
    offset = (page - 1) * page_size
    result = await db.execute(stmt.offset(offset).limit(page_size))
    transactions = result.scalars().all()

    return PaginatedResponse(
        data=[TransactionResponse.model_validate(t) for t in transactions],
        total=total,
        page=page,
        page_size=page_size,
        has_next_page=(offset + page_size) < total,
    )


@router.get(
    "/summary",
    response_model=SpendingSummaryResponse,
    summary="Spending summary for a given period",
)
async def get_transactions_summary(
    current_user: CurrentUser,
    db: DbSession,
    period: str = Query("month", pattern="^(week|month|quarter|year)$"),
) -> SpendingSummaryResponse:
    return await get_spending_summary(db, current_user.id, period)
