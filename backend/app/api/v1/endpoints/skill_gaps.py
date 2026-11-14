"""Skill Gap Analysis Endpoints."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.entities import User
from app.schemas.common import APIResponse
from app.schemas.recommendation import SkillGapItemSchema
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/skill-gaps", tags=["Skill Gap Analysis"])


@router.get(
    "/{career_id}",
    response_model=APIResponse[List[SkillGapItemSchema]],
    summary="Get prioritized skill gaps and potential score improvements for a target career",
)
def get_career_skill_gaps(
    career_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RecommendationService(db)
    recs = service.generate_recommendations_for_user(current_user.id, save_run=False)
    matched_career = next((r for r in recs.recommendations if r.career_id == career_id), None)

    if not matched_career:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(f"Career '{career_id}' not found.")

    return APIResponse(
        success=True,
        data=matched_career.skill_gaps,
        message=f"Identified {len(matched_career.skill_gaps)} skill gaps for '{matched_career.career_title}'.",
    )
