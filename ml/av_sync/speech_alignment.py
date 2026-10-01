from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import subprocess
import tempfile
import wave

import numpy as np


@dataclass(frozen=True)
class SpeechInterval:
    start_seconds: float
    end_seconds: float
    confidence: float


@dataclass(frozen=True)
class SpeechTimingResult:
    sample_rate: int
    duration_seconds: float
    intervals: list[SpeechInterval]
    audio_available: bool
    unavailable_reason: str | None = None


class SpeechAlignmentError(RuntimeError):
    """Raised when speech timing analysis cannot be completed."""


def _extract_pcm(
    media_path: str | Path,
    *,
    sample_rate: int = 16000,
) -> tuple[np.ndarray, int]:
    """
    Extract mono PCM16 audio from a media file using FFmpeg.

    FFmpeg is deliberately used here instead of librosa/torchaudio so the
    first A/V-sync implementation does not depend on an additional Python
    audio stack.
    """

    source = Path(media_path)

    if not source.is_file():
        raise SpeechAlignmentError(f"Media file does not exist: {source}")

    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(source),
        "-vn",
        "-ac",
        "1",
        "-ar",
        str(sample_rate),
        "-f",
        "s16le",
        "pipe:1",
    ]

    try:
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
    except OSError as exc:
        raise SpeechAlignmentError(
            "Unable to execute FFmpeg."
        ) from exc

    if result.returncode != 0:
        detail = result.stderr.decode(
            "utf-8",
            errors="replace",
        ).strip()

        raise SpeechAlignmentError(
            f"FFmpeg audio extraction failed: {detail or 'unknown error'}"
        )

    if not result.stdout:
        raise SpeechAlignmentError(
            "No audio samples were produced by FFmpeg."
        )

    audio = np.frombuffer(
        result.stdout,
        dtype=np.int16,
    ).astype(np.float32)

    if audio.size == 0:
        raise SpeechAlignmentError("Extracted audio is empty.")

    audio /= 32768.0

    return audio, sample_rate


def _frame_rms(
    audio: np.ndarray,
    *,
    sample_rate: int,
    frame_duration: float,
    hop_duration: float,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Calculate short-time RMS energy.

    Returns:
        times: frame-center timestamps
        rms: normalized RMS energy
    """

    frame_size = max(1, int(sample_rate * frame_duration))
    hop_size = max(1, int(sample_rate * hop_duration))

    if audio.size < frame_size:
        padded = np.pad(
            audio,
            (0, frame_size - audio.size),
        )
        audio = padded

    frame_count = 1 + (audio.size - frame_size) // hop_size

    rms_values = np.empty(frame_count, dtype=np.float32)
    times = np.empty(frame_count, dtype=np.float64)

    for index in range(frame_count):
        start = index * hop_size
        frame = audio[start:start + frame_size]

        rms_values[index] = np.sqrt(
            np.mean(np.square(frame)) + 1e-12
        )

        times[index] = (
            start + frame_size / 2
        ) / sample_rate

    return times, rms_values


def _build_intervals(
    times: np.ndarray,
    speech_mask: np.ndarray,
    *,
    minimum_duration: float,
    merge_gap: float,
) -> list[SpeechInterval]:
    """
    Convert frame-level speech activity into continuous intervals.
    """

    if len(times) == 0:
        return []

    intervals: list[tuple[float, float]] = []

    start: float | None = None
    previous_time: float | None = None

    for time, is_speech in zip(times, speech_mask):
        time = float(time)

        if is_speech and start is None:
            start = time

        if not is_speech and start is not None:
            end = previous_time if previous_time is not None else time

            if end > start:
                intervals.append((start, end))

            start = None

        previous_time = time

    if start is not None:
        end = float(times[-1])

        if end > start:
            intervals.append((start, end))

    if not intervals:
        return []

    merged: list[tuple[float, float]] = []

    for start, end in intervals:
        if not merged:
            merged.append((start, end))
            continue

        previous_start, previous_end = merged[-1]

        if start - previous_end <= merge_gap:
            merged[-1] = (
                previous_start,
                max(previous_end, end),
            )
        else:
            merged.append((start, end))

    results: list[SpeechInterval] = []

    for start, end in merged:
        duration = end - start

        if duration < minimum_duration:
            continue

        results.append(
            SpeechInterval(
                start_seconds=round(start, 4),
                end_seconds=round(end, 4),
                confidence=1.0,
            )
        )

    return results


def analyze_speech_timing(
    media_path: str | Path,
    *,
    sample_rate: int = 16000,
    frame_duration: float = 0.025,
    hop_duration: float = 0.010,
    minimum_speech_duration: float = 0.15,
    merge_gap: float = 0.20,
) -> SpeechTimingResult:
    """
    Estimate speech-active intervals from media audio.

    This is an energy-based speech-activity baseline.

    It does NOT perform:
      - ASR
      - word alignment
      - phoneme alignment
      - speaker identification

    The result is intended as the first temporal signal for the
    SpectraX A/V synchronization engine.
    """

    try:
        audio, actual_sample_rate = _extract_pcm(
            media_path,
            sample_rate=sample_rate,
        )
    except SpeechAlignmentError as exc:
        message = str(exc)

        if (
            "Output file does not contain any stream"
            in message
            or "No audio samples were produced"
            in message
        ):
            return SpeechTimingResult(
                sample_rate=sample_rate,
                duration_seconds=0.0,
                intervals=[],
                audio_available=False,
                unavailable_reason=(
                    "No audio stream is available "
                    "in the media."
                ),
            )

        raise

    times, rms = _frame_rms(
        audio,
        sample_rate=actual_sample_rate,
        frame_duration=frame_duration,
        hop_duration=hop_duration,
    )

    noise_floor = float(
        np.percentile(rms, 20)
    )

    high_energy = float(
        np.percentile(rms, 80)
    )

    dynamic_range = high_energy - noise_floor

    if dynamic_range <= 1e-8:
        speech_mask = np.zeros_like(
            rms,
            dtype=bool,
        )
    else:
        threshold = noise_floor + (
            dynamic_range * 0.25
        )

        speech_mask = rms >= threshold

    intervals = _build_intervals(
        times,
        speech_mask,
        minimum_duration=minimum_speech_duration,
        merge_gap=merge_gap,
    )

    duration_seconds = audio.size / actual_sample_rate

    return SpeechTimingResult(
        sample_rate=actual_sample_rate,
        duration_seconds=round(
            duration_seconds,
            4,
        ),
        intervals=intervals,
        audio_available=True,
        unavailable_reason=None,
    )


__all__ = [
    "SpeechAlignmentError",
    "SpeechInterval",
    "SpeechTimingResult",
    "analyze_speech_timing",
]
