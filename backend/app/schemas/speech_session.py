import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.analysis_result import AnalysisResultResponse
from app.schemas.practice_lesson import PracticeLessonResponse


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

    model_config = {"from_attributes": True}


class SpeechSessionResponse(SpeechSessionSummary):
    analysis: AnalysisResultResponse | None = None
    lesson: PracticeLessonResponse | None = None
