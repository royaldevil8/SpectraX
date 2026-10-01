from app.services.visual.face.schemas import FaceDetection


def _iou(
    first: FaceDetection,
    second: FaceDetection,
) -> float:
    intersection_x1 = max(first.x1, second.x1)
    intersection_y1 = max(first.y1, second.y1)
    intersection_x2 = min(first.x2, second.x2)
    intersection_y2 = min(first.y2, second.y2)

    intersection_width = max(0, intersection_x2 - intersection_x1)
    intersection_height = max(0, intersection_y2 - intersection_y1)

    intersection_area = (
        intersection_width * intersection_height
    )

    if intersection_area <= 0:
        return 0.0

    first_area = (
        max(0, first.x2 - first.x1)
        * max(0, first.y2 - first.y1)
    )

    second_area = (
        max(0, second.x2 - second.x1)
        * max(0, second.y2 - second.y1)
    )

    union_area = first_area + second_area - intersection_area

    if union_area <= 0:
        return 0.0

    return intersection_area / union_area


def non_max_suppression(
    detections: list[FaceDetection],
    *,
    iou_threshold: float = 0.50,
) -> list[FaceDetection]:
    """
    Remove heavily overlapping face detections.

    Detections are processed by confidence, highest first.
    The current FaceDetection confidence is retained as the
    ordering signal even though the OpenCV Haar baseline currently
    provides a placeholder confidence value.
    """

    if not 0.0 <= iou_threshold <= 1.0:
        raise ValueError("iou_threshold must be between 0 and 1.")

    if len(detections) <= 1:
        return list(detections)

    ordered = sorted(
        detections,
        key=lambda detection: detection.confidence,
        reverse=True,
    )

    kept: list[FaceDetection] = []

    for detection in ordered:
        overlaps_existing = any(
            _iou(detection, existing) >= iou_threshold
            for existing in kept
        )

        if not overlaps_existing:
            kept.append(detection)

    return kept
