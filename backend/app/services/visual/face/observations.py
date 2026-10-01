from app.services.visual.face.tracking import (
    FaceTrack,
    FaceTrackObservation,
)


def build_track_observations(
    track: FaceTrack,
    *,
    fps: float,
) -> list[FaceTrackObservation]:
    """
    Convert detections belonging to a face track into
    time-indexed observations.

    The current FaceDetection schema does not store frame_index,
    so frame indices are reconstructed from the track span.

    This helper should only be used when detections are known
    to represent sequential observations.
    """

    if fps <= 0:
        raise ValueError("fps must be > 0.")

    if track.first_frame_index is None:
        raise ValueError(
            "Track has no first_frame_index."
        )

    observations: list[FaceTrackObservation] = []

    for offset, detection in enumerate(
        track.detections
    ):
        frame_index = (
            track.first_frame_index + offset
        )

        timestamp_seconds = (
            frame_index / fps
        )

        observations.append(
            FaceTrackObservation(
                track_id=track.track_id,
                frame_index=frame_index,
                timestamp_seconds=timestamp_seconds,
                detection=detection,
            )
        )

    return observations
