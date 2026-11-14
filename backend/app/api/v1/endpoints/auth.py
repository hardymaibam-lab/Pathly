"""Authentication Endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.entities import User
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.schemas.common import APIResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=APIResponse[TokenResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account",
)
def register(
    req: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    user = auth_service.register(req)
    token_resp = auth_service.create_token_response(user)
    return APIResponse(
        success=True,
        data=token_resp,
        message="Registration successful.",
    )


@router.post(
    "/login",
    response_model=APIResponse[TokenResponse],
    summary="Authenticate user and receive JWT access token",
)
def login(
    req: UserLoginRequest,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    user = auth_service.authenticate(req.email, req.password)
    token_resp = auth_service.create_token_response(user)
    return APIResponse(
        success=True,
        data=token_resp,
        message="Login successful.",
    )


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Get current authenticated user profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return APIResponse(
        success=True,
        data=UserResponse(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            is_active=current_user.is_active,
            is_superuser=current_user.is_superuser,
            created_at=current_user.created_at,
        ),
        message="Current user profile retrieved.",
    )
