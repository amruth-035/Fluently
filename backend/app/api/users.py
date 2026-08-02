from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import AuthUser, get_current_user
from app.database.session import get_db
from app.schemas.user import UserResponse
from app.services.user_service import upsert_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    user = upsert_user(db, current_user.id, current_user.email)
    return UserResponse.model_validate(user)
