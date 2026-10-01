from __future__ import annotations

from pathlib import Path

import cv2
import mediapipe as mp

from app.services.visual.face.detector import FaceDetector
from app.services.visual.face.schemas import FaceDetection


class MediaPipeFaceDetector(FaceDetector):
    """
    MediaPipe BlazeFace detector adapter.

    Converts MediaPipe detections into the shared SpectraX FaceDetection schema.
    """

    def __init__(
        self,
        model_path: str | Path,
        *,
        min_detection_confidence: float = 0.30,
    ) -> None:
        self.model_path = Path(model_path).resolve()

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"MediaPipe face detector model not found: {self.model_path}"
            )

        from mediapipe.tasks import python
        from mediapipe.tasks.python import vision

        self._vision = vision

        base_options = python.BaseOptions(
            model_asset_path=str(self.model_path)
        )

        options = vision.FaceDetectorOptions(
            base_options=base_options,
            min_detection_confidence=min_detection_confidence,
        )

        self._detector = vision.FaceDetector.create_from_options(options)

    @property
    def detector_name(self) -> str:
        return "mediapipe_blazeface"

    @property
    def detector_version(self) -> str:
        return f"mediapipe-{mp.__version__}"

    def detect(
        self,
        *,
        frame_id,
        frame_path: str | Path,
    ) -> list[FaceDetection]:
        image = cv2.imread(str(frame_path))

        if image is None:
            raise ValueError(f"Unable to read frame: {frame_path}")

        height, width = image.shape[:2]

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb,
        )

        result = self._detector.detect(mp_image)

        detections: list[FaceDetection] = []

        for detection in result.detections:
            bbox = detection.bounding_box

            x1 = max(0, int(round(bbox.origin_x)))
            y1 = max(0, int(round(bbox.origin_y)))
            x2 = min(width, x1 + int(round(bbox.width)))
            y2 = min(height, y1 + int(round(bbox.height)))

            if x2 <= x1 or y2 <= y1:
                continue

            confidence = 0.0

            if detection.categories:
                confidence = float(
                    max(
                        category.score
                        for category in detection.categories
                        if category.score is not None
                    )
                )

            detections.append(
                FaceDetection(
                    frame_id=frame_id,
                    x1=x1,
                    y1=y1,
                    x2=x2,
                    y2=y2,
                    confidence=confidence,
                )
            )

        return detections

    def close(self) -> None:
        self._detector.close()

    def __enter__(self) -> "MediaPipeFaceDetector":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        self.close()
