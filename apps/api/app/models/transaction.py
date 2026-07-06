"""
Tally API — Transaction ORM model.
Represents a single financial transaction associated with an Account.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    # Plaid transaction ID — nullable for manually entered transactions
    plaid_transaction_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True, index=True
    )
    account_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Positive = expense (money out). Negative = income (money in).
    # Stored as NUMERIC(15, 2) for exact decimal arithmetic.
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    # "debit" | "credit"
    type: Mapped[str] = mapped_column(String(20), nullable=False, default="debit")
    # Display name from Plaid or manual entry
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    merchant_name: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    # Category name stored as a string; FK to a categories table added in Phase 2
    category: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    category_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    # ISO 8601 date of the transaction (not datetime — Plaid returns dates)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    pending: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    account: Mapped["Account"] = relationship("Account", back_populates="transactions")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Transaction id={self.id!r} name={self.name!r} amount={self.amount!r}>"
