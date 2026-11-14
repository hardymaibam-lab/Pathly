"""Authentication Service."""

from sqlalchemy.orm import Session
from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import create_access_token, verify_password
from app.core.config import settings
from app.models.entities import User
from app.repositories.user_repository import UserRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.auth import TokenResponse, UserRegisterRequest


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.profile_repo = ProfileRepository(db)

    def register(self, req: UserRegisterRequest) -> User:
        existing = self.user_repo.get_by_email(req.email)
        if existing:
            raise ConflictException(f"User with email '{req.email}' already exists.")

        user = self.user_repo.create(
            email=req.email,
            password=req.password,
            full_name=req.full_name,
        )

        # Create blank profile automatically
        self.profile_repo.get_or_create(user.id)
        return user

    def authenticate(self, email: str, password: str) -> User:
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")
        if not user.is_active:
            raise UnauthorizedException("User account is inactive.")
        return user

    def create_token_response(self, user: User) -> TokenResponse:
        token = create_access_token(subject=user.id)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            user_id=user.id,
            email=user.email,
            full_name=user.full_name,
        )
