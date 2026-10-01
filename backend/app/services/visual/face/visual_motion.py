from dataclasses import dataclass

import numpy as np

from app.services.visual.face.mouth_motion import (
    MouthMotionMeasurement,
)


@dataclass(frozen=True)
class VisualMotionInterval:
    """
    Continuous interval containing elevated lower-face motion.
    """

    start_seconds: float
    end_seconds: float
    peak_motion: float
    mean_motion: float

    @property
    def duration_seconds(self) -> float:
        return self.end_seconds - self.start_seconds


@dataclass(frozen=True)
class VisualMotionSeries:
    """
    Smoothed visual-motion signal for one face track.
    """

    track_id: int
    timestamps: list[float]
    raw_values: list[float]
    smoothed_values: list[float]
    threshold: float


class VisualMotionAnalyzer:
    """
    Convert frame-level lower-face motion into temporal
    motion intervals.

    This is a motion-activity baseline, not lip/phoneme recognition.
    """

    def __init__(
        self,
        *,
        smoothing_window: int = 5,
        threshold_percentile: float = 70.0,
        threshold_margin: float = 0.25,
        min_interval_seconds: float = 0.12,
        merge_gap_seconds: float = 0.12,
    ) -> None:
        if smoothing_window < 1:
            raise ValueError(
                "smoothing_window must be >= 1."
            )

        if smoothing_window % 2 == 0:
            raise ValueError(
                "smoothing_window must be odd."
            )

        if not 0.0 < threshold_percentile < 100.0:
            raise ValueError(
                "threshold_percentile must be between 0 and 100."
            )

        if threshold_margin < 0:
            raise ValueError(
                "threshold_margin must be >= 0."
            )

        if min_interval_seconds < 0:
            raise ValueError(
                "min_interval_seconds must be >= 0."
            )

        if merge_gap_seconds < 0:
            raise ValueError(
                "merge_gap_seconds must be >= 0."
            )

        self.smoothing_window = smoothing_window
        self.threshold_percentile = (
            threshold_percentile
        )
        self.threshold_margin = threshold_margin
        self.min_interval_seconds = (
            min_interval_seconds
        )
        self.merge_gap_seconds = (
            merge_gap_seconds
        )

    def _smooth(
        self,
        values: np.ndarray,
    ) -> np.ndarray:
        if len(values) < 2:
            return values.copy()

        window = min(
            self.smoothing_window,
            len(values),
        )

        if window % 2 == 0:
            window -= 1

        if window <= 1:
            return values.copy()

        kernel = np.ones(window) / window

        return np.convolve(
            values,
            kernel,
            mode="same",
        )

    def analyze(
        self,
        measurements: list[
            MouthMotionMeasurement
        ],
        *,
        track_id: int,
    ) -> tuple[
        VisualMotionSeries,
        list[VisualMotionInterval],
    ]:
        if not measurements:
            empty = VisualMotionSeries(
                track_id=track_id,
                timestamps=[],
                raw_values=[],
                smoothed_values=[],
                threshold=0.0,
            )

            return empty, []

        ordered = sorted(
            measurements,
            key=lambda item: item.timestamp_seconds,
        )

        timestamps = np.asarray(
            [
                item.timestamp_seconds
                for item in ordered
            ],
            dtype=np.float64,
        )

        raw_values = np.asarray(
            [
                max(0.0, item.motion_score)
                for item in ordered
            ],
            dtype=np.float64,
        )

        smoothed = self._smooth(raw_values)

        baseline = float(
            np.percentile(
                smoothed,
                30.0,
            )
        )

        high_level = float(
            np.percentile(
                smoothed,
                self.threshold_percentile,
            )
        )

        dynamic_range = max(
            0.0,
            high_level - baseline,
        )

        threshold = (
            baseline
            + self.threshold_margin
            * dynamic_range
        )

        active = smoothed >= threshold

        intervals: list[
            VisualMotionInterval
        ] = []

        start_index: int | None = None

        for index, is_active in enumerate(active):
            if is_active and start_index is None:
                start_index = index
                continue

            if (
                not is_active
                and start_index is not None
            ):
                end_index = index - 1

                self._append_interval(
                    intervals,
                    timestamps,
                    smoothed,
                    start_index,
                    end_index,
                )

                start_index = None

        if start_index is not None:
            self._append_interval(
                intervals,
                timestamps,
                smoothed,
                start_index,
                len(timestamps) - 1,
            )

        intervals = self._merge_close_intervals(
            intervals
        )

        series = VisualMotionSeries(
            track_id=track_id,
            timestamps=timestamps.tolist(),
            raw_values=raw_values.tolist(),
            smoothed_values=smoothed.tolist(),
            threshold=float(threshold),
        )

        return series, intervals

    def _append_interval(
        self,
        intervals: list[VisualMotionInterval],
        timestamps: np.ndarray,
        values: np.ndarray,
        start_index: int,
        end_index: int,
    ) -> None:
        start = float(
            timestamps[start_index]
        )

        end = float(
            timestamps[end_index]
        )

        if end < start:
            return

        duration = end - start

        if duration < self.min_interval_seconds:
            return

        segment = values[
            start_index : end_index + 1
        ]

        intervals.append(
            VisualMotionInterval(
                start_seconds=start,
                end_seconds=end,
                peak_motion=float(
                    np.max(segment)
                ),
                mean_motion=float(
                    np.mean(segment)
                ),
            )
        )

    def _merge_close_intervals(
        self,
        intervals: list[VisualMotionInterval],
    ) -> list[VisualMotionInterval]:
        if not intervals:
            return []

        merged: list[
            VisualMotionInterval
        ] = [intervals[0]]

        for current in intervals[1:]:
            previous = merged[-1]

            gap = (
                current.start_seconds
                - previous.end_seconds
            )

            if gap <= self.merge_gap_seconds:
                total_duration = (
                    current.end_seconds
                    - previous.start_seconds
                )

                previous_duration = (
                    previous.end_seconds
                    - previous.start_seconds
                )

                current_duration = (
                    current.end_seconds
                    - current.start_seconds
                )

                total_weight = (
                    previous_duration
                    + current_duration
                )

                if total_weight > 0:
                    mean_motion = (
                        (
                            previous.mean_motion
                            * previous_duration
                        )
                        + (
                            current.mean_motion
                            * current_duration
                        )
                    ) / total_weight
                else:
                    mean_motion = max(
                        previous.mean_motion,
                        current.mean_motion,
                    )

                merged[-1] = VisualMotionInterval(
                    start_seconds=(
                        previous.start_seconds
                    ),
                    end_seconds=(
                        previous.start_seconds
                        + total_duration
                    ),
                    peak_motion=max(
                        previous.peak_motion,
                        current.peak_motion,
                    ),
                    mean_motion=mean_motion,
                )
            else:
                merged.append(current)

        return merged
