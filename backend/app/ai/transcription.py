"""OpenAI Whisper transcription for uploaded session audio."""

import logging
from io import BytesIO

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)


def get_openai_client() -> OpenAI:
    return OpenAI(api_key=settings.openai_api_key)


def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    """Transcribe speech audio with OpenAI Whisper."""
    client = get_openai_client()
    buffer = BytesIO(audio_bytes)
    buffer.name = filename

    logger.info("Starting Whisper transcription for %s (%s bytes)", filename, len(audio_bytes))
    result = client.audio.transcriptions.create(
        model="whisper-1",
        file=buffer,
        response_format="text",
    )

    transcript = result if isinstance(result, str) else str(result)
    logger.info("Transcription complete (%s characters)", len(transcript))
    return transcript.strip()
