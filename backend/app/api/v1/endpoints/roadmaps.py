"""Learning Roadmap Endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.entities import User
from app.schemas.common import APIResponse
from app.schemas.roadmap import (
    CareerRoadmapResponse,
    ProgressResponse,
    ProgressUpdateRequest,
)
from app.services.roadmap_service import RoadmapService

router = APIRouter(prefix="/roadmaps", tags=["Learning Roadmap"])


@router.get(
    "/{career_id}",
    response_model=APIResponse[CareerRoadmapResponse],
    summary="Generate personalized, multi-stage learning roadmap for a target career",
)
def get_career_roadmap(
    career_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RoadmapService(db)
    roadmap = service.get_roadmap_for_career(current_user.id, career_id)
    return APIResponse(
        success=True,
        data=roadmap,
        message=f"Roadmap generated for '{roadmap.career_title}'.",
    )


@router.get(
    "/{career_id}/progress",
    response_model=APIResponse[ProgressResponse],
    summary="Get user's learning roadmap completion progress",
)
def get_roadmap_progress(
    career_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RoadmapService(db)
    progress = service.get_progress(current_user.id, career_id)
    return APIResponse(
        success=True,
        data=progress,
        message="Roadmap progress retrieved.",
    )


@router.put(
    "/{career_id}/progress",
    response_model=APIResponse[ProgressResponse],
    summary="Update completed skills and milestones for target career roadmap",
)
def update_roadmap_progress(
    career_id: str,
    req: ProgressUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RoadmapService(db)
    updated = service.update_progress(current_user.id, career_id, req)
    return APIResponse(
        success=True,
        data=updated,
        message="Roadmap progress updated.",
    )
