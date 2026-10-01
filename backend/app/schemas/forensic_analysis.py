from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.media import AVSyncRead
from app.schemas.risk_assessment import RiskAssessmentRead


class ProvenanceRead(BaseModel):
    media_asset_id: UUID
    sha256: str
    status: str
    container_format: str | None
    c2pa_detected: bool
    marker_detected: bool
    verification_supported: bool
    verification_message: str


class ForensicAnalysisRead(BaseModel):
    media_asset_id: UUID
    analysis_status: str
    av_sync: AVSyncRead
    provenance: ProvenanceRead
    risk_assessment: RiskAssessmentRead
