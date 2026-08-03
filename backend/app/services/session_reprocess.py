"""Re-runs the AI pipeline for a failed session (transcribe, analyze, lesson)."""

import logging
import uuid
from pathlib import Path

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.ai.analysis import analyze_transcript
from app.ai.lessons import generate_lesson
from app.ai.schemas import AnalysisOutput
from app.ai.transcription import transcribe_audio
from app.models.analysis_result import AnalysisResult
from app.models.practice_lesson import PracticeLesson
from app.models.session_enums import PipelineStep, SessionStatus
from app.models.speech_session import SpeechSession
from app.services import session_service
from app.services.audio_validation import validate_transcript
from app.services.session_pipeline import PipelineResult, _reload
from app.services.storage_service import StorageUploadError, download_session_audio

logger = logging.getLogger(__name__)


def _analysis_to_output(analysis: AnalysisResult) -> AnalysisOutput:
    return AnalysisOutput.model_validate(
        {
            "fluency_score": analysis.fluency_score,
            "speaking_rate": analysis.speaking_rate,
            "pause_count": analysis.pause_count,
            "repetitions": analysis.repetitions,
            "filler_words": analysis.filler_words,
            "strengths": analysis.strengths,
            "recommendations": analysis.recommendations,
        }
    )


def _clear_downstream_results(db: Session, session_id: uuid.UUID, from_step: PipelineStep) -> None:
    if from_step in (PipelineStep.UPLOAD, PipelineStep.TRANSCRIPTION):
        db.execute(delete(AnalysisResult).where(AnalysisResult.session_id == session_id))
        db.execute(delete(PracticeLesson).where(PracticeLesson.session_id == session_id))
    elif from_step == PipelineStep.ANALYSIS:
        db.execute(delete(AnalysisResult).where(AnalysisResult.session_id == session_id))
        db.execute(delete(PracticeLesson).where(PracticeLesson.session_id == session_id))
    elif from_step == PipelineStep.LESSON:
        db.execute(delete(PracticeLesson).where(PracticeLesson.session_id == session_id))
    db.commit()


def _fail(
    db: Session,
    session: SpeechSession,
    step: PipelineStep,
    message: str,
) -> PipelineResult:
    logger.error("Reprocess failed for session %s at %s: %s", session.id, step.value, message)
    updated = session_service.mark_session_failed(db, session, step=step, error_message=message)
    return PipelineResult(session=_reload(db, updated.id), error_message=message)


def reprocess_session(db: Session, session: SpeechSession) -> PipelineResult:
    """Resume a failed session from the step that failed."""
    if session.status != SessionStatus.FAILED.value:
        raise ValueError("Only failed sessions can be reprocessed.")

    failed_step = PipelineStep(session.failed_step or PipelineStep.TRANSCRIPTION.value)

    if failed_step == PipelineStep.UPLOAD:
        raise ValueError("Audio upload failed. Please make a new recording.")

    if not session.audio_path:
        raise ValueError("No audio is stored for this session. Please make a new recording.")

    _clear_downstream_results(db, session.id, failed_step)
    session.status = SessionStatus.PROCESSING.value
    session.failed_step = None
    session.pipeline_error = None
    db.commit()
    db.refresh(session)

    if failed_step == PipelineStep.TRANSCRIPTION or not session.transcript:
        try:
            audio_bytes = download_session_audio(session.audio_path)
            filename = Path(session.audio_path).name
            transcript = transcribe_audio(audio_bytes, filename)
            validate_transcript(transcript)
            session_service.update_transcript(db, session, transcript)
        except Exception as exc:
            logger.exception("Reprocess transcription failed for session %s", session.id)
            return _fail(db, session, PipelineStep.TRANSCRIPTION, f"Transcription failed: {exc}")

    session = _reload(db, session.id)
    assert session is not None

    if failed_step in (PipelineStep.TRANSCRIPTION, PipelineStep.ANALYSIS) or not session.analysis:
        if not session.transcript:
            return _fail(db, session, PipelineStep.TRANSCRIPTION, "No transcript available to analyze.")
        try:
            analysis = analyze_transcript(session.transcript, session.duration)
            session_service.save_analysis(db, session, analysis.model_dump())
        except Exception as exc:
            logger.exception("Reprocess analysis failed for session %s", session.id)
            return _fail(db, session, PipelineStep.ANALYSIS, f"Analysis failed: {exc}")

    session = _reload(db, session.id)
    assert session is not None and session.analysis is not None

    try:
        lesson = generate_lesson(_analysis_to_output(session.analysis))
        session_service.save_lesson(db, session, lesson.model_dump())
    except Exception as exc:
        logger.exception("Reprocess lesson failed for session %s", session.id)
        return _fail(db, session, PipelineStep.LESSON, f"Lesson generation failed: {exc}")

    completed = session_service.mark_session_completed(db, session)
    return PipelineResult(session=_reload(db, completed.id))
