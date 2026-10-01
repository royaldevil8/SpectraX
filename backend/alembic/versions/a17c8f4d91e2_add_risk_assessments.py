"""add risk assessments

Revision ID: a17c8f4d91e2
Revises: 9ee4fa570d95
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "a17c8f4d91e2"
down_revision: Union[str, Sequence[str], None] = "9ee4fa570d95"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "risk_assessments" in inspector.get_table_names():
        return

    op.create_table(
        "risk_assessments",
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
            "risk_score",
            sa.Numeric(8, 4),
            nullable=False,
        ),
        sa.Column(
            "risk_band",
            sa.String(length=32),
            nullable=False,
        ),
        sa.Column(
            "evidence_coverage",
            sa.Numeric(8, 4),
            nullable=False,
        ),
        sa.Column(
            "consistency_score",
            sa.Numeric(8, 4),
            nullable=False,
        ),
        sa.Column(
            "signal_count",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "supporting_signal_count",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "contradicting_signal_count",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "explanation",
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
            name="risk_assessments_media_asset_id_fkey",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name="risk_assessments_pkey",
        ),
        sa.UniqueConstraint(
            "media_asset_id",
            name="uq_risk_assessments_media_asset_id",
        ),
    )

    op.create_index(
        "ix_risk_assessments_media_asset_id",
        "risk_assessments",
        ["media_asset_id"],
        unique=True,
    )

    op.create_index(
        "ix_risk_assessments_created_at",
        "risk_assessments",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "risk_assessments" not in inspector.get_table_names():
        return

    op.drop_index(
        "ix_risk_assessments_created_at",
        table_name="risk_assessments",
    )

    op.drop_index(
        "ix_risk_assessments_media_asset_id",
        table_name="risk_assessments",
    )

    op.drop_table("risk_assessments")
