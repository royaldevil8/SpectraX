from __future__ import annotations

from app.project_path import PROJECT_ROOT

import tempfile
import uuid
from collections import defaultdict
from pathlib import Path

import cv2

from app.services.evidence_service import save_av_evidence
from app.services.media_probe_service import probe_media
from app.services.visual.face.av_alignment import AVAlignmentAnalyzer
from app.services.visual.face.av_evidence import (
    AVEvidenceSummary,
    build_av_evidence,
)
from app.services.visual.face.av_mismatch import AVMismatchAnalyzer
from app.services.visual.face.detector import OpenCVHaarFaceDetector
from app.services.visual.face.mediapipe_detector import MediaPipeFaceDetector
from app.services.visual.face.filtering import non_max_suppression
from app.services.visual.face.mouth_motion import (
    LowerFaceMotionExtractor,
    MouthMotionMeasurement,
)
from app.services.visual.face.quality import filter_face_tracks
from app.services.visual.face.tracking import SimpleIoUFaceTracker
from app.services.visual.face.visual_motion import VisualMotionAnalyzer
from ml.av_sync.speech_alignment import analyze_speech_timing


class AVSyncService:
    """
    Phase 6 A/V synchronization orchestration service.

    This service combines:
      - audio activity timing
      - face detection
      - face tracking
      - lower-face motion
      - temporal A/V alignment
      - temporal mismatch evidence
      - EvidenceItem persistence

    The resulting evidence is forensic evidence, not a standalone
    deepfake/fake probability.
    """

    def __init__(
        self,
        *,
        face_detector: OpenCVHaarFaceDetector | MediaPipeFaceDetector | None = None,
        tracker: SimpleIoUFaceTracker | None = None,
        motion_extractor: LowerFaceMotionExtractor | None = None,
        visual_motion_analyzer: VisualMotionAnalyzer | None = None,
        alignment_analyzer: AVAlignmentAnalyzer | None = None,
        mismatch_analyzer: AVMismatchAnalyzer | None = None,
    ) -> None:
        if face_detector is not None:
            self.face_detector = face_detector
            self._fallback_face_detector = None
        else:
            self.face_detector = MediaPipeFaceDetector(
                "app/services/visual/checkpoints/"
                "face_detection/blaze_face_short_range.tflite",
                min_detection_confidence=0.10,
            )
            self._fallback_face_detector = OpenCVHaarFaceDetector()
        self.tracker = tracker or SimpleIoUFaceTracker()
        self.motion_extractor = (
            motion_extractor or LowerFaceMotionExtractor()
        )
        self.visual_motion_analyzer = (
            visual_motion_analyzer or VisualMotionAnalyzer()
        )
        self.alignment_analyzer = (
            alignment_analyzer or AVAlignmentAnalyzer()
        )
        self.mismatch_analyzer = (
            mismatch_analyzer or AVMismatchAnalyzer()
        )

    async def analyze_and_persist(
        self,
        *,
        media_path: str | Path,
        media_asset_id: uuid.UUID,
        db,
    ) -> dict:
        media_path = Path(media_path)

        if not media_path.exists():
            raise FileNotFoundError(
                f"Media file does not exist: {media_path}"
            )

        metadata = probe_media(str(media_path))

        speech_result = analyze_speech_timing(str(media_path))

        fps = float(metadata.get("frame_rate") or 0.0)

        if fps <= 0.0:
            raise ValueError(
                "Media does not contain a valid video frame rate."
            )

        capture = cv2.VideoCapture(str(media_path))

        if not capture.isOpened():
            raise RuntimeError(
                f"Unable to open video: {media_path}"
            )

        measurements_by_track: dict[
            int, list[MouthMotionMeasurement]
        ] = defaultdict(list)

        frame_count = 0

        try:
            with tempfile.TemporaryDirectory(
                prefix="spectrax_avsync_"
            ) as temp_dir:
                frame_path = Path(temp_dir) / "current.jpg"

                while True:
                    ok, frame = capture.read()

                    if not ok:
                        break

                    timestamp_seconds = (
                        frame_count / fps
                    )

                    frame_id = uuid.uuid4()

                    if not cv2.imwrite(
                        str(frame_path),
                        frame,
                    ):
                        raise RuntimeError(
                            "Failed to write temporary frame."
                        )

                    detections = self.face_detector.detect(
                        frame_id=frame_id,
                        frame_path=str(frame_path),
                    )

                    if (
                        not detections
                        and self._fallback_face_detector is not None
                    ):
                        detections = self._fallback_face_detector.detect(
                            frame_id=frame_id,
                            frame_path=str(frame_path),
                        )

                    detections = non_max_suppression(
                        detections,
                        iou_threshold=0.50,
                    )

                    active_tracks = self.tracker.update(
                        detections,
                        frame_index=frame_count,
                        timestamp_seconds=timestamp_seconds,
                    )

                    for track in active_tracks:
                        observations = track.observations

                        if len(observations) < 2:
                            continue

                        previous = observations[-2]
                        current = observations[-1]

                        if (
                            current.frame_index
                            - previous.frame_index
                            != 1
                        ):
                            continue

                        measurement = (
                            self.motion_extractor.measure_pair(
                                previous_frame=previous_frame,
                                current_frame=frame,
                                previous_face=previous.detection,
                                current_face=current.detection,
                                frame_index=current.frame_index,
                                timestamp_seconds=current.timestamp_seconds,
                            )
                        )

                        measurements_by_track[
                            track.track_id
                        ].append(measurement)

                    previous_frame = frame.copy()

                    frame_count += 1

        finally:
            capture.release()

        tracks = self.tracker.get_tracks()

        valid_tracks = filter_face_tracks(
            tracks,
            total_frames=frame_count,
            fps=fps,
        )

        evidence_by_track: dict[
            int, AVEvidenceSummary
        ] = {}

        persisted_count = 0

        for track in valid_tracks:
            measurements = measurements_by_track.get(
                track.track_id,
                [],
            )

            _, visual_intervals = (
                self.visual_motion_analyzer.analyze(
                    measurements,
                    track_id=track.track_id,
                )
            )

            alignment = self.alignment_analyzer.compare(
                track_id=track.track_id,
                speech_intervals=speech_result.intervals,
                visual_intervals=visual_intervals,
                audio_available=speech_result.audio_available,
                unavailable_reason=(
                    speech_result.unavailable_reason
                ),
            )

            mismatch = self.mismatch_analyzer.compare(
                alignment,
                speech_result.intervals,
                visual_intervals,
            )

            evidence_summary = build_av_evidence(
                track_id=track.track_id,
                alignment=alignment,
                mismatch=mismatch,
            )

            evidence_by_track[track.track_id] = evidence_summary

            persisted = await save_av_evidence(
                db,
                media_asset_id=media_asset_id,
                evidence_items=evidence_summary.evidence_items,
            )

            persisted_count += persisted

        return {
            "media_asset_id": str(media_asset_id),
            "media_path": str(media_path),
            "frame_count": frame_count,
            "fps": fps,
            "duration_seconds": float(
                metadata.get("duration_seconds") or 0.0
            ),
            "audio_available": speech_result.audio_available,
            "audio_unavailable_reason": (
                speech_result.unavailable_reason
            ),
            "speech_interval_count": len(
                speech_result.intervals
            ),
            "track_count": len(tracks),
            "valid_track_count": len(valid_tracks),
            "persisted_evidence_count": persisted_count,
            "tracks": [
                {
                    "track_id": summary.track_id,
                    "analysis_available": summary.analysis_available,
                    "speech_duration_seconds": summary.speech_duration_seconds,
                    "visual_motion_duration_seconds": summary.visual_motion_duration_seconds,
                    "aligned_duration_seconds": summary.aligned_duration_seconds,
                    "speech_coverage": summary.speech_coverage,
                    "visual_coverage": summary.visual_coverage,
                    "mismatch_duration_seconds": summary.mismatch_duration_seconds,
                    "evidence_items": len(summary.evidence_items),
                    "unavailable_reason": summary.unavailable_reason,
                }
                for summary in evidence_by_track.values()
            ],
        }


__all__ = ["AVSyncService"]
