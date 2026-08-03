"""CRUD and status updates for speech sessions, analysis results, and lessons."""

import uuid
from enum import StrEnum

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.analysis_result import AnalysisResult
from app.models.practice_lesson import PracticeLesson
from app.models.session_enums import PipelineStep, SessionStatus
from app.models.speech_session import SpeechSession


def create_session_row(
    db: Session,
    *,
    user_id: uuid.UUID,
    duration: float,
) -> SpeechSession:
    session = SpeechSession(
        user_id=user_id,
        duration=duration,
        audio_path="",
        status=SessionStatus.PROCESSING.value,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def mark_session_failed(
    db: Session,
    session: SpeechSession,
    *,
    step: PipelineStep,
    error_message: str,
) -> SpeechSession:
    session.status = SessionStatus.FAILED.value
    session.failed_step = step.value
    session.pipeline_error = error_message
    db.commit()
    db.refresh(session)
    return session


def mark_session_completed(db: Session, session: SpeechSession) -> SpeechSession:
    session.status = SessionStatus.COMPLETED.value
    session.failed_step = None
    session.pipeline_error = None
    db.commit()
    db.refresh(session)
    return session


def update_audio_path(db: Session, session: SpeechSession, audio_path: str) -> None:
    session.audio_path = audio_path
    db.commit()
    db.refresh(session)


def update_transcript(db: Session, session: SpeechSession, transcript: str) -> None:
    session.transcript = transcript
    db.commit()
    db.refresh(session)


def save_analysis(
    db: Session,
    session: SpeechSession,
    analysis_data: dict,
) -> AnalysisResult:
    analysis = AnalysisResult(session_id=session.id, **analysis_data)
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


def save_lesson(db: Session, session: SpeechSession, lesson_data: dict) -> PracticeLesson:
    lesson = PracticeLesson(session_id=session.id, generated_lesson=lesson_data)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def list_user_sessions(db: Session, user_id: uuid.UUID) -> list[SpeechSession]:
    stmt = (
        select(SpeechSession)
        .options(joinedload(SpeechSession.analysis))
        .where(SpeechSession.user_id == user_id)
        .order_by(SpeechSession.created_at.desc())
    )
    return list(db.scalars(stmt).unique().all())


def get_user_session(db: Session, user_id: uuid.UUID, session_id: uuid.UUID) -> SpeechSession | None:
    stmt = (
        select(SpeechSession)
        .options(
            joinedload(SpeechSession.analysis),
            joinedload(SpeechSession.lesson),
        )
        .where(SpeechSession.id == session_id, SpeechSession.user_id == user_id)
    )
    return db.scalars(stmt).first()


def reload_session_with_relations(db: Session, session_id: uuid.UUID) -> SpeechSession | None:
    stmt = (
        select(SpeechSession)
        .options(
            joinedload(SpeechSession.analysis),
            joinedload(SpeechSession.lesson),
        )
        .where(SpeechSession.id == session_id)
    )
    return db.scalars(stmt).first()
