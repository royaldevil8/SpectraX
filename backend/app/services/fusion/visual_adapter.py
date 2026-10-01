from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_item import EvidenceItem
from app.models.media_frame import MediaFrame
from app.models.visual_detection import VisualDetection


VISUAL_EVIDENCE_TYPE = "visual_artifact"


async def visual_detections_to_evidence(
    db: AsyncSession,
    *,
    media_asset_id: UUID,
) -> int:
    result = await db.execute(
        select(
            VisualDetection,
            MediaFrame,
        )
        .join(
            MediaFrame,
            VisualDetection.media_frame_id == MediaFrame.id,
        )
        .where(
            MediaFrame.media_asset_id == media_asset_id,
        )
        .order_by(
            MediaFrame.timestamp_seconds.asc(),
        )
    )

    rows = result.all()

    await db.execute(
        delete(EvidenceItem).where(
            EvidenceItem.media_asset_id == media_asset_id,
            EvidenceItem.evidence_type == VISUAL_EVIDENCE_TYPE,
        )
    )

    persisted = 0

    for detection, frame in rows:
        score = float(detection.score)

        if not detection.face_detected:
            continue

        if score <= 0.0:
            continue

        description = (
            f"Visual detector '{detection.model_name}' "
            f"version '{detection.model_version}' "
            f"reported score {score:.4f} "
            f"on frame {frame.frame_number}. "
            f"Face detected: {detection.face_detected}."
        )

        db.add(
            EvidenceItem(
                media_asset_id=media_asset_id,
                evidence_type=VISUAL_EVIDENCE_TYPE,
                track_id=frame.frame_number,
                start_seconds=frame.timestamp_seconds,
                end_seconds=frame.timestamp_seconds,
                duration_seconds=0.0,
                description=description,
            )
        )

        persisted += 1

    await db.flush()

    return persisted
