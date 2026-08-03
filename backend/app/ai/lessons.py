"""GPT-4o lesson generation: personalized practice exercises from analysis output."""

import json
import logging

from app.ai.json_utils import call_with_json_retry
from app.ai.schemas import AnalysisOutput, LessonOutput
from app.ai.transcription import get_openai_client

logger = logging.getLogger(__name__)

LESSON_SYSTEM_PROMPT = """You are a supportive speech coach creating one practice lesson.
Return ONLY valid JSON with no markdown, no code fences, and no extra keys.

Required shape:
{
  "difficulty": string,
  "estimated_time": string,
  "objective": string,
  "exercises": {
    "word_drills": [string],
    "phrase_drills": [string],
    "sentence_drills": [string],
    "paragraph": string
  },
  "coaching_tips": [string]
}

Base the lesson ONLY on the provided analysis for this single session."""


def generate_lesson(analysis: AnalysisOutput) -> LessonOutput:
    """Generate a practice lesson from the current session's analysis."""
    analysis_json = json.dumps(analysis.model_dump(), indent=2)

    def fetch() -> str:
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": LESSON_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Session analysis:\n{analysis_json}\n\nGenerate the lesson JSON.",
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty lesson response from OpenAI")
        return content

    logger.info("Generating practice lesson")
    result = call_with_json_retry(fetch, LessonOutput, retries=1)
    logger.info("Lesson generated (difficulty=%s)", result.difficulty)
    return result
