import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel

from app.schemas.analysis_result import AnalysisResultResponse
from app.schemas.practice_lesson import PracticeLessonResponse

if TYPE_CHECKING:
    from app.models.speech_session import SpeechSession


class SpeechSessionSummary(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    transcript: str | None
    audio_path: str
    duration: float
    status: str
    failed_step: str | None = None
    pipeline_error: str | None = None
    created_at: datetime
    fluency_score: float | None = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_session(cls, session: "SpeechSession") -> "SpeechSessionSummary":
        return cls(
            id=session.id,
            user_id=session.user_id,
            transcript=session.transcript,
            audio_path=session.audio_path,
            duration=session.duration,
            status=session.status,
            failed_step=session.failed_step,
            pipeline_error=session.pipeline_error,
            created_at=session.created_at,
            fluency_score=session.analysis.fluency_score if session.analysis else None,
        )


class SpeechSessionResponse(SpeechSessionSummary):
    analysis: AnalysisResultResponse | None = None
    lesson: PracticeLessonResponse | None = None
