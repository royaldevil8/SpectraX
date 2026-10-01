import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence_item import EvidenceItem
from app.models.media_asset import MediaAsset
from app.models.provenance_record import ProvenanceRecord


PROVENANCE_EVIDENCE_TYPES = {
    "provenance_verified",
    "provenance_present",
    "provenance_absent",
    "provenance_failure",
}


def _run_ffprobe(media_path: Path) -> dict[str, Any]:
    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_format",
        "-show_streams",
        "-of",
        "json",
        str(media_path),
    ]

    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )

    if completed.returncode != 0:
        raise RuntimeError(
            completed.stderr.strip()
            or "ffprobe failed while inspecting provenance metadata."
        )

    try:
        return json.loads(completed.stdout or "{}")
    except json.JSONDecodeError as exc:
        raise RuntimeError("Unable to parse ffprobe JSON output.") from exc


def _collect_text(value: Any) -> list[str]:
    values: list[str] = []

    if isinstance(value, dict):
        for key, item in value.items():
            values.append(str(key))
            values.extend(_collect_text(item))

    elif isinstance(value, list):
        for item in value:
            values.extend(_collect_text(item))

    elif value is not None:
        values.append(str(value))

    return values


def inspect_provenance(media_path: Path | str) -> dict[str, Any]:
    media_path = Path(media_path)

    if not media_path.exists():
        raise FileNotFoundError(
            f"Media file not found: {media_path}"
        )

    ffprobe_data = _run_ffprobe(media_path)

    format_data = ffprobe_data.get("format") or {}
    streams = ffprobe_data.get("streams") or []

    text_values = _collect_text(ffprobe_data)
    normalized_text = "\n".join(text_values).lower()

    marker_tokens = [
        "c2pa",
        "content credentials",
        "contentcredentials",
        "jumbf",
    ]

    detected_tokens = [
        token
        for token in marker_tokens
        if token in normalized_text
    ]

    raw_marker_detected = False

    with media_path.open("rb") as handle:
        data = handle.read()

    lower_data = data.lower()

    binary_tokens = [
        b"c2pa",
        b"jumbf",
        b"content credentials",
        b"contentcredentials",
    ]

    binary_matches = [
        token.decode("ascii", errors="ignore")
        for token in binary_tokens
        if token in lower_data
    ]

    raw_marker_detected = bool(binary_matches)

    marker_detected = bool(
        detected_tokens or binary_matches
    )

    c2pa_detected = "c2pa" in detected_tokens or b"c2pa" in lower_data

    container_format = format_data.get("format_name")

    metadata = {
        "format_name": container_format,
        "format_long_name": format_data.get("format_long_name"),
        "format_tags": format_data.get("tags") or {},
        "stream_count": len(streams),
        "stream_tags": [
            stream.get("tags") or {}
            for stream in streams
        ],
        "detected_tokens": detected_tokens,
        "binary_matches": binary_matches,
        "verification_supported": False,
    }

    if c2pa_detected:
        status = "present"
        message = (
            "C2PA-related marker detected, but cryptographic "
            "manifest verification is not available in the "
            "current runtime."
        )
    elif marker_detected:
        status = "present"
        message = (
            "Provenance-related marker detected, but cryptographic "
            "verification is not available in the current runtime."
        )
    else:
        status = "absent"
        message = (
            "No C2PA/JUMBF provenance marker was detected. "
            "Absence of provenance is not evidence that the media "
            "is synthetic."
        )

    sha256 = hashlib.sha256(data).hexdigest()

    return {
        "sha256": sha256,
        "status": status,
        "container_format": container_format,
        "c2pa_detected": c2pa_detected,
        "marker_detected": marker_detected,
        "metadata": metadata,
        "verification_message": message,
    }


async def analyze_and_persist_provenance(
    db: AsyncSession,
    *,
    media_asset_id: UUID,
    media_path: Path,
) -> dict[str, Any]:
    result = inspect_provenance(media_path)

    asset_result = await db.execute(
        select(MediaAsset).where(
            MediaAsset.id == media_asset_id
        )
    )
    asset = asset_result.scalar_one_or_none()

    if asset is None:
        raise ValueError("Media asset not found.")

    if asset.sha256 != result["sha256"]:
        raise RuntimeError(
            "Provenance SHA-256 does not match the ingested media asset."
        )

    existing_result = await db.execute(
        select(ProvenanceRecord).where(
            ProvenanceRecord.media_asset_id == media_asset_id
        )
    )
    record = existing_result.scalar_one_or_none()

    if record is None:
        record = ProvenanceRecord(
            media_asset_id=media_asset_id,
            sha256=result["sha256"],
            status=result["status"],
            container_format=result["container_format"],
            c2pa_detected=result["c2pa_detected"],
            marker_detected=result["marker_detected"],
            provenance_metadata=result["metadata"],
            verification_message=result["verification_message"],
        )
        db.add(record)
    else:
        record.sha256 = result["sha256"]
        record.status = result["status"]
        record.container_format = result["container_format"]
        record.c2pa_detected = result["c2pa_detected"]
        record.marker_detected = result["marker_detected"]
        record.provenance_metadata = result["metadata"]
        record.verification_message = result["verification_message"]

    await db.flush()

    await db.execute(
        delete(EvidenceItem).where(
            EvidenceItem.media_asset_id == media_asset_id,
            EvidenceItem.evidence_type.in_(
                PROVENANCE_EVIDENCE_TYPES
            ),
        )
    )

    evidence_type = {
        "verified": "provenance_verified",
        "present": "provenance_present",
        "absent": "provenance_absent",
        "failure": "provenance_failure",
    }.get(result["status"], "provenance_failure")

    db.add(
        EvidenceItem(
            media_asset_id=media_asset_id,
            evidence_type=evidence_type,
            track_id=None,
            start_seconds=0,
            end_seconds=0,
            duration_seconds=0,
            description=result["verification_message"],
        )
    )

    await db.flush()

    return {
        "media_asset_id": media_asset_id,
        "sha256": result["sha256"],
        "status": result["status"],
        "container_format": result["container_format"],
        "c2pa_detected": result["c2pa_detected"],
        "marker_detected": result["marker_detected"],
        "verification_supported": False,
        "verification_message": result["verification_message"],
    }
