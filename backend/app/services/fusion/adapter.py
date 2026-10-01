from app.models.evidence_item import EvidenceItem
from app.services.fusion.schemas import EvidenceSignal


EVIDENCE_POLARITY = {
    "audio_visual_alignment": "neutral",
    "speech_without_visual_motion": "supporting",
    "visual_motion_without_speech": "supporting",
    "visual_artifact": "supporting",
    "temporal_artifact": "supporting",
    "audio_artifact": "supporting",
    "provenance_failure": "supporting",
    "provenance_verified": "neutral",
    "provenance_present": "neutral",
    "provenance_absent": "neutral",
}


def evidence_items_to_signals(
    evidence_items: list[EvidenceItem],
) -> list[EvidenceSignal]:
    signals: list[EvidenceSignal] = []

    for item in evidence_items:
        signals.append(
            EvidenceSignal(
                evidence_type=item.evidence_type,
                duration_seconds=float(item.duration_seconds),
                polarity=EVIDENCE_POLARITY.get(
                    item.evidence_type,
                    "neutral",
                ),
            )
        )

    return signals
