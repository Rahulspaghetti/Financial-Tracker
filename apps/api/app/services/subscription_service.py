"""
Tally API — Subscription detection service.
"""

import re
from datetime import date, timedelta
from statistics import median

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.subscriptions.schemas import SubscriptionResponse
from app.models.account import Account
from app.models.transaction import Transaction


def _normalize_merchant(name: str | None) -> str:
    if not name:
        return "unknown"
    normalized = name.lower().strip()
    normalized = re.sub(r"\s+#\d+$", "", normalized)
    normalized = re.sub(r"\s+\d{4,}$", "", normalized)
    return normalized


def _detect_frequency(days_between: list[float]) -> str | None:
    if len(days_between) < 1:
        return None
    avg = sum(days_between) / len(days_between)
    if 25 <= avg <= 35:
        return "monthly"
    if 350 <= avg <= 380:
        return "annual"
    if 6 <= avg <= 8:
        return "weekly"
    return None


async def detect_subscriptions(
    db: AsyncSession,
    user_id: str,
) -> list[SubscriptionResponse]:
    lookback = date.today() - timedelta(days=365)

    stmt = (
        select(Transaction)
        .join(Account, Transaction.account_id == Account.id)
        .where(
            Account.user_id == user_id,
            Transaction.date >= lookback,
            Transaction.amount > 0,
            Transaction.pending.is_(False),
            Transaction.merchant_name.isnot(None),
        )
        .order_by(Transaction.merchant_name, Transaction.date)
    )
    result = await db.execute(stmt)
    transactions = result.scalars().all()

    groups: dict[str, list[Transaction]] = {}
    for tx in transactions:
        key = _normalize_merchant(tx.merchant_name)
        groups.setdefault(key, []).append(tx)

    subscriptions: list[SubscriptionResponse] = []

    for merchant_key, txs in groups.items():
        if len(txs) < 2:
            continue

        amounts = [float(tx.amount) for tx in txs]
        med = median(amounts)
        filtered = [tx for tx in txs if med * 0.9 <= float(tx.amount) <= med * 1.1]
        if len(filtered) < 2:
            continue

        dates = sorted(tx.date for tx in filtered)
        gaps = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]
        frequency = _detect_frequency([float(g) for g in gaps])
        if not frequency:
            continue

        last_tx = filtered[-1]
        avg_amount = sum(float(tx.amount) for tx in filtered) / len(filtered)

        if frequency == "monthly":
            next_date = last_tx.date + timedelta(days=30)
        elif frequency == "annual":
            next_date = last_tx.date + timedelta(days=365)
        else:
            next_date = last_tx.date + timedelta(days=7)

        days_since = (date.today() - last_tx.date).days
        is_active = days_since <= (35 if frequency == "monthly" else 400)

        subscriptions.append(
            SubscriptionResponse(
                merchant_name=last_tx.merchant_name or merchant_key,
                amount=round(avg_amount, 2),
                frequency=frequency,
                last_charge_date=last_tx.date.isoformat(),
                next_estimated_date=next_date.isoformat(),
                category=last_tx.category,
                logo_url=last_tx.logo_url,
                is_active=is_active,
            )
        )

    subscriptions.sort(key=lambda s: s.amount, reverse=True)
    return subscriptions
