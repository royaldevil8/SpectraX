from __future__ import annotations

from pathlib import Path
from time import perf_counter
from uuid import uuid4

from PIL import Image
from torchvision import transforms

from app.services.visual.face.alignment import OpenCVFaceCropAligner
from app.services.visual.face.detector import OpenCVHaarFaceDetector
from app.services.visual.face.mediapipe_detector import MediaPipeFaceDetector
from app.services.visual.schemas import VisualDetectionResult
from app.services.visual.model.xception.detector import XceptionDeepfakeClassifier


class XceptionVisualDetector:
    """
    SpectraX Xception visual detector.

    Primary face detector:
        MediaPipe BlazeFace

    Fallback:
        OpenCV Haar

    The classifier itself remains the existing SpectraX Xception checkpoint.
    """

    def __init__(
        self,
        checkpoint_path: str | Path,
        *,
        device: str = "cpu",
        temporary_root: str | Path = "storage/temporary",
        face_model_path: str | Path = (
            "app/services/visual/checkpoints/"
            "face_detection/blaze_face_short_range.tflite"
        ),
    ) -> None:
        self._face_detector = MediaPipeFaceDetector(
            face_model_path,
            min_detection_confidence=0.10,
        )
        self._fallback_face_detector = OpenCVHaarFaceDetector()

        self._face_aligner = OpenCVFaceCropAligner()

        self._classifier = XceptionDeepfakeClassifier(
            checkpoint_path=checkpoint_path,
            device=device,
        )

        self._temporary_root = Path(temporary_root)
        self._temporary_root.mkdir(
            parents=True,
            exist_ok=True,
        )

        self._preprocess = transforms.Compose(
            [
                transforms.Resize((256, 256)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.5, 0.5, 0.5],
                    std=[0.5, 0.5, 0.5],
                ),
            ]
        )

    @property
    def model_name(self) -> str:
        return self._classifier.model_name

    @property
    def model_version(self) -> str:
        return self._classifier.model_version

    def detect(
        self,
        *,
        frame_id,
        frame_path: str | Path,
        timestamp_seconds: float,
    ) -> VisualDetectionResult:
        started = perf_counter()

        detections = self._face_detector.detect(
            frame_id=frame_id,
            frame_path=frame_path,
        )

        detector_used = "mediapipe_blazeface"

        if not detections:
            detections = self._fallback_face_detector.detect(
                frame_id=frame_id,
                frame_path=frame_path,
            )
            detector_used = "opencv_haar"

        if not detections:
            return VisualDetectionResult(
                frame_id=frame_id,
                timestamp_seconds=timestamp_seconds,
                score=0.0,
                model_name=self.model_name,
                model_version=self.model_version,
                face_detected=False,
                processing_time_ms=(
                    perf_counter() - started
                ) * 1000.0,
            )

        face = max(
            detections,
            key=lambda item: (
                (item.x2 - item.x1)
                * (item.y2 - item.y1)
            ),
        )

        crop_path = (
            self._temporary_root
            / f"{uuid4()}.jpg"
        )

        try:
            self._face_aligner.align(
                frame_path=frame_path,
                face=face,
                output_path=crop_path,
            )

            image = Image.open(crop_path).convert("RGB")

            tensor = self._preprocess(image).unsqueeze(0)

            result = self._classifier.predict(tensor)

            return VisualDetectionResult(
                frame_id=frame_id,
                timestamp_seconds=timestamp_seconds,
                score=result["fake_probability"],
                model_name=self.model_name,
                model_version=self.model_version,
                face_detected=True,
                processing_time_ms=(
                    perf_counter() - started
                ) * 1000.0,
            )

        finally:
            crop_path.unlink(missing_ok=True)

    def close(self) -> None:
        self._face_detector.close()
