import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import RiskAssessment
from app.services.evidence_service import get_media_evidence
from app.services.fusion import (
    EvidenceFusionEngine,
    evidence_items_to_signals,
)


async def create_or_update_risk_assessment(
    db: AsyncSession,
    *,
    media_asset_id: uuid.UUID,
) -> RiskAssessment:
    evidence_items = await get_media_evidence(
        db,
        media_asset_id=media_asset_id,
    )

    signals = evidence_items_to_signals(evidence_items)
    fused = EvidenceFusionEngine().fuse(signals)

    result = await db.execute(
        select(RiskAssessment).where(
            RiskAssessment.media_asset_id == media_asset_id
        )
    )

    assessment = result.scalar_one_or_none()

    if assessment is None:
        assessment = RiskAssessment(
            media_asset_id=media_asset_id,
        )
        db.add(assessment)

    assessment.risk_score = Decimal(str(fused.risk_score))
    assessment.risk_band = fused.risk_band
    assessment.evidence_coverage = Decimal(
        str(fused.evidence_coverage)
    )
    assessment.consistency_score = Decimal(
        str(fused.consistency_score)
    )
    assessment.signal_count = fused.signal_count
    assessment.supporting_signal_count = (
        fused.supporting_signal_count
    )
    assessment.contradicting_signal_count = (
        fused.contradicting_signal_count
    )
    assessment.explanation = fused.explanation

    await db.flush()

    return assessment
