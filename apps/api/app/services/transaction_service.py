"""
Tally API — Transaction analytics service.
"""

from datetime import date, timedelta

from sqlalchemy import and_, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.transactions.schemas import (
    CategorySpendResponse,
    DailyTotalResponse,
    SpendingSummaryResponse,
)
from app.models.account import Account
from app.models.transaction import Transaction

Period = str  # 'week' | 'month' | 'quarter' | 'year'


def _period_bounds(period: Period, reference: date | None = None) -> tuple[date, date, date, date]:
    today = reference or date.today()

    if period == "week":
        start = today - timedelta(days=today.weekday())
        end = today
        prior_end = start - timedelta(days=1)
        prior_start = prior_end - timedelta(days=6)
    elif period == "quarter":
        quarter_month = ((today.month - 1) // 3) * 3 + 1
        start = date(today.year, quarter_month, 1)
        end = today
        prior_start = date(today.year, quarter_month - 3, 1) if quarter_month > 1 else date(today.year - 1, 10, 1)
        prior_end = start - timedelta(days=1)
    elif period == "year":
        start = date(today.year, 1, 1)
        end = today
        prior_start = date(today.year - 1, 1, 1)
        prior_end = date(today.year - 1, 12, 31)
    else:  # month
        start = date(today.year, today.month, 1)
        end = today
        if today.month == 1:
            prior_start = date(today.year - 1, 12, 1)
            prior_end = date(today.year - 1, 12, 31)
        else:
            prior_start = date(today.year, today.month - 1, 1)
            prior_end = start - timedelta(days=1)

    return start, end, prior_start, prior_end


def _delta(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0 if current == 0 else 1.0
    return (current - previous) / previous


async def _sum_in_range(
    db: AsyncSession,
    user_id: str,
    start: date,
    end: date,
    expense_only: bool = False,
    income_only: bool = False,
) -> float:
    amount_col = Transaction.amount
    conditions = [
        Account.user_id == user_id,
        Transaction.date >= start,
        Transaction.date <= end,
        Transaction.pending.is_(False),
    ]
    if expense_only:
        conditions.append(amount_col > 0)
    if income_only:
        conditions.append(amount_col < 0)

    stmt = (
        select(func.coalesce(func.sum(func.abs(amount_col)), 0))
        .select_from(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .where(and_(*conditions))
    )
    result = await db.execute(stmt)
    return float(result.scalar_one())


async def get_spending_summary(
    db: AsyncSession,
    user_id: str,
    period: Period = "month",
) -> SpendingSummaryResponse:
    start, end, prior_start, prior_end = _period_bounds(period)

    total_spend = await _sum_in_range(db, user_id, start, end, expense_only=True)
    total_income = await _sum_in_range(db, user_id, start, end, income_only=True)
    prior_spend = await _sum_in_range(db, user_id, prior_start, prior_end, expense_only=True)
    prior_income = await _sum_in_range(db, user_id, prior_start, prior_end, income_only=True)

    # Category breakdown (expenses only)
    cat_stmt = (
        select(
            func.coalesce(Transaction.category, "OTHER").label("category"),
            func.sum(Transaction.amount).label("amount"),
            func.count(Transaction.id).label("count"),
        )
        .join(Account, Transaction.account_id == Account.id)
        .where(
            Account.user_id == user_id,
            Transaction.date >= start,
            Transaction.date <= end,
            Transaction.amount > 0,
            Transaction.pending.is_(False),
        )
        .group_by(func.coalesce(Transaction.category, "OTHER"))
        .order_by(func.sum(Transaction.amount).desc())
    )
    cat_result = await db.execute(cat_stmt)
    cat_rows = cat_result.all()

    by_category: list[CategorySpendResponse] = []
    top_n = 8
    other_amount = 0.0
    other_count = 0

    for i, row in enumerate(cat_rows):
        amount = float(row.amount)
        count = int(row.count)
        if i < top_n:
            by_category.append(
                CategorySpendResponse(
                    category=row.category,
                    amount=amount,
                    percentage=amount / total_spend if total_spend else 0,
                    transaction_count=count,
                )
            )
        else:
            other_amount += amount
            other_count += count

    if other_amount > 0:
        by_category.append(
            CategorySpendResponse(
                category="OTHER",
                amount=other_amount,
                percentage=other_amount / total_spend if total_spend else 0,
                transaction_count=other_count,
            )
        )

    # Daily totals
    daily_stmt = (
        select(
            Transaction.date,
            func.sum(case((Transaction.amount > 0, Transaction.amount), else_=0)).label("spend"),
            func.sum(
                case((Transaction.amount < 0, func.abs(Transaction.amount)), else_=0)
            ).label("income"),
        )
        .join(Account, Transaction.account_id == Account.id)
        .where(
            Account.user_id == user_id,
            Transaction.date >= start,
            Transaction.date <= end,
            Transaction.pending.is_(False),
        )
        .group_by(Transaction.date)
        .order_by(Transaction.date)
    )
    daily_result = await db.execute(daily_stmt)
    daily_totals = [
        DailyTotalResponse(
            date=row.date.isoformat(),
            spend=float(row.spend or 0),
            income=float(row.income or 0),
        )
        for row in daily_result.all()
    ]

    return SpendingSummaryResponse(
        period=period,
        total_spend=total_spend,
        total_income=total_income,
        net_cash_flow=total_income - total_spend,
        spend_delta=_delta(total_spend, prior_spend),
        income_delta=_delta(total_income, prior_income),
        by_category=by_category,
        daily_totals=daily_totals,
    )
