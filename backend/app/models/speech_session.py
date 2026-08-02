import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.analysis_result import AnalysisResult
    from app.models.practice_lesson import PracticeLesson
    from app.models.user import User


class SpeechSession(Base):
    __tablename__ = "speech_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_path: Mapped[str] = mapped_column(String(512), nullable=False)
    duration: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="speech_sessions")
    analysis: Mapped["AnalysisResult | None"] = relationship(
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan",
    )
    lesson: Mapped["PracticeLesson | None"] = relationship(
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan",
    )
