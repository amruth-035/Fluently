import uuid

from sqlalchemy.orm import Session

from app.models.user import User


def upsert_user(db: Session, user_id: uuid.UUID, email: str) -> User:
    """Create the user row on first login, or update email if it changed."""
    user = db.get(User, user_id)

    if user is None:
        user = User(id=user_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    if user.email != email:
        user.email = email
        db.commit()
        db.refresh(user)

    return user
