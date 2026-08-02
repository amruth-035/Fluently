import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AnalysisResultResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    fluency_score: float
    speaking_rate: float
    pause_count: int
    repetitions: list[Any]
    filler_words: list[Any]
    strengths: list[Any]
    recommendations: list[Any]
    created_at: datetime

    model_config = {"from_attributes": True}
