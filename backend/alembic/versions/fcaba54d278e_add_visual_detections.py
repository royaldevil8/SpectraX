"""add visual detections

Revision ID: fcaba54d278e
Revises: 3e6ea7ac6b64
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "fcaba54d278e"
down_revision: Union[str, Sequence[str], None] = "3e6ea7ac6b64"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "visual_detections" in inspector.get_table_names():
        return

    op.create_table(
        "visual_detections",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "media_frame_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "score",
            sa.Numeric(8, 7),
            nullable=False,
        ),
        sa.Column(
            "model_name",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "model_version",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "face_detected",
            sa.Boolean(),
            nullable=False,
        ),
        sa.Column(
            "processing_time_ms",
            sa.Numeric(12, 3),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["media_frame_id"],
            ["media_frames.id"],
            name="visual_detections_media_frame_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name="visual_detections_pkey",
        ),
        sa.UniqueConstraint(
            "media_frame_id",
            "model_name",
            "model_version",
            name="uq_visual_detection_frame_model_version",
        ),
    )

    op.create_index(
        "ix_visual_detections_media_frame_id",
        "visual_detections",
        ["media_frame_id"],
        unique=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "visual_detections" not in inspector.get_table_names():
        return

    op.drop_index(
        "ix_visual_detections_media_frame_id",
        table_name="visual_detections",
    )

    op.drop_table("visual_detections")
