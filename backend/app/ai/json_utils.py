import json
import logging
from collections.abc import Callable
from typing import TypeVar

from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


def parse_structured_json(content: str, schema: type[T]) -> T:
    """Parse a JSON string and validate it against a Pydantic schema."""
    data = json.loads(content)
    return schema.model_validate(data)


def call_with_json_retry(
    fetch_content: Callable[[], str],
    schema: type[T],
    *,
    retries: int = 1,
) -> T:
    """Call an AI function and validate JSON, retrying once on parse/validation errors."""
    last_error: Exception | None = None

    for attempt in range(retries + 1):
        try:
            content = fetch_content()
            return parse_structured_json(content, schema)
        except (json.JSONDecodeError, ValidationError, ValueError) as exc:
            last_error = exc
            logger.warning("Structured JSON parse failed (attempt %s): %s", attempt + 1, exc)

    raise ValueError("AI returned invalid JSON after retries") from last_error
