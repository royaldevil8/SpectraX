"""add evidence items

Revision ID: 9ee4fa570d95
Revises: fcaba54d278e
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "9ee4fa570d95"
down_revision: Union[str, Sequence[str], None] = "fcaba54d278e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "evidence_items" in inspector.get_table_names():
        return

    op.create_table(
        "evidence_items",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "media_asset_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "evidence_type",
            sa.String(length=64),
            nullable=False,
        ),
        sa.Column(
            "track_id",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "start_seconds",
            sa.Numeric(20, 6),
            nullable=False,
        ),
        sa.Column(
            "end_seconds",
            sa.Numeric(20, 6),
            nullable=False,
        ),
        sa.Column(
            "duration_seconds",
            sa.Numeric(20, 6),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["media_asset_id"],
            ["media_assets.id"],
            name="evidence_items_media_asset_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name="evidence_items_pkey",
        ),
    )

    op.create_index(
        "ix_evidence_items_media_asset_id",
        "evidence_items",
        ["media_asset_id"],
        unique=False,
    )

    op.create_index(
        "ix_evidence_items_evidence_type",
        "evidence_items",
        ["evidence_type"],
        unique=False,
    )

    op.create_index(
        "ix_evidence_items_created_at",
        "evidence_items",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "evidence_items" not in inspector.get_table_names():
        return

    op.drop_index(
        "ix_evidence_items_created_at",
        table_name="evidence_items",
    )

    op.drop_index(
        "ix_evidence_items_evidence_type",
        table_name="evidence_items",
    )

    op.drop_index(
        "ix_evidence_items_media_asset_id",
        table_name="evidence_items",
    )

    op.drop_table("evidence_items")
