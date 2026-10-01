from dataclasses import dataclass
from typing import Literal


EvidencePolarity = Literal["supporting", "contradicting", "neutral"]


@dataclass(frozen=True)
class EvidenceSignal:
    evidence_type: str
    duration_seconds: float
    polarity: EvidencePolarity = "supporting"
    weight: float = 1.0


@dataclass(frozen=True)
class EvidenceFusionResult:
    signal_count: int
    supporting_signal_count: int
    contradicting_signal_count: int
    total_supporting_weight: float
    total_contradicting_weight: float
    evidence_coverage: float
    consistency_score: float
    risk_score: float
    risk_band: str
    explanation: str
