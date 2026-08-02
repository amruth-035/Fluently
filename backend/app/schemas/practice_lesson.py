import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class PracticeLessonResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    generated_lesson: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}
