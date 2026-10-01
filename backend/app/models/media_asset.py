import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, BigInteger, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )

    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    sha256: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="ingested",
        server_default="ingested",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    case = relationship(
        "Case",
        back_populates="media_assets",
    )

    versions = relationship(
        "MediaVersion",
        back_populates="media_asset",
        cascade="all, delete-orphan",
    )

    media_metadata = relationship(
        "MediaMetadata",
        back_populates="media_asset",
        uselist=False,
        cascade="all, delete-orphan",
    )

    frames = relationship(
        "MediaFrame",
        back_populates="media_asset",
        cascade="all, delete-orphan",
    )

    evidence_items = relationship(
        "EvidenceItem",
        back_populates="media_asset",
        cascade="all, delete-orphan",
    )

    risk_assessment = relationship(
        "RiskAssessment",
        back_populates="media_asset",
        uselist=False,
        cascade="all, delete-orphan",
    )

    provenance_record = relationship(
        "ProvenanceRecord",
        back_populates="media_asset",
        uselist=False,
        cascade="all, delete-orphan",
    )
