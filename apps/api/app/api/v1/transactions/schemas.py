"""
Tally API — Transaction request/response schemas.
"""

from datetime import date, datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    total: int
    page: int
    page_size: int
    has_next_page: bool


class TransactionResponse(BaseModel):
    id: str
    plaid_transaction_id: str | None
    account_id: str
    amount: float
    type: str
    name: str
    merchant_name: str | None
    category: str | None
    category_id: str | None
    date: date
    pending: bool
    notes: str | None
    logo_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class CategorySpendResponse(BaseModel):
    category: str
    amount: float
    percentage: float
    transaction_count: int


class DailyTotalResponse(BaseModel):
    date: str
    spend: float
    income: float


class SpendingSummaryResponse(BaseModel):
    period: Literal["week", "month", "quarter", "year"]
    total_spend: float
    total_income: float
    net_cash_flow: float
    spend_delta: float
    income_delta: float
    by_category: list[CategorySpendResponse]
    daily_totals: list[DailyTotalResponse]
