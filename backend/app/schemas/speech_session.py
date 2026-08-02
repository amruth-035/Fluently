import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.analysis_result import AnalysisResultResponse
from app.schemas.practice_lesson import PracticeLessonResponse


class SpeechSessionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    transcript: str | None
    audio_path: str
    duration: float
    created_at: datetime
    analysis: AnalysisResultResponse | None = None
    lesson: PracticeLessonResponse | None = None

    model_config = {"from_attributes": True}
