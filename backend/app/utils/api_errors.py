from enum import StrEnum

from fastapi import HTTPException, status


class ErrorCode(StrEnum):
    VALIDATION_ERROR = "validation_error"
    NOT_FOUND = "not_found"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    PIPELINE_FAILED = "pipeline_failed"
    STORAGE_ERROR = "storage_error"
    AI_ERROR = "ai_error"
    INTERNAL_ERROR = "internal_error"


def api_error(status_code: int, detail: str, code: ErrorCode) -> HTTPException:
    """Raise a consistent API error payload: {detail, code}."""
    return HTTPException(
        status_code=status_code,
        detail={"detail": detail, "code": code.value},
    )


def code_for_status(status_code: int) -> ErrorCode:
    if status_code == status.HTTP_401_UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED
    if status_code == status.HTTP_404_NOT_FOUND:
        return ErrorCode.NOT_FOUND
    if status_code == status.HTTP_400_BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR
    return ErrorCode.INTERNAL_ERROR
