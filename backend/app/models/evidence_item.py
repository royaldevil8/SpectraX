import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    media_asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media_assets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    evidence_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )

    track_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    start_seconds: Mapped[Decimal] = mapped_column(
        Numeric(20, 6),
        nullable=False,
    )

    end_seconds: Mapped[Decimal] = mapped_column(
        Numeric(20, 6),
        nullable=False,
    )

    duration_seconds: Mapped[Decimal] = mapped_column(
        Numeric(20, 6),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    media_asset = relationship(
        "MediaAsset",
        back_populates="evidence_items",
    )
