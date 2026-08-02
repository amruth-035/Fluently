"""Pydantic schemas for structured AI outputs."""

from typing import Any

from pydantic import BaseModel, Field


class AnalysisOutput(BaseModel):
    fluency_score: float = Field(ge=0, le=100)
    speaking_rate: float = Field(ge=0)
    pause_count: int = Field(ge=0)
    repetitions: list[Any]
    filler_words: list[Any]
    strengths: list[Any]
    recommendations: list[Any]


class LessonExercises(BaseModel):
    word_drills: list[str]
    phrase_drills: list[str]
    sentence_drills: list[str]
    paragraph: str


class LessonOutput(BaseModel):
    difficulty: str
    estimated_time: str
    objective: str
    exercises: LessonExercises
    coaching_tips: list[str]
