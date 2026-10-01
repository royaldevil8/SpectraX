from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Sequence

from .av_alignment import AVAlignmentResult
from .visual_motion import VisualMotionInterval


MismatchType = Literal[
    "speech_without_visual_motion",
    "visual_motion_without_speech",
]


@dataclass(frozen=True)
class AVMismatchInterval:
    start_seconds: float
    end_seconds: float
    mismatch_type: MismatchType

    @property
    def duration_seconds(self) -> float:
        return max(
            0.0,
            self.end_seconds - self.start_seconds,
        )


@dataclass(frozen=True)
class AVMismatchResult:
    track_id: int
    mismatch_intervals: list[AVMismatchInterval]
    speech_without_visual_duration_seconds: float
    visual_without_speech_duration_seconds: float
    analysis_available: bool
    unavailable_reason: str | None = None


class AVMismatchAnalyzer:
    """
    Evidence-level temporal mismatch analyzer.

    This component does NOT determine whether media is fake.
    It only identifies periods where speech activity and
    lower-face visual motion do not overlap.

    Speech activity is derived from the current energy-based
    speech baseline, while visual activity is derived from
    lower-face pixel motion.
    """

    def __init__(
        self,
        tolerance_seconds: float = 0.12,
    ) -> None:
        self.tolerance_seconds = max(
            0.0,
            tolerance_seconds,
        )

    @staticmethod
    def _subtract_interval(
        source_start: float,
        source_end: float,
        blockers: Sequence[tuple[float, float]],
    ) -> list[tuple[float, float]]:
        """
        Return portions of [source_start, source_end]
        that are not covered by blockers.
        """
        if source_end <= source_start:
            return []

        remaining = [(source_start, source_end)]

        for blocker_start, blocker_end in blockers:
            if blocker_end <= blocker_start:
                continue

            next_remaining: list[tuple[float, float]] = []

            for current_start, current_end in remaining:
                if blocker_end <= current_start:
                    next_remaining.append(
                        (current_start, current_end)
                    )
                    continue

                if blocker_start >= current_end:
                    next_remaining.append(
                        (current_start, current_end)
                    )
                    continue

                if blocker_start > current_start:
                    next_remaining.append(
                        (
                            current_start,
                            min(blocker_start, current_end),
                        )
                    )

                if blocker_end < current_end:
                    next_remaining.append(
                        (
                            max(blocker_end, current_start),
                            current_end,
                        )
                    )

            remaining = next_remaining

            if not remaining:
                break

        return remaining

    def _speech_only_regions(
        self,
        speech_intervals: Sequence,
        visual_intervals: Sequence[VisualMotionInterval],
    ) -> list[AVMismatchInterval]:
        visual_regions = [
            (
                max(
                    0.0,
                    interval.start_seconds
                    - self.tolerance_seconds,
                ),
                interval.end_seconds
                + self.tolerance_seconds,
            )
            for interval in visual_intervals
        ]

        results: list[AVMismatchInterval] = []

        for speech in speech_intervals:
            pieces = self._subtract_interval(
                speech.start_seconds,
                speech.end_seconds,
                visual_regions,
            )

            for start, end in pieces:
                if end > start:
                    results.append(
                        AVMismatchInterval(
                            start_seconds=start,
                            end_seconds=end,
                            mismatch_type=(
                                "speech_without_visual_motion"
                            ),
                        )
                    )

        return results

    def _visual_only_regions(
        self,
        speech_intervals: Sequence,
        visual_intervals: Sequence[VisualMotionInterval],
    ) -> list[AVMismatchInterval]:
        speech_regions = [
            (
                max(
                    0.0,
                    interval.start_seconds
                    - self.tolerance_seconds,
                ),
                interval.end_seconds
                + self.tolerance_seconds,
            )
            for interval in speech_intervals
        ]

        results: list[AVMismatchInterval] = []

        for visual in visual_intervals:
            pieces = self._subtract_interval(
                visual.start_seconds,
                visual.end_seconds,
                speech_regions,
            )

            for start, end in pieces:
                if end > start:
                    results.append(
                        AVMismatchInterval(
                            start_seconds=start,
                            end_seconds=end,
                            mismatch_type=(
                                "visual_motion_without_speech"
                            ),
                        )
                    )

        return results

    @staticmethod
    def _merge(
        intervals: Sequence[AVMismatchInterval],
    ) -> list[AVMismatchInterval]:
        if not intervals:
            return []

        ordered = sorted(
            intervals,
            key=lambda item: (
                item.start_seconds,
                item.end_seconds,
                item.mismatch_type,
            ),
        )

        merged: list[AVMismatchInterval] = [
            ordered[0]
        ]

        for current in ordered[1:]:
            previous = merged[-1]

            if (
                current.mismatch_type
                == previous.mismatch_type
                and current.start_seconds
                <= previous.end_seconds
            ):
                merged[-1] = AVMismatchInterval(
                    start_seconds=previous.start_seconds,
                    end_seconds=max(
                        previous.end_seconds,
                        current.end_seconds,
                    ),
                    mismatch_type=previous.mismatch_type,
                )
            else:
                merged.append(current)

        return merged

    def compare(
        self,
        alignment: AVAlignmentResult,
        speech_intervals: Sequence,
        visual_intervals: Sequence[VisualMotionInterval],
    ) -> AVMismatchResult:
        if not alignment.alignment_available:
            return AVMismatchResult(
                track_id=alignment.track_id,
                mismatch_intervals=[],
                speech_without_visual_duration_seconds=0.0,
                visual_without_speech_duration_seconds=0.0,
                analysis_available=False,
                unavailable_reason=(
                    alignment.unavailable_reason
                    or "A/V alignment is unavailable."
                ),
            )

        speech_only = self._speech_only_regions(
            speech_intervals,
            visual_intervals,
        )

        visual_only = self._visual_only_regions(
            speech_intervals,
            visual_intervals,
        )

        mismatch_intervals = self._merge(
            [*speech_only, *visual_only]
        )

        speech_only_duration = sum(
            interval.duration_seconds
            for interval in mismatch_intervals
            if interval.mismatch_type
            == "speech_without_visual_motion"
        )

        visual_only_duration = sum(
            interval.duration_seconds
            for interval in mismatch_intervals
            if interval.mismatch_type
            == "visual_motion_without_speech"
        )

        return AVMismatchResult(
            track_id=alignment.track_id,
            mismatch_intervals=mismatch_intervals,
            speech_without_visual_duration_seconds=(
                speech_only_duration
            ),
            visual_without_speech_duration_seconds=(
                visual_only_duration
            ),
            analysis_available=True,
            unavailable_reason=None,
        )
