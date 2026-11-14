"""Career Recommendation Endpoints."""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.entities import User
from app.schemas.common import APIResponse
from app.schemas.recommendation import (
    AdHocRecommendationRequest,
    RecommendationHistorySummarySchema,
    RecommendationRunResponse,
    WhatIfRequest,
    WhatIfResponse,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine"])


@router.post(
    "",
    response_model=APIResponse[RecommendationRunResponse],
    summary="Generate ranked career path recommendations for the authenticated user",
)
def generate_recommendations(
    scoring_profile: str = Query("default_v1.1", description="Scoring profile configuration name"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RecommendationService(db)
    result = service.generate_recommendations_for_user(
        user_id=current_user.id,
        save_run=True,
        profile_name=scoring_profile,
    )
    return APIResponse(
        success=True,
        data=result,
        message=f"Generated {len(result.recommendations)} ranked career recommendations.",
    )


@router.post(
    "/ad-hoc",
    response_model=APIResponse[RecommendationRunResponse],
    summary="Ad-hoc career recommendations without persisting user profile",
)
def run_adhoc_recommendation(
    req: AdHocRecommendationRequest,
    db: Session = Depends(get_db),
):
    service = RecommendationService(db)
    result = service.run_ad_hoc_recommendation(req)
    return APIResponse(
        success=True,
        data=result,
        message=f"Ad-hoc run completed with {len(result.recommendations)} career evaluations.",
    )


@router.get(
    "/history",
    response_model=APIResponse[List[RecommendationHistorySummarySchema]],
    summary="Get user's past recommendation run history",
)
def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RecommendationService(db)
    history = service.get_user_history(current_user.id)
    return APIResponse(
        success=True,
        data=history,
        message=f"Retrieved {len(history)} past recommendation runs.",
    )


@router.get(
    "/runs/{run_id}",
    response_model=APIResponse[RecommendationRunResponse],
    summary="Get complete audit details and snapshots for a past recommendation run",
)
def get_run_details(
    run_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RecommendationService(db)
    run = service.get_run_details(run_id)
    return APIResponse(
        success=True,
        data=run,
        message="Recommendation run details retrieved.",
    )


@router.post(
    "/what-if",
    response_model=APIResponse[WhatIfResponse],
    summary="Run what-if scenario simulating score, rank, and readiness improvements",
)
def simulate_what_if(
    req: WhatIfRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RecommendationService(db)
    result = service.run_what_if_analysis(current_user.id, req)
    return APIResponse(
        success=True,
        data=result,
        message="What-If simulation completed successfully.",
    )
