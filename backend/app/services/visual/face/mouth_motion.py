from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from app.services.visual.face.schemas import FaceDetection


@dataclass(frozen=True)
class MouthMotionMeasurement:
    """
    Motion measurement for the lower-face region.
    """

    frame_index: int
    timestamp_seconds: float
    motion_score: float


class LowerFaceMotionExtractor:
    """
    Dependency-light lower-face motion estimator.

    It does NOT perform:
    - lip landmark detection
    - phoneme recognition
    - speech recognition
    - speaker identification

    It estimates temporal visual motion inside a lower-face ROI.
    """

    def __init__(
        self,
        *,
        top_ratio: float = 0.48,
        bottom_ratio: float = 0.90,
        left_ratio: float = 0.15,
        right_ratio: float = 0.85,
    ) -> None:
        if not (
            0.0 <= top_ratio < bottom_ratio <= 1.0
        ):
            raise ValueError(
                "Invalid vertical ROI ratios."
            )

        if not (
            0.0 <= left_ratio < right_ratio <= 1.0
        ):
            raise ValueError(
                "Invalid horizontal ROI ratios."
            )

        self.top_ratio = top_ratio
        self.bottom_ratio = bottom_ratio
        self.left_ratio = left_ratio
        self.right_ratio = right_ratio

    def extract_roi(
        self,
        frame: np.ndarray,
        face: FaceDetection,
    ) -> np.ndarray:
        """
        Extract the lower-face region from one frame.
        """

        if frame is None or frame.size == 0:
            raise ValueError("Invalid frame.")

        height, width = frame.shape[:2]

        x1 = max(0, min(face.x1, width))
        y1 = max(0, min(face.y1, height))
        x2 = max(0, min(face.x2, width))
        y2 = max(0, min(face.y2, height))

        if x2 <= x1 or y2 <= y1:
            raise ValueError(
                "Invalid face bounding box."
            )

        face_width = x2 - x1
        face_height = y2 - y1

        roi_x1 = x1 + int(
            face_width * self.left_ratio
        )
        roi_x2 = x1 + int(
            face_width * self.right_ratio
        )

        roi_y1 = y1 + int(
            face_height * self.top_ratio
        )
        roi_y2 = y1 + int(
            face_height * self.bottom_ratio
        )

        roi_x1 = max(0, min(roi_x1, width))
        roi_x2 = max(0, min(roi_x2, width))
        roi_y1 = max(0, min(roi_y1, height))
        roi_y2 = max(0, min(roi_y2, height))

        if roi_x2 <= roi_x1 or roi_y2 <= roi_y1:
            raise ValueError(
                "Unable to construct lower-face ROI."
            )

        return frame[
            roi_y1:roi_y2,
            roi_x1:roi_x2,
        ]

    @staticmethod
    def _motion_score(
        previous_roi: np.ndarray,
        current_roi: np.ndarray,
    ) -> float:
        previous_gray = cv2.cvtColor(
            previous_roi,
            cv2.COLOR_BGR2GRAY,
        )

        current_gray = cv2.cvtColor(
            current_roi,
            cv2.COLOR_BGR2GRAY,
        )

        current_gray = cv2.resize(
            current_gray,
            (
                previous_gray.shape[1],
                previous_gray.shape[0],
            ),
        )

        difference = cv2.absdiff(
            previous_gray,
            current_gray,
        )

        return float(
            np.mean(difference) / 255.0
        )

    def measure_pair(
        self,
        *,
        previous_frame: np.ndarray,
        current_frame: np.ndarray,
        previous_face: FaceDetection,
        current_face: FaceDetection,
        frame_index: int,
        timestamp_seconds: float,
    ) -> MouthMotionMeasurement:
        previous_roi = self.extract_roi(
            previous_frame,
            previous_face,
        )

        current_roi = self.extract_roi(
            current_frame,
            current_face,
        )

        score = self._motion_score(
            previous_roi,
            current_roi,
        )

        return MouthMotionMeasurement(
            frame_index=frame_index,
            timestamp_seconds=timestamp_seconds,
            motion_score=score,
        )
