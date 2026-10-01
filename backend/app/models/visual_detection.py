import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class VisualDetection(Base):
    __tablename__ = "visual_detections"

    __table_args__ = (
        UniqueConstraint(
            "media_frame_id",
            "model_name",
            "model_version",
            name="uq_visual_detection_frame_model_version",
        ),
        Index(
            "ix_visual_detections_media_frame_id",
            "media_frame_id",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    media_frame_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media_frames.id", ondelete="CASCADE"),
        nullable=False,
    )

    score: Mapped[Decimal] = mapped_column(
        Numeric(8, 7),
        nullable=False,
    )

    model_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    model_version: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    face_detected: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    processing_time_ms: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 3),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    media_frame = relationship(
        "MediaFrame",
        back_populates="visual_detections",
    )
