"""
Tally API — Plaid request/response schemas.
"""

from pydantic import BaseModel


class LinkTokenResponse(BaseModel):
    link_token: str
    expiration: str


class ExchangeTokenRequest(BaseModel):
    public_token: str
    institution_id: str
    institution_name: str


class ExchangeTokenResponse(BaseModel):
    account_ids: list[str]
    message: str = "Accounts connected successfully"


class SyncResponse(BaseModel):
    transactions_synced: int
    message: str = "Sync completed"
