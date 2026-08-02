from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import AuthUser, get_current_user
from app.database.session import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import get_user_dashboard

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    return get_user_dashboard(db, current_user.id)
