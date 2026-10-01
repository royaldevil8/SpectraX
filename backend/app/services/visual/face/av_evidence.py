from dataclasses import dataclass
from typing import Literal


AVEvidenceType = Literal[
    "audio_visual_alignment",
    "speech_without_visual_motion",
    "visual_motion_without_speech",
]


@dataclass(frozen=True)
class AVEvidenceItem:
    evidence_type: AVEvidenceType
    track_id: int

    start_seconds: float
    end_seconds: float

    duration_seconds: float

    description: str


@dataclass(frozen=True)
class AVEvidenceSummary:
    track_id: int

    analysis_available: bool

    speech_duration_seconds: float
    visual_motion_duration_seconds: float
    aligned_duration_seconds: float

    speech_coverage: float
    visual_coverage: float

    mismatch_duration_seconds: float

    evidence_items: list[AVEvidenceItem]

    unavailable_reason: str | None = None


def build_av_evidence(
    *,
    track_id: int,
    alignment,
    mismatch,
) -> AVEvidenceSummary:

    if not alignment.alignment_available:
        return AVEvidenceSummary(
            track_id=track_id,
            analysis_available=False,
            speech_duration_seconds=0.0,
            visual_motion_duration_seconds=0.0,
            aligned_duration_seconds=0.0,
            speech_coverage=0.0,
            visual_coverage=0.0,
            mismatch_duration_seconds=0.0,
            evidence_items=[],
            unavailable_reason=(
                alignment.unavailable_reason
                or "A/V alignment is unavailable."
            ),
        )

    evidence_items: list[AVEvidenceItem] = []

    for overlap in alignment.overlaps:
        evidence_items.append(
            AVEvidenceItem(
                evidence_type="audio_visual_alignment",
                track_id=track_id,
                start_seconds=overlap.overlap_start_seconds,
                end_seconds=overlap.overlap_end_seconds,
                duration_seconds=overlap.overlap_seconds,
                description=(
                    "Speech activity overlaps with "
                    "detected lower-face visual motion."
                ),
            )
        )

    for interval in mismatch.mismatch_intervals:

        if interval.mismatch_type == (
            "speech_without_visual_motion"
        ):
            evidence_type = (
                "speech_without_visual_motion"
            )
            description = (
                "Speech activity occurs without "
                "corresponding detected lower-face motion."
            )

        else:
            evidence_type = (
                "visual_motion_without_speech"
            )
            description = (
                "Detected lower-face motion occurs "
                "without speech activity."
            )

        evidence_items.append(
            AVEvidenceItem(
                evidence_type=evidence_type,
                track_id=track_id,
                start_seconds=interval.start_seconds,
                end_seconds=interval.end_seconds,
                duration_seconds=interval.duration_seconds,
                description=description,
            )
        )

    mismatch_duration = (
        mismatch.speech_without_visual_duration_seconds
        + mismatch.visual_without_speech_duration_seconds
    )

    return AVEvidenceSummary(
        track_id=track_id,
        analysis_available=True,
        speech_duration_seconds=(
            alignment.speech_duration_seconds
        ),
        visual_motion_duration_seconds=(
            alignment.visual_motion_duration_seconds
        ),
        aligned_duration_seconds=(
            alignment.aligned_duration_seconds
        ),
        speech_coverage=alignment.speech_coverage,
        visual_coverage=alignment.visual_coverage,
        mismatch_duration_seconds=mismatch_duration,
        evidence_items=evidence_items,
    )
