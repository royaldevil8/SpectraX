from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_item import EvidenceItem
from app.services.visual.face.av_evidence import AVEvidenceItem


async def get_media_evidence(
    db: AsyncSession,
    *,
    media_asset_id: UUID,
) -> list[EvidenceItem]:
    result = await db.execute(
        select(EvidenceItem)
        .where(
            EvidenceItem.media_asset_id == media_asset_id
        )
        .order_by(
            EvidenceItem.start_seconds.asc(),
            EvidenceItem.created_at.asc(),
        )
    )

    return list(result.scalars().all())


async def clear_av_evidence(
    db: AsyncSession,
    *,
    media_asset_id: UUID,
) -> int:
    result = await db.execute(
        delete(EvidenceItem).where(
            EvidenceItem.media_asset_id == media_asset_id,
            EvidenceItem.evidence_type.in_(
                [
                    "audio_visual_alignment",
                    "speech_without_visual_motion",
                    "visual_motion_without_speech",
                ]
            ),
        )
    )

    return result.rowcount or 0


async def save_av_evidence(
    db: AsyncSession,
    *,
    media_asset_id: UUID,
    evidence_items: list[AVEvidenceItem],
) -> int:
    await clear_av_evidence(
        db,
        media_asset_id=media_asset_id,
    )

    count = 0

    for item in evidence_items:
        db.add(
            EvidenceItem(
                media_asset_id=media_asset_id,
                evidence_type=item.evidence_type,
                track_id=item.track_id,
                start_seconds=item.start_seconds,
                end_seconds=item.end_seconds,
                duration_seconds=item.duration_seconds,
                description=item.description,
            )
        )
        count += 1

    await db.flush()

    return count
