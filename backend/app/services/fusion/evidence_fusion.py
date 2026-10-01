from collections import defaultdict

from app.services.fusion.schemas import (
    EvidenceFusionResult,
    EvidenceSignal,
)


class EvidenceFusionEngine:
    DEFAULT_WEIGHTS = {
        "audio_visual_alignment": 1.00,
        "speech_without_visual_motion": 1.20,
        "visual_motion_without_speech": 1.00,
        "visual_artifact": 1.20,
        "temporal_artifact": 1.10,
        "audio_artifact": 1.10,
        "provenance_failure": 0.80,
    }

    def __init__(
        self,
        *,
        weights: dict[str, float] | None = None,
    ) -> None:
        self.weights = {
            **self.DEFAULT_WEIGHTS,
            **(weights or {}),
        }

    def fuse(
        self,
        signals: list[EvidenceSignal],
    ) -> EvidenceFusionResult:
        if not signals:
            return EvidenceFusionResult(
                signal_count=0,
                supporting_signal_count=0,
                contradicting_signal_count=0,
                total_supporting_weight=0.0,
                total_contradicting_weight=0.0,
                evidence_coverage=0.0,
                consistency_score=1.0,
                risk_score=0.0,
                risk_band="insufficient_evidence",
                explanation="No evidence items are available for fusion.",
            )

        grouped: dict[str, float] = defaultdict(float)

        supporting_weight = 0.0
        contradicting_weight = 0.0

        for signal in signals:
            base_weight = self.weights.get(signal.evidence_type, 1.0)

            duration_factor = min(
                max(signal.duration_seconds, 0.0),
                5.0,
            ) / 5.0

            effective_weight = (
                base_weight
                * max(duration_factor, 0.10)
                * max(signal.weight, 0.0)
            )

            grouped[signal.evidence_type] += effective_weight

            if signal.polarity == "contradicting":
                contradicting_weight += effective_weight
            elif signal.polarity == "supporting":
                supporting_weight += effective_weight

        neutral_weight = sum(
            self.weights.get(signal.evidence_type, 1.0)
            * max(min(max(signal.duration_seconds, 0.0), 5.0) / 5.0, 0.10)
            * max(signal.weight, 0.0)
            for signal in signals
            if signal.polarity == "neutral"
        )

        total_weight = (
            supporting_weight
            + contradicting_weight
            + neutral_weight
        )

        category_count = len(grouped)
        evidence_coverage = min(category_count / 4.0, 1.0)

        if total_weight <= 0:
            consistency_score = 1.0
            risk_score = 0.0
        else:
            consistency_score = (
                neutral_weight / total_weight
            )

            risk_score = (
                supporting_weight / total_weight
            ) * 100.0

        risk_score = round(
            risk_score * (0.70 + 0.30 * evidence_coverage),
            4,
        )

        if category_count < 2:
            risk_band = "insufficient_evidence"
        elif risk_score < 25:
            risk_band = "low"
        elif risk_score < 50:
            risk_band = "moderate"
        elif risk_score < 75:
            risk_band = "high"
        else:
            risk_band = "very_high"

        categories = ", ".join(sorted(grouped))

        explanation = (
            f"Evidence fusion combined {category_count} evidence "
            f"categories ({categories}). The baseline fused risk score "
            f"is {risk_score:.2f}/100 with risk band '{risk_band}'. "
            f"This result represents aggregated forensic evidence and "
            f"should not be interpreted as proof from a single signal."
        )

        return EvidenceFusionResult(
            signal_count=len(signals),
            supporting_signal_count=sum(
                1
                for signal in signals
                if signal.polarity == "supporting"
            ),
            contradicting_signal_count=sum(
                1
                for signal in signals
                if signal.polarity == "contradicting"
            ),
            total_supporting_weight=round(
                supporting_weight,
                4,
            ),
            total_contradicting_weight=round(
                contradicting_weight,
                4,
            ),
            evidence_coverage=round(
                evidence_coverage,
                4,
            ),
            consistency_score=round(
                consistency_score,
                4,
            ),
            risk_score=risk_score,
            risk_band=risk_band,
            explanation=explanation,
        )
