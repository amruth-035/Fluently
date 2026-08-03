"""Dashboard aggregates: session count, average fluency, and trend over time."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.speech_session import SpeechSession
from app.schemas.dashboard import DashboardResponse, FluencyTrendPoint


def _sessions_with_analysis(db: Session, user_id: uuid.UUID) -> list[SpeechSession]:
    stmt = (
        select(SpeechSession)
        .options(joinedload(SpeechSession.analysis))
        .where(SpeechSession.user_id == user_id)
        .order_by(SpeechSession.created_at.asc())
    )
    return list(db.scalars(stmt).unique().all())


def get_user_dashboard(db: Session, user_id: uuid.UUID) -> DashboardResponse:
    sessions = _sessions_with_analysis(db, user_id)
    scores = [
        session.analysis.fluency_score
        for session in sessions
        if session.analysis is not None
    ]

    trend = [
        FluencyTrendPoint(
            date=session.created_at.date(),
            fluency_score=session.analysis.fluency_score,
        )
        for session in sessions
        if session.analysis is not None
    ]

    average = sum(scores) / len(scores) if scores else None

    return DashboardResponse(
        session_count=len(sessions),
        average_fluency_score=average,
        fluency_trend=trend,
    )
