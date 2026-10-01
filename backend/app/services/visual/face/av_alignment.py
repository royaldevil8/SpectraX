from dataclasses import dataclass

from app.project_path import PROJECT_ROOT

from app.services.visual.face.visual_motion import (
    VisualMotionInterval,
)
from ml.av_sync.speech_alignment import (
    SpeechInterval,
)


@dataclass(frozen=True)
class AVOverlap:
    """
    Temporal overlap between one speech interval
    and one visual-motion interval.
    """

    speech_start_seconds: float
    speech_end_seconds: float

    visual_start_seconds: float
    visual_end_seconds: float

    overlap_start_seconds: float
    overlap_end_seconds: float

    overlap_seconds: float
    speech_coverage: float
    visual_coverage: float


@dataclass(frozen=True)
class AVAlignmentResult:
    """
    Alignment summary for one face track.

    The result explicitly distinguishes unavailable
    audio evidence from a valid analysis containing
    no detected speech activity.

    speech_coverage:
        Fraction of speech-active time that overlaps
        with visual lower-face motion.

    visual_coverage:
        Fraction of visual-motion time that overlaps
        with speech activity.
    """

    track_id: int

    speech_duration_seconds: float
    visual_motion_duration_seconds: float
    aligned_duration_seconds: float

    speech_coverage: float
    visual_coverage: float

    overlap_count: int

    overlaps: list[AVOverlap]

    alignment_available: bool
    unavailable_reason: str | None = None


