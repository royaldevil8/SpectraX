from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MediaAssetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    case_id: UUID
    original_filename: str
    mime_type: str
    file_size: int
    sha256: str
    description: str | None
    status: str
    created_at: datetime


class MediaVersionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    media_asset_id: UUID
    version_number: int
    storage_path: str
    sha256: str
    file_size: int
    created_at: datetime


class MediaUploadRead(BaseModel):
    asset: MediaAssetRead
    version: MediaVersionRead

class AVSyncTrackRead(BaseModel):
    track_id: int
    analysis_available: bool
    speech_duration_seconds: float
    visual_motion_duration_seconds: float
    aligned_duration_seconds: float
    speech_coverage: float
    visual_coverage: float
    mismatch_duration_seconds: float
    evidence_items: int
    unavailable_reason: str | None = None


class AVSyncRead(BaseModel):
    media_asset_id: UUID
    media_path: str
    frame_count: int
    fps: float
    duration_seconds: float
    audio_available: bool
    audio_unavailable_reason: str | None
    speech_interval_count: int
    track_count: int
    valid_track_count: int
    persisted_evidence_count: int
    tracks: list[AVSyncTrackRead]
