"""
Tally API — PlaidItem ORM model.
One Plaid Item per institution connection; holds the access token and sync cursor.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PlaidItem(Base):
    __tablename__ = "plaid_items"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plaid_item_id: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    access_token_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    institution_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    institution_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Plaid transactions/sync cursor for incremental updates
    cursor: Mapped[str | None] = mapped_column(String(512), nullable=True)
    last_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="plaid_items")  # noqa: F821
    accounts: Mapped[list["Account"]] = relationship(  # noqa: F821
        "Account", back_populates="plaid_item", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<PlaidItem id={self.id!r} institution={self.institution_name!r}>"
