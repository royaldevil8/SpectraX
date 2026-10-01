"""add provenance records

Revision ID: c4d91f3a7b21
Revises: a17c8f4d91e2
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c4d91f3a7b21"
down_revision: Union[str, Sequence[str], None] = "a17c8f4d91e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "provenance_records" in inspector.get_table_names():
        return

    op.create_table(
        "provenance_records",
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
            "sha256",
            sa.String(length=64),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=32),
            nullable=False,
        ),
        sa.Column(
            "container_format",
            sa.String(length=128),
            nullable=True,
        ),
        sa.Column(
            "c2pa_detected",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "marker_detected",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "provenance_metadata",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "verification_message",
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
            name="provenance_records_media_asset_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name="provenance_records_pkey",
        ),
        sa.UniqueConstraint(
            "media_asset_id",
            name="uq_provenance_records_media_asset_id",
        ),
    )

    op.create_index(
        "ix_provenance_records_media_asset_id",
        "provenance_records",
        ["media_asset_id"],
        unique=True,
    )

    op.create_index(
        "ix_provenance_records_sha256",
        "provenance_records",
        ["sha256"],
        unique=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "provenance_records" not in inspector.get_table_names():
        return

    op.drop_index(
        "ix_provenance_records_sha256",
        table_name="provenance_records",
    )

    op.drop_index(
        "ix_provenance_records_media_asset_id",
        table_name="provenance_records",
    )

    op.drop_table("provenance_records")
