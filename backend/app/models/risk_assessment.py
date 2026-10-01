import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    media_asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media_assets.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    risk_score: Mapped[Decimal] = mapped_column(
        Numeric(8, 4),
        nullable=False,
    )

    risk_band: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    evidence_coverage: Mapped[Decimal] = mapped_column(
        Numeric(8, 4),
        nullable=False,
    )

    consistency_score: Mapped[Decimal] = mapped_column(
        Numeric(8, 4),
        nullable=False,
    )

    signal_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    supporting_signal_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    contradicting_signal_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    explanation: Mapped[str] = mapped_column(
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
        back_populates="risk_assessment",
    )
