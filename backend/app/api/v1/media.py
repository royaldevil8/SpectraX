from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.media_asset import MediaAsset
from app.models.media_version import MediaVersion
from app.schemas.media import AVSyncRead, MediaUploadRead
from app.schemas.risk_assessment import RiskAssessmentRead
from app.schemas.forensic_analysis import ForensicAnalysisRead
from app.services.av_sync_service import AVSyncService
from app.services.risk_assessment_service import create_or_update_risk_assessment
from app.services.fusion.visual_adapter import visual_detections_to_evidence
from app.storage.local import LocalStorage
from app.services.case_service import get_case
from app.services.media_service import ingest_media
from app.services.provenance_service import analyze_and_persist_provenance


router = APIRouter(
    prefix="/cases/{case_id}/media",
    tags=["Media"],
)


@router.post(
    "",
    response_model=MediaUploadRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_media(
    case_id: UUID,
    file: UploadFile = File(...),
    description: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    case = await get_case(db, case_id)

    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    try:
        asset, version = await ingest_media(
            db,
            case_id=case_id,
            upload=file,
            description=description,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return {
        "asset": asset,
        "version": version,
    }


@router.post(
    "/{media_asset_id}/av-sync",
    response_model=AVSyncRead,
)
async def analyze_av_sync(
    case_id: UUID,
    media_asset_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    case = await get_case(db, case_id)

    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    asset_result = await db.execute(
        select(MediaAsset).where(
            MediaAsset.id == media_asset_id,
            MediaAsset.case_id == case_id,
        )
    )
    asset = asset_result.scalar_one_or_none()

    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media asset not found",
        )

    version_result = await db.execute(
        select(MediaVersion)
        .where(MediaVersion.media_asset_id == media_asset_id)
        .order_by(MediaVersion.version_number.desc())
        .limit(1)
    )
    version = version_result.scalar_one_or_none()

    if version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media version not found",
        )

    try:
        media_path = LocalStorage()._resolve_path(version.storage_path)
        result = await AVSyncService().analyze_and_persist(
            media_path=media_path,
            media_asset_id=media_asset_id,
            db=db,
        )
    except (FileNotFoundError, ValueError, RuntimeError) as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    await db.commit()

    return result


@router.post(
    "/{media_asset_id}/risk-assessment",
    response_model=RiskAssessmentRead,
)
async def analyze_risk_assessment(
    case_id: UUID,
    media_asset_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    case = await get_case(db, case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    asset_result = await db.execute(
        select(MediaAsset).where(
            MediaAsset.id == media_asset_id,
            MediaAsset.case_id == case_id,
        )
    )

    asset = asset_result.scalar_one_or_none()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Media asset not found",
        )

    try:
        result = await create_or_update_risk_assessment(
            db,
            media_asset_id=media_asset_id,
        )
    except (ValueError, RuntimeError) as exc:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    await db.commit()
    await db.refresh(result)

    return result


@router.post(
    "/{media_asset_id}/analyze",
    response_model=ForensicAnalysisRead,
)
async def analyze_media(
    case_id: UUID,
    media_asset_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    case = await get_case(db, case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    asset_result = await db.execute(
        select(MediaAsset).where(
            MediaAsset.id == media_asset_id,
            MediaAsset.case_id == case_id,
        )
    )

    asset = asset_result.scalar_one_or_none()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Media asset not found",
        )

    version_result = await db.execute(
        select(MediaVersion)
        .where(
            MediaVersion.media_asset_id == media_asset_id
        )
        .order_by(MediaVersion.version_number.desc())
        .limit(1)
    )

    version = version_result.scalar_one_or_none()

    if version is None:
        raise HTTPException(
            status_code=404,
            detail="Media version not found",
        )

    try:
        media_path = LocalStorage()._resolve_path(
            version.storage_path
        )

        av_sync = await AVSyncService().analyze_and_persist(
            media_path=media_path,
            media_asset_id=media_asset_id,
            db=db,
        )

        await visual_detections_to_evidence(
            db,
            media_asset_id=media_asset_id,
        )

        provenance = await analyze_and_persist_provenance(
            db,
            media_asset_id=media_asset_id,
            media_path=media_path,
        )

        risk_assessment = await create_or_update_risk_assessment(
            db,
            media_asset_id=media_asset_id,
        )

        await db.commit()

        await db.refresh(risk_assessment)

        return {
            "media_asset_id": media_asset_id,
            "analysis_status": "completed",
            "av_sync": av_sync,
            "provenance": provenance,
            "risk_assessment": risk_assessment,
        }

    except (FileNotFoundError, ValueError, RuntimeError) as exc:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
