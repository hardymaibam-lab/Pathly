"""User Repository."""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.entities import User
from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.strip().lower()).first()

    def create(self, email: str, password: str, full_name: str, is_superuser: bool = False) -> User:
        user = User(
            email=email.strip().lower(),
            hashed_password=get_password_hash(password),
            full_name=full_name.strip(),
            is_active=True,
            is_superuser=is_superuser,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
