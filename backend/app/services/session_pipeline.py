import logging
import uuid
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from app.ai.analysis import analyze_transcript
from app.ai.lessons import generate_lesson
from app.ai.transcription import transcribe_audio
from app.models.speech_session import SpeechSession
from app.models.session_enums import PipelineStep
from app.services import session_service
from app.services.storage_service import StorageUploadError, upload_session_audio

logger = logging.getLogger(__name__)

MAX_DURATION_SECONDS = 180
MAX_AUDIO_BYTES = 25 * 1024 * 1024

CONTENT_TYPE_EXTENSIONS = {
    "audio/webm": ".webm",
    "audio/mp4": ".m4a",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/ogg": ".ogg",
}


@dataclass
class PipelineResult:
    session: SpeechSession
    error_message: str | None = None


def guess_extension(filename: str | None, content_type: str | None) -> str:
    if filename:
        suffix = Path(filename).suffix.lower()
        if suffix:
            return suffix

    if content_type and content_type in CONTENT_TYPE_EXTENSIONS:
        return CONTENT_TYPE_EXTENSIONS[content_type]

    return ".webm"


def process_session_upload(
    db: Session,
    *,
    user_id: uuid.UUID,
    audio_bytes: bytes,
    duration: float,
    filename: str | None,
    content_type: str | None,
) -> PipelineResult:
    """Run the full upload → transcribe → analyze → lesson pipeline."""
    if duration <= 0:
        raise ValueError("Duration must be greater than zero.")
    if duration > MAX_DURATION_SECONDS:
        raise ValueError(f"Recording exceeds the {MAX_DURATION_SECONDS // 60}-minute limit.")
    if not audio_bytes:
        raise ValueError("Audio file is empty.")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise ValueError("Audio file is too large.")

    session = session_service.create_session_row(db, user_id=user_id, duration=duration)
    extension = guess_extension(filename, content_type)

    try:
        audio_path = upload_session_audio(
            user_id,
            session.id,
            audio_bytes,
            content_type or "application/octet-stream",
            extension,
        )
        session_service.update_audio_path(db, session, audio_path)
    except StorageUploadError as exc:
        logger.exception("Upload failed for session %s", session.id)
        session = session_service.mark_session_failed(
            db,
            session,
            step=PipelineStep.UPLOAD,
            error_message=str(exc),
        )
        return PipelineResult(session=session, error_message=str(exc))

    try:
        transcript = transcribe_audio(audio_bytes, filename or f"recording{extension}")
        session_service.update_transcript(db, session, transcript)
    except Exception as exc:
        logger.exception("Transcription failed for session %s", session.id)
        message = f"Transcription failed: {exc}"
        session = session_service.mark_session_failed(
            db,
            session,
            step=PipelineStep.TRANSCRIPTION,
            error_message=message,
        )
        return PipelineResult(session=_reload(db, session.id), error_message=message)

    try:
        analysis = analyze_transcript(transcript, duration)
        session_service.save_analysis(db, session, analysis.model_dump())
    except Exception as exc:
        logger.exception("Analysis failed for session %s", session.id)
        message = f"Analysis failed: {exc}"
        session = session_service.mark_session_failed(
            db,
            session,
            step=PipelineStep.ANALYSIS,
            error_message=message,
        )
        return PipelineResult(session=_reload(db, session.id), error_message=message)

    try:
        lesson = generate_lesson(analysis)
        session_service.save_lesson(db, session, lesson.model_dump())
    except Exception as exc:
        logger.exception("Lesson generation failed for session %s", session.id)
        message = f"Lesson generation failed: {exc}"
        session = session_service.mark_session_failed(
            db,
            session,
            step=PipelineStep.LESSON,
            error_message=message,
        )
        return PipelineResult(session=_reload(db, session.id), error_message=message)

    session = session_service.mark_session_completed(db, session)
    return PipelineResult(session=_reload(db, session.id))


def _reload(db: Session, session_id: uuid.UUID) -> SpeechSession:
    session = session_service.reload_session_with_relations(db, session_id)
    if session is None:
        raise RuntimeError(f"Session {session_id} not found after pipeline step")
    return session
