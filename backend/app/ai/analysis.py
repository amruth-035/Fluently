import json
import logging

from app.ai.json_utils import call_with_json_retry
from app.ai.schemas import AnalysisOutput
from app.ai.transcription import get_openai_client

logger = logging.getLogger(__name__)

ANALYSIS_SYSTEM_PROMPT = """You are a supportive speech coach analyzing transcripts for practice feedback.
Return ONLY valid JSON with no markdown, no code fences, and no extra keys.

Required shape:
{
  "fluency_score": number (0-100),
  "speaking_rate": number (words per minute),
  "pause_count": number (long pauses),
  "repetitions": [{"text": string, "note": string}],
  "filler_words": [{"word": string, "count": number}],
  "strengths": [string],
  "recommendations": [string]
}

Be encouraging and practical. This is a practice tool, not medical diagnosis."""


def analyze_transcript(transcript: str, duration_seconds: float) -> AnalysisOutput:
    """Run GPT analysis on a transcript and return validated structured output."""
    user_prompt = (
        f"Transcript:\n{transcript}\n\n"
        f"Recording duration (seconds): {duration_seconds:.1f}\n"
        "Analyze fluency patterns and return the JSON object."
    )

    def fetch() -> str:
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty analysis response from OpenAI")
        return content

    logger.info("Running speech analysis")
    result = call_with_json_retry(fetch, AnalysisOutput, retries=1)
    logger.info("Analysis complete (fluency_score=%s)", result.fluency_score)
    return result
