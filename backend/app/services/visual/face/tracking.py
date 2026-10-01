from dataclasses import dataclass
from math import hypot
from typing import Optional

from app.services.visual.face.schemas import FaceDetection


@dataclass(frozen=True)
class FaceTrackObservation:
    """
    One time-indexed observation belonging to a face track.
    """

    track_id: int
    frame_index: int
    timestamp_seconds: float
    detection: FaceDetection


@dataclass(frozen=True)
class FaceTrackObservation:
    """
    One time-indexed observation belonging to a face track.
    """

    track_id: int
    frame_index: int
    timestamp_seconds: float
    detection: FaceDetection


@dataclass
class FaceTrack:
    """
    Temporal identity of one face across video frames.
    """

    track_id: int
    detections: list[FaceDetection]
    observations: list[FaceTrackObservation]
    first_frame_index: Optional[int] = None
    last_frame_index: Optional[int] = None
    missed_frames: int = 0

    @property
    def last_detection(self) -> FaceDetection:
        return self.detections[-1]

    @property
    def observation_count(self) -> int:
        return len(self.detections)


class SimpleIoUFaceTracker:
    """
    Lightweight face tracker using:

    - IoU
    - bounding-box center distance
    - bounding-box size similarity

    No external tracking dependency is required.
    """

    def __init__(
        self,
        *,
        iou_threshold: float = 0.20,
        max_missing_frames: int = 8,
        max_center_distance_ratio: float = 0.35,
        min_size_similarity: float = 0.45,
    ) -> None:
        if not 0.0 <= iou_threshold <= 1.0:
            raise ValueError(
                "iou_threshold must be between 0 and 1."
            )

        if max_missing_frames < 0:
            raise ValueError(
                "max_missing_frames must be >= 0."
            )

        if max_center_distance_ratio <= 0:
            raise ValueError(
                "max_center_distance_ratio must be > 0."
            )

        if not 0.0 <= min_size_similarity <= 1.0:
            raise ValueError(
                "min_size_similarity must be between 0 and 1."
            )

        self.iou_threshold = iou_threshold
        self.max_missing_frames = max_missing_frames
        self.max_center_distance_ratio = (
            max_center_distance_ratio
        )
        self.min_size_similarity = min_size_similarity

        self._tracks: dict[int, FaceTrack] = {}
        self._next_track_id = 1

    @staticmethod
    def _iou(
        first: FaceDetection,
        second: FaceDetection,
    ) -> float:
        x1 = max(first.x1, second.x1)
        y1 = max(first.y1, second.y1)
        x2 = min(first.x2, second.x2)
        y2 = min(first.y2, second.y2)

        width = max(0, x2 - x1)
        height = max(0, y2 - y1)

        intersection = width * height

        if intersection <= 0:
            return 0.0

        first_area = (
            max(0, first.x2 - first.x1)
            * max(0, first.y2 - first.y1)
        )

        second_area = (
            max(0, second.x2 - second.x1)
            * max(0, second.y2 - second.y1)
        )

        union = first_area + second_area - intersection

        if union <= 0:
            return 0.0

        return intersection / union

    @staticmethod
    def _center(
        detection: FaceDetection,
    ) -> tuple[float, float]:
        return (
            (detection.x1 + detection.x2) / 2.0,
            (detection.y1 + detection.y2) / 2.0,
        )

    @staticmethod
    def _size(
        detection: FaceDetection,
    ) -> tuple[float, float]:
        return (
            max(1.0, detection.x2 - detection.x1),
            max(1.0, detection.y2 - detection.y1),
        )

    def _center_distance_ratio(
        self,
        first: FaceDetection,
        second: FaceDetection,
    ) -> float:
        first_center = self._center(first)
        second_center = self._center(second)

        distance = hypot(
            first_center[0] - second_center[0],
            first_center[1] - second_center[1],
        )

        first_width, first_height = self._size(first)

        reference_size = hypot(
            first_width,
            first_height,
        )

        if reference_size <= 0:
            return float("inf")

        return distance / reference_size

    def _size_similarity(
        self,
        first: FaceDetection,
        second: FaceDetection,
    ) -> float:
        first_width, first_height = self._size(first)
        second_width, second_height = self._size(second)

        width_ratio = min(
            first_width / second_width,
            second_width / first_width,
        )

        height_ratio = min(
            first_height / second_height,
            second_height / first_height,
        )

        return min(
            width_ratio,
            height_ratio,
        )

    def _match_score(
        self,
        previous: FaceDetection,
        current: FaceDetection,
    ) -> Optional[float]:
        iou = self._iou(previous, current)

        center_ratio = self._center_distance_ratio(
            previous,
            current,
        )

        size_similarity = self._size_similarity(
            previous,
            current,
        )

        center_ok = (
            center_ratio
            <= self.max_center_distance_ratio
        )

        size_ok = (
            size_similarity
            >= self.min_size_similarity
        )

        iou_ok = iou >= self.iou_threshold

        # IoU is strong evidence of continuity.
        if iou_ok:
            return (
                0.60 * iou
                + 0.25 * size_similarity
                + 0.15 * max(
                    0.0,
                    1.0
                    - (
                        center_ratio
                        / self.max_center_distance_ratio
                    ),
                )
            )

        # If IoU is weak because the detector moved,
        # center + size can still establish continuity.
        if center_ok and size_ok:
            center_score = max(
                0.0,
                1.0
                - (
                    center_ratio
                    / self.max_center_distance_ratio
                ),
            )

            return (
                0.45 * center_score
                + 0.55 * size_similarity
            )

        return None

    def _create_track(
        self,
        detection: FaceDetection,
        frame_index: Optional[int],
    ) -> FaceTrack:
        initial_observations = []

        if frame_index is not None:
            initial_observations.append(
                FaceTrackObservation(
                    track_id=self._next_track_id,
                    frame_index=frame_index,
                    timestamp_seconds=(
                        frame_index
                        / 25.0
                    ),
                    detection=detection,
                )
            )

        track = FaceTrack(
            track_id=self._next_track_id,
            detections=[detection],
            observations=initial_observations,
            first_frame_index=frame_index,
            last_frame_index=frame_index,
            missed_frames=0,
        )

        self._tracks[track.track_id] = track
        self._next_track_id += 1

        return track

    def update(
        self,
        detections: list[FaceDetection],
        *,
        frame_index: Optional[int] = None,
        timestamp_seconds: Optional[float] = None,
    ) -> list[FaceTrack]:
        """
        Update tracker with detections from one video frame.

        frame_index and timestamp_seconds are optional to preserve
        compatibility with the original API.
        """

        active_track_ids = list(self._tracks.keys())

        candidates: list[
            tuple[float, int, int]
        ] = []

        for track_id in active_track_ids:
            track = self._tracks[track_id]

            for detection_index, detection in enumerate(
                detections
            ):
                score = self._match_score(
                    track.last_detection,
                    detection,
                )

                if score is not None:
                    candidates.append(
                        (
                            score,
                            track_id,
                            detection_index,
                        )
                    )

        candidates.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        matched_tracks: set[int] = set()
        matched_detections: set[int] = set()

        for (
            score,
            track_id,
            detection_index,
        ) in candidates:
            del score

            if track_id in matched_tracks:
                continue

            if detection_index in matched_detections:
                continue

            track = self._tracks[track_id]
            detection = detections[detection_index]

            track.detections.append(detection)

            if frame_index is not None:
                timestamp = (
                    timestamp_seconds
                    if timestamp_seconds is not None
                    else frame_index / 25.0
                )

                track.observations.append(
                    FaceTrackObservation(
                        track_id=track_id,
                        frame_index=frame_index,
                        timestamp_seconds=timestamp,
                        detection=detection,
                    )
                )

            track.missed_frames = 0
            track.last_frame_index = frame_index

            matched_tracks.add(track_id)
            matched_detections.add(detection_index)

        for track_id in active_track_ids:
            if track_id not in matched_tracks:
                self._tracks[
                    track_id
                ].missed_frames += 1

        for detection_index, detection in enumerate(
            detections
        ):
            if detection_index not in matched_detections:
                self._create_track(
                    detection,
                    frame_index,
                )

        self._remove_expired_tracks()

        return list(self._tracks.values())

    def _remove_expired_tracks(self) -> None:
        expired = [
            track_id
            for track_id, track in self._tracks.items()
            if track.missed_frames
            > self.max_missing_frames
        ]

        for track_id in expired:
            del self._tracks[track_id]

    def get_tracks(
        self,
    ) -> list[FaceTrack]:
        """
        Return currently active tracks.
        """

        return list(self._tracks.values())

    def reset(self) -> None:
        self._tracks.clear()
        self._next_track_id = 1
