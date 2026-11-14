"""AI Career Mentor Endpoints (Optional Module H)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.llm.client import llm_client
from app.models.entities import User
from app.schemas.common import APIResponse
from app.schemas.llm import MentorGuidanceRequest, MentorGuidanceResponse
from app.services.profile_service import ProfileService
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/mentor", tags=["AI Career Mentor (LLM)"])


@router.post(
    "/guidance",
    response_model=APIResponse[MentorGuidanceResponse],
    summary="Generate personalized AI career coach guidance and interview preparation tips",
)
def get_mentor_guidance(
    req: MentorGuidanceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec_service = RecommendationService(db)
    profile_service = ProfileService(db)

    profile = profile_service.get_profile(current_user.id)
    recs = rec_service.generate_recommendations_for_user(current_user.id, save_run=False)

    if not recs.recommendations:
        raise NotFoundException("No recommendations available for guidance.")

    target_rec = None
    if req.career_id:
        target_rec = next((r for r in recs.recommendations if r.career_id == req.career_id), None)
        if not target_rec:
            raise NotFoundException(f"Career '{req.career_id}' not found in user recommendations.")
    else:
        target_rec = recs.recommendations[0]  # Top match

    guidance = llm_client.generate_mentor_guidance(
        candidate_name=current_user.full_name,
        recommendation=target_rec,
        academic_degree=profile.academic.degree if profile.academic else None,
        user_question=req.specific_question,
    )

    return APIResponse(
        success=True,
        data=guidance,
        message="AI career mentor guidance generated.",
    )