class AVAlignmentAnalyzer:
    """
    Compare speech-activity intervals against
    lower-face visual-motion intervals.

    This is temporal activity alignment.

    It is NOT:
      - phoneme recognition
      - lip-reading
      - speaker identification
      - semantic speech recognition
    """

    def __init__(
        self,
        *,
        tolerance_seconds: float = 0.12,
    ) -> None:
        if tolerance_seconds < 0:
            raise ValueError(
                "tolerance_seconds must be >= 0."
            )

        self.tolerance_seconds = (
            tolerance_seconds
        )

    @staticmethod
    def _duration(
        start: float,
        end: float,
    ) -> float:
        return max(
            0.0,
            end - start,
        )

    @staticmethod
    def _intersection(
        start_a: float,
        end_a: float,
        start_b: float,
        end_b: float,
    ) -> tuple[float, float] | None:
        start = max(
            start_a,
            start_b,
        )

        end = min(
            end_a,
            end_b,
        )

        if end <= start:
            return None

        return start, end

    def compare(
        self,
        *,
        track_id: int,
        speech_intervals: list[
            SpeechInterval
        ],
        visual_intervals: list[
            VisualMotionInterval
        ],
        audio_available: bool = True,
        unavailable_reason: str | None = None,
    ) -> AVAlignmentResult:
        if not audio_available:
            visual_duration = sum(
                self._duration(
                    interval.start_seconds,
                    interval.end_seconds,
                )
                for interval in visual_intervals
            )

            return AVAlignmentResult(
                track_id=track_id,
                speech_duration_seconds=0.0,
                visual_motion_duration_seconds=(
                    visual_duration
                ),
                aligned_duration_seconds=0.0,
                speech_coverage=0.0,
                visual_coverage=0.0,
                overlap_count=0,
                overlaps=[],
                alignment_available=False,
                unavailable_reason=(
                    unavailable_reason
                    or "Audio evidence is unavailable."
                ),
            )

        if not speech_intervals:
            return AVAlignmentResult(
                track_id=track_id,
                speech_duration_seconds=0.0,
                visual_motion_duration_seconds=(
                    sum(
                        self._duration(
                            interval.start_seconds,
                            interval.end_seconds,
                        )
                        for interval in visual_intervals
                    )
                ),
                aligned_duration_seconds=0.0,
                speech_coverage=0.0,
                visual_coverage=0.0,
                overlap_count=0,
                overlaps=[],
                alignment_available=True,
                unavailable_reason=None,
            )

        if not visual_intervals:
            speech_duration = sum(
                self._duration(
                    interval.start_seconds,
                    interval.end_seconds,
                )
                for interval in speech_intervals
            )

            return AVAlignmentResult(
                track_id=track_id,
                speech_duration_seconds=speech_duration,
                visual_motion_duration_seconds=0.0,
                aligned_duration_seconds=0.0,
                speech_coverage=0.0,
                visual_coverage=0.0,
                overlap_count=0,
                overlaps=[],
                alignment_available=True,
                unavailable_reason=None,
            )

        overlaps: list[AVOverlap] = []

        speech_duration = 0.0
        visual_duration = 0.0
        aligned_duration = 0.0

        for speech in speech_intervals:
            speech_duration += self._duration(
                speech.start_seconds,
                speech.end_seconds,
            )

        for visual in visual_intervals:
            visual_duration += self._duration(
                visual.start_seconds,
                visual.end_seconds,
            )

        for speech in speech_intervals:
            for visual in visual_intervals:
                result = self._intersection(
                    speech.start_seconds
                    - self.tolerance_seconds,
                    speech.end_seconds
                    + self.tolerance_seconds,
                    visual.start_seconds,
                    visual.end_seconds,
                )

                if result is None:
                    continue

                overlap_start, overlap_end = result

                overlap_seconds = (
                    overlap_end
                    - overlap_start
                )

                if overlap_seconds <= 0:
                    continue

                raw_speech_duration = self._duration(
                    speech.start_seconds,
                    speech.end_seconds,
                )

                raw_visual_duration = self._duration(
                    visual.start_seconds,
                    visual.end_seconds,
                )

                speech_coverage = (
                    overlap_seconds
                    / raw_speech_duration
                    if raw_speech_duration > 0
                    else 0.0
                )

                visual_coverage = (
                    overlap_seconds
                    / raw_visual_duration
                    if raw_visual_duration > 0
                    else 0.0
                )

                overlaps.append(
                    AVOverlap(
                        speech_start_seconds=(
                            speech.start_seconds
                        ),
                        speech_end_seconds=(
                            speech.end_seconds
                        ),
                        visual_start_seconds=(
                            visual.start_seconds
                        ),
                        visual_end_seconds=(
                            visual.end_seconds
                        ),
                        overlap_start_seconds=(
                            overlap_start
                        ),
                        overlap_end_seconds=(
                            overlap_end
                        ),
                        overlap_seconds=(
                            overlap_seconds
                        ),
                        speech_coverage=(
                            speech_coverage
                        ),
                        visual_coverage=(
                            visual_coverage
                        ),
                    )
                )

        # Merge overlapping coverage so the same
        # temporal region is not counted twice.
        aligned_regions = sorted(
            [
                (
                    item.overlap_start_seconds,
                    item.overlap_end_seconds,
                )
                for item in overlaps
            ]
        )

        merged_regions: list[
            tuple[float, float]
        ] = []

        for start, end in aligned_regions:
            if not merged_regions:
                merged_regions.append(
                    (start, end)
                )
                continue

            previous_start, previous_end = (
                merged_regions[-1]
            )

            if start <= previous_end:
                merged_regions[-1] = (
                    previous_start,
                    max(
                        previous_end,
                        end,
                    ),
                )
            else:
                merged_regions.append(
                    (start, end)
                )

        aligned_duration = sum(
            end - start
            for start, end in merged_regions
        )

        speech_coverage = (
            aligned_duration / speech_duration
            if speech_duration > 0
            else 0.0
        )

        visual_coverage = (
            aligned_duration / visual_duration
            if visual_duration > 0
            else 0.0
        )

        return AVAlignmentResult(
            track_id=track_id,
            speech_duration_seconds=speech_duration,
            visual_motion_duration_seconds=(
                visual_duration
            ),
            aligned_duration_seconds=(
                aligned_duration
            ),
            speech_coverage=min(
                1.0,
                speech_coverage,
            ),
            visual_coverage=min(
                1.0,
                visual_coverage,
            ),
            overlap_count=len(overlaps),
            overlaps=overlaps,
            alignment_available=True,
            unavailable_reason=None,
        )
