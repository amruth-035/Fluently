import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Float, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.speech_session import SpeechSession


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("speech_sessions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    fluency_score: Mapped[float] = mapped_column(Float, nullable=False)
    speaking_rate: Mapped[float] = mapped_column(Float, nullable=False)
    pause_count: Mapped[int] = mapped_column(Integer, nullable=False)
    repetitions: Mapped[list[Any]] = mapped_column(JSONB, nullable=False)
    filler_words: Mapped[list[Any]] = mapped_column(JSONB, nullable=False)
    strengths: Mapped[list[Any]] = mapped_column(JSONB, nullable=False)
    recommendations: Mapped[list[Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    session: Mapped["SpeechSession"] = relationship(back_populates="analysis")
