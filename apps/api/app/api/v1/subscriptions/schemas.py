"""
Tally API — Subscription response schemas.
"""

from pydantic import BaseModel


class SubscriptionResponse(BaseModel):
    merchant_name: str
    amount: float
    frequency: str
    last_charge_date: str
    next_estimated_date: str
    category: str | None
    logo_url: str | None
    is_active: bool
