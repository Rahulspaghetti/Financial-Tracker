"""
Tally API — Plaid router.

POST /api/v1/plaid/link-token  — Create a Plaid Link token for the frontend SDK.
POST /api/v1/plaid/exchange    — Exchange a Plaid public_token for an access_token.
POST /api/v1/plaid/sync        — Sync transactions for all linked items.
DELETE /api/v1/plaid/items/{item_id} — Disconnect an institution.
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.v1.plaid.schemas import (
    ExchangeTokenRequest,
    ExchangeTokenResponse,
    LinkTokenResponse,
    SyncResponse,
)
from app.core.config import get_settings
from app.core.deps import CurrentUser, DbSession
from app.models.account import Account
from app.services import plaid_service

router = APIRouter(prefix="/plaid", tags=["plaid"])
settings = get_settings()


@router.post(
    "/link-token",
    response_model=LinkTokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a Plaid Link token",
)
async def create_link_token(
    current_user: CurrentUser,
    db: DbSession,  # noqa: ARG001
) -> LinkTokenResponse:
    if not settings.plaid_client_id or not settings.plaid_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Plaid is not configured",
        )
    try:
        link_token, expiration = plaid_service.create_link_token(current_user.id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to create Plaid link token: {exc}",
        ) from exc
    return LinkTokenResponse(link_token=link_token, expiration=expiration)


@router.post(
    "/exchange",
    response_model=ExchangeTokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Exchange a Plaid public_token for a persistent access_token",
)
async def exchange_public_token(
    body: ExchangeTokenRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> ExchangeTokenResponse:
    try:
        item = await plaid_service.exchange_public_token(
            db,
            current_user,
            body.public_token,
            body.institution_id,
            body.institution_name,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to exchange Plaid token: {exc}",
        ) from exc

    result = await db.execute(select(Account).where(Account.plaid_item_id == item.id))
    account_ids = [a.id for a in result.scalars().all()]
    return ExchangeTokenResponse(account_ids=account_ids)


@router.post(
    "/sync",
    response_model=SyncResponse,
    summary="Sync transactions for all linked Plaid items",
)
async def sync_transactions(
    current_user: CurrentUser,
    db: DbSession,
) -> SyncResponse:
    try:
        count = await plaid_service.sync_all_user_items(db, current_user.id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to sync transactions: {exc}",
        ) from exc
    return SyncResponse(transactions_synced=count, message="Sync completed")


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Disconnect a linked institution",
)
async def disconnect_item(
    item_id: str,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    await plaid_service.remove_plaid_item(db, current_user.id, item_id)
