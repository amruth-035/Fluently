"""Client-side audio checks before calling OpenAI (size, duration, transcript length)."""

MIN_AUDIO_BYTES = 1_000
MIN_DURATION_SECONDS = 1.0
MIN_TRANSCRIPT_LENGTH = 2


def validate_uploaded_audio(audio_bytes: bytes, duration: float) -> None:
    """Reject invalid recordings before any OpenAI calls."""
    if duration < MIN_DURATION_SECONDS:
        raise ValueError("Recording must be at least 1 second long.")

    if not audio_bytes:
        raise ValueError("Audio file is empty. Please record again.")

    if len(audio_bytes) < MIN_AUDIO_BYTES:
        raise ValueError(
            "Recording is too short or empty. Speak for at least a second and try again."
        )


def validate_transcript(transcript: str) -> None:
    """Reject silent or unusable transcripts before analysis."""
    cleaned = transcript.strip()
    if len(cleaned) < MIN_TRANSCRIPT_LENGTH:
        raise ValueError(
            "We couldn't detect enough speech in that recording. "
            "Try again in a quiet place and speak clearly."
        )
