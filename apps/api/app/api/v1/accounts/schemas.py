"""
Tally API — Account response schemas.
"""

from datetime import datetime

from pydantic import BaseModel


class AccountResponse(BaseModel):
    id: str
    plaid_account_id: str
    name: str
    official_name: str | None
    type: str
    subtype: str | None
    balance_current: float
    balance_available: float | None
    currency_code: str
    institution_name: str | None
    institution_logo: str | None
    plaid_item_id: str
    last_synced_at: datetime | None

    model_config = {"from_attributes": True}
