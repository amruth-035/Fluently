import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import AuthUser, get_current_user
from app.database.session import get_db
from app.schemas.session_audio import SessionAudioUrlResponse
from app.schemas.speech_session import SpeechSessionResponse, SpeechSessionSummary
from app.services import session_service
from app.services.session_pipeline import process_session_upload
from app.services.session_reprocess import reprocess_session
from app.services.storage_service import create_signed_audio_url
from app.utils.api_errors import ErrorCode, api_error

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SpeechSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    audio: UploadFile = File(...),
    duration: float = Form(...),
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SpeechSessionResponse:
    audio_bytes = await audio.read()

    try:
        result = process_session_upload(
            db,
            user_id=current_user.id,
            audio_bytes=audio_bytes,
            duration=duration,
            filename=audio.filename,
            content_type=audio.content_type,
        )
    except ValueError as exc:
        raise api_error(status.HTTP_400_BAD_REQUEST, str(exc), ErrorCode.VALIDATION_ERROR) from exc

    return SpeechSessionResponse.model_validate(result.session)


@router.get("", response_model=list[SpeechSessionSummary])
def list_sessions(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SpeechSessionSummary]:
    sessions = session_service.list_user_sessions(db, current_user.id)
    return [SpeechSessionSummary.from_session(session) for session in sessions]


@router.get("/{session_id}/audio-url", response_model=SessionAudioUrlResponse)
def get_session_audio_url(
    session_id: uuid.UUID,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionAudioUrlResponse:
    session = session_service.get_user_session(db, current_user.id, session_id)
    if session is None:
        raise api_error(status.HTTP_404_NOT_FOUND, "Session not found", ErrorCode.NOT_FOUND)

    if not session.audio_path:
        raise api_error(
            status.HTTP_404_NOT_FOUND,
            "Audio not available for this session.",
            ErrorCode.NOT_FOUND,
        )

    try:
        url = create_signed_audio_url(session.audio_path)
    except (RuntimeError, ValueError) as exc:
        raise api_error(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            str(exc),
            ErrorCode.STORAGE_ERROR,
        ) from exc

    return SessionAudioUrlResponse(url=url)


@router.post("/{session_id}/reprocess", response_model=SpeechSessionResponse)
def reprocess_failed_session(
    session_id: uuid.UUID,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SpeechSessionResponse:
    session = session_service.get_user_session(db, current_user.id, session_id)
    if session is None:
        raise api_error(status.HTTP_404_NOT_FOUND, "Session not found", ErrorCode.NOT_FOUND)

    try:
        result = reprocess_session(db, session)
    except ValueError as exc:
        raise api_error(status.HTTP_400_BAD_REQUEST, str(exc), ErrorCode.VALIDATION_ERROR) from exc

    return SpeechSessionResponse.model_validate(result.session)


@router.get("/{session_id}", response_model=SpeechSessionResponse)
def get_session(
    session_id: uuid.UUID,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SpeechSessionResponse:
    session = session_service.get_user_session(db, current_user.id, session_id)
    if session is None:
        raise api_error(status.HTTP_404_NOT_FOUND, "Session not found", ErrorCode.NOT_FOUND)

    return SpeechSessionResponse.model_validate(session)
