"""
Tally API — Plaid service.
Wraps the plaid-python SDK for Link, account fetch, and transaction sync.
"""

from datetime import UTC, date as date_type, datetime

from plaid.api import plaid_api
from plaid.api_client import ApiClient
from plaid.configuration import Configuration
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.item_remove_request import ItemRemoveRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.encryption import decrypt_token, encrypt_token
from app.models.account import Account
from app.models.plaid_item import PlaidItem
from app.models.transaction import Transaction
from app.models.user import User

settings = get_settings()

PLAID_ENV_MAP = {
    "sandbox": "https://sandbox.plaid.com",
    "development": "https://development.plaid.com",
    "production": "https://production.plaid.com",
}


def _as_dict(obj: object) -> dict:
    if isinstance(obj, dict):
        return obj
    if hasattr(obj, "to_dict"):
        return obj.to_dict()
    return dict(obj)


def _get_plaid_client() -> plaid_api.PlaidApi:
    configuration = Configuration(
        host=PLAID_ENV_MAP[settings.plaid_env],
        api_key={
            "clientId": settings.plaid_client_id,
            "secret": settings.plaid_secret,
        },
    )
    return plaid_api.PlaidApi(ApiClient(configuration))


def create_link_token(user_id: str) -> tuple[str, str]:
    client = _get_plaid_client()
    request = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(client_user_id=user_id),
        client_name="Tally",
        products=[Products("transactions")],
        country_codes=[CountryCode("US")],
        language="en",
    )
    response = client.link_token_create(request)
    data = _as_dict(response)
    expiration = data["expiration"]
    exp_str = expiration.isoformat() if hasattr(expiration, "isoformat") else str(expiration)
    return data["link_token"], exp_str


async def exchange_public_token(
    db: AsyncSession,
    user: User,
    public_token: str,
    institution_id: str | None,
    institution_name: str | None,
) -> PlaidItem:
    client = _get_plaid_client()
    exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
    exchange_response = client.item_public_token_exchange(exchange_request)
    exchange_data = _as_dict(exchange_response)
    access_token = exchange_data["access_token"]
    plaid_item_id = exchange_data["item_id"]

    item = PlaidItem(
        user_id=user.id,
        plaid_item_id=plaid_item_id,
        access_token_encrypted=encrypt_token(access_token),
        institution_id=institution_id,
        institution_name=institution_name,
    )
    db.add(item)
    await db.flush()

    await _upsert_accounts(db, client, item, access_token, institution_name)
    await sync_transactions_for_item(db, item)
    return item


async def _upsert_accounts(
    db: AsyncSession,
    client: plaid_api.PlaidApi,
    item: PlaidItem,
    access_token: str,
    institution_name: str | None,
) -> list[Account]:
    response = client.accounts_get(AccountsGetRequest(access_token=access_token))
    response_data = _as_dict(response)
    accounts: list[Account] = []

    for acct in response_data.get("accounts", []):
        acct = _as_dict(acct)
        plaid_account_id = acct["account_id"]
        result = await db.execute(
            select(Account).where(Account.plaid_account_id == plaid_account_id)
        )
        existing = result.scalar_one_or_none()

        balances = _as_dict(acct.get("balances") or {})
        current = float(balances.get("current") or 0)
        available = balances.get("available")
        available_float = float(available) if available is not None else None

        if existing:
            existing.name = acct.get("name") or existing.name
            existing.official_name = acct.get("official_name")
            existing.type = acct.get("type") or existing.type
            existing.subtype = acct.get("subtype")
            existing.balance_current = current
            existing.balance_available = available_float
            existing.institution_name = institution_name
            existing.last_synced_at = datetime.now(UTC)
            accounts.append(existing)
        else:
            account = Account(
                plaid_account_id=plaid_account_id,
                user_id=item.user_id,
                plaid_item_id=item.id,
                name=acct.get("name") or "Account",
                official_name=acct.get("official_name"),
                type=acct.get("type") or "other",
                subtype=acct.get("subtype"),
                balance_current=current,
                balance_available=available_float,
                institution_name=institution_name,
                last_synced_at=datetime.now(UTC),
            )
            db.add(account)
            accounts.append(account)

    await db.flush()
    return accounts


