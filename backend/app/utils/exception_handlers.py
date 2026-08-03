from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.utils.api_errors import ErrorCode, code_for_status


def _normalize_content(detail: object, status_code: int) -> dict[str, str]:
    if isinstance(detail, dict) and "detail" in detail and "code" in detail:
        return {"detail": str(detail["detail"]), "code": str(detail["code"])}

    message = detail if isinstance(detail, str) else "Request failed."
    return {"detail": message, "code": code_for_status(status_code).value}


async def http_exception_handler(
    _request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=_normalize_content(exc.detail, exc.status_code),
    )


async def validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    messages = []
    for error in exc.errors():
        loc = ".".join(str(part) for part in error.get("loc", []) if part != "body")
        msg = error.get("msg", "Invalid value")
        messages.append(f"{loc}: {msg}" if loc else msg)

    return JSONResponse(
        status_code=422,
        content={
            "detail": "; ".join(messages) or "Validation failed.",
            "code": ErrorCode.VALIDATION_ERROR.value,
        },
    )
