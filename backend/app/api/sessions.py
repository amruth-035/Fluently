import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import AuthUser, get_current_user
from app.database.session import get_db
from app.schemas.speech_session import SpeechSessionResponse, SpeechSessionSummary
from app.services import session_service
from app.services.session_pipeline import process_session_upload

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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return SpeechSessionResponse.model_validate(result.session)


@router.get("", response_model=list[SpeechSessionSummary])
def list_sessions(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SpeechSessionSummary]:
    sessions = session_service.list_user_sessions(db, current_user.id)
    return [SpeechSessionSummary.model_validate(session) for session in sessions]


@router.get("/{session_id}", response_model=SpeechSessionResponse)
def get_session(
    session_id: uuid.UUID,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SpeechSessionResponse:
    session = session_service.get_user_session(db, current_user.id, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    return SpeechSessionResponse.model_validate(session)
