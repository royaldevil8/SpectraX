from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RiskAssessmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    media_asset_id: UUID
    risk_score: Decimal
    risk_band: str
    evidence_coverage: Decimal
    consistency_score: Decimal
    signal_count: int
    supporting_signal_count: int
    contradicting_signal_count: int
    explanation: str
    created_at: datetime
