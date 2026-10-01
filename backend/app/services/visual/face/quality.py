from dataclasses import dataclass

from app.services.visual.face.tracking import FaceTrack


@dataclass(frozen=True)
class FaceTrackQuality:
    """
    Quality summary for one temporal face track.
    """

    track_id: int
    first_frame_index: int
    last_frame_index: int
    span_frames: int
    observation_count: int
    coverage_ratio: float
    duration_seconds: float
    is_valid: bool


def evaluate_face_track(
    track: FaceTrack,
    *,
    total_frames: int,
    fps: float,
    min_duration_seconds: float = 2.0,
    min_coverage_ratio: float = 0.50,
) -> FaceTrackQuality:
    if total_frames <= 0:
        raise ValueError("total_frames must be > 0.")

    if fps <= 0:
        raise ValueError("fps must be > 0.")

    if track.first_frame_index is None:
        raise ValueError(
            "Track has no first frame index."
        )

    if track.last_frame_index is None:
        raise ValueError(
            "Track has no last frame index."
        )

    span_frames = (
        track.last_frame_index
        - track.first_frame_index
        + 1
    )

    observation_count = track.observation_count

    coverage_ratio = (
        observation_count / span_frames
        if span_frames > 0
        else 0.0
    )

    duration_seconds = span_frames / fps

    is_valid = (
        duration_seconds >= min_duration_seconds
        and coverage_ratio >= min_coverage_ratio
    )

    return FaceTrackQuality(
        track_id=track.track_id,
        first_frame_index=track.first_frame_index,
        last_frame_index=track.last_frame_index,
        span_frames=span_frames,
        observation_count=observation_count,
        coverage_ratio=coverage_ratio,
        duration_seconds=duration_seconds,
        is_valid=is_valid,
    )


def filter_face_tracks(
    tracks: list[FaceTrack],
    *,
    total_frames: int,
    fps: float,
    min_duration_seconds: float = 2.0,
    min_coverage_ratio: float = 0.50,
) -> list[FaceTrack]:
    valid_tracks: list[FaceTrack] = []

    for track in tracks:
        quality = evaluate_face_track(
            track,
            total_frames=total_frames,
            fps=fps,
            min_duration_seconds=min_duration_seconds,
            min_coverage_ratio=min_coverage_ratio,
        )

        if quality.is_valid:
            valid_tracks.append(track)

    return valid_tracks
