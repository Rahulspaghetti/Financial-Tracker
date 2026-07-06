"""
Tally API — Account ORM model.
Represents a bank/credit/investment account linked via Plaid.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    # Plaid-assigned account identifier — unique per Plaid item
    plaid_account_id: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    # Foreign key to the owning user
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    official_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # e.g. "checking", "savings", "credit", "investment", "loan"
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    subtype: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Balances stored as NUMERIC(15, 2) for exact decimal arithmetic
    balance_current: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    balance_available: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    currency_code: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    institution_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    institution_logo: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    plaid_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("plaid_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    last_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="accounts")  # noqa: F821
    plaid_item: Mapped["PlaidItem"] = relationship("PlaidItem", back_populates="accounts")  # noqa: F821
    transactions: Mapped[list["Transaction"]] = relationship(  # noqa: F821
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Account id={self.id!r} name={self.name!r} type={self.type!r}>"
