"""Student Profile Endpoints."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.entities import User
from app.schemas.common import APIResponse
from app.schemas.profile import (
    ProfileUpdateRequest,
    SkillItemSchema,
    StudentProfileResponse,
)
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Student Profile"])


@router.get(
    "",
    response_model=APIResponse[StudentProfileResponse],
    summary="Get current student's full profile",
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_service = ProfileService(db)
    profile = profile_service.get_profile(current_user.id)
    return APIResponse(
        success=True,
        data=profile,
        message="Student profile retrieved successfully.",
    )


@router.put(
    "",
    response_model=APIResponse[StudentProfileResponse],
    summary="Update current student's profile (academic, skills, RIASEC, goals, etc.)",
)
def update_my_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_service = ProfileService(db)
    updated = profile_service.update_profile(current_user.id, req)
    return APIResponse(
        success=True,
        data=updated,
        message="Student profile updated successfully.",
    )


@router.post(
    "/skills",
    response_model=APIResponse[StudentProfileResponse],
    summary="Batch update or sync skills",
)
def sync_skills(
    skills: List[SkillItemSchema],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_service = ProfileService(db)
    req = ProfileUpdateRequest(skills=skills)
    updated = profile_service.update_profile(current_user.id, req)
    return APIResponse(
        success=True,
        data=updated,
        message="Skills synchronized successfully.",
    )
