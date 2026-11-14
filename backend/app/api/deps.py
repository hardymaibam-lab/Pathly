"""API Route Dependencies."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException
from app.models.entities import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validate JWT token and return authenticated user."""
    if not token:
        raise UnauthorizedException("Authentication token required.")

    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Token payload missing user identifier.")

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException("User not found.")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive.")

    return user