async def sync_transactions_for_item(db: AsyncSession, item: PlaidItem) -> int:
    client = _get_plaid_client()
    access_token = decrypt_token(item.access_token_encrypted)
    cursor = item.cursor
    added_count = 0
    has_more = True

    account_map: dict[str, Account] = {}
    result = await db.execute(select(Account).where(Account.plaid_item_id == item.id))
    for account in result.scalars().all():
        account_map[account.plaid_account_id] = account

    while has_more:
        request = TransactionsSyncRequest(access_token=access_token, cursor=cursor)
        response = client.transactions_sync(request)
        sync_data = _as_dict(response)

        for plaid_tx in sync_data.get("added", []):
            account = account_map.get(_as_dict(plaid_tx)["account_id"])
            if not account:
                continue
            await _upsert_transaction(db, account, _as_dict(plaid_tx))
            added_count += 1

        for plaid_tx in sync_data.get("modified", []):
            account = account_map.get(_as_dict(plaid_tx)["account_id"])
            if not account:
                continue
            await _upsert_transaction(db, account, _as_dict(plaid_tx))

        for plaid_tx in sync_data.get("removed", []):
            removed = _as_dict(plaid_tx)
            tx_id = removed.get("transaction_id")
            if not tx_id:
                continue
            result = await db.execute(
                select(Transaction).where(Transaction.plaid_transaction_id == tx_id)
            )
            existing = result.scalar_one_or_none()
            if existing:
                await db.delete(existing)

        cursor = sync_data.get("next_cursor")
        has_more = sync_data.get("has_more", False)

    item.cursor = cursor
    item.last_synced_at = datetime.now(UTC)
    await db.flush()
    return added_count


async def _upsert_transaction(
    db: AsyncSession, account: Account, plaid_tx: dict
) -> Transaction:
    plaid_transaction_id = plaid_tx["transaction_id"]
    result = await db.execute(
        select(Transaction).where(Transaction.plaid_transaction_id == plaid_transaction_id)
    )
    existing = result.scalar_one_or_none()

    amount = float(plaid_tx.get("amount") or 0)
    tx_type = "debit" if amount > 0 else "credit"

    pfc = _as_dict(plaid_tx.get("personal_finance_category") or {})
    category = pfc.get("primary") or (
        (plaid_tx.get("category") or [None])[0] if plaid_tx.get("category") else None
    )

    tx_date = plaid_tx["date"]
    if isinstance(tx_date, str):
        tx_date = date_type.fromisoformat(tx_date)

    fields = {
        "account_id": account.id,
        "amount": amount,
        "type": tx_type,
        "name": plaid_tx.get("name") or "Transaction",
        "merchant_name": plaid_tx.get("merchant_name") or plaid_tx.get("name"),
        "category": category,
        "date": tx_date,
        "pending": bool(plaid_tx.get("pending", False)),
        "logo_url": plaid_tx.get("logo_url"),
    }

    if existing:
        for key, value in fields.items():
            setattr(existing, key, value)
        return existing

    tx = Transaction(plaid_transaction_id=plaid_transaction_id, **fields)
    db.add(tx)
    return tx


async def sync_all_user_items(db: AsyncSession, user_id: str) -> int:
    result = await db.execute(select(PlaidItem).where(PlaidItem.user_id == user_id))
    items = result.scalars().all()
    total = 0
    for item in items:
        client = _get_plaid_client()
        access_token = decrypt_token(item.access_token_encrypted)
        await _upsert_accounts(db, client, item, access_token, item.institution_name)
        total += await sync_transactions_for_item(db, item)
    return total


async def remove_plaid_item(db: AsyncSession, user_id: str, item_id: str) -> None:
    result = await db.execute(
        select(PlaidItem).where(PlaidItem.id == item_id, PlaidItem.user_id == user_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        return

    client = _get_plaid_client()
    access_token = decrypt_token(item.access_token_encrypted)
    try:
        client.item_remove(ItemRemoveRequest(access_token=access_token))
    except Exception:
        pass  # Item may already be removed on Plaid side

    await db.delete(item)
