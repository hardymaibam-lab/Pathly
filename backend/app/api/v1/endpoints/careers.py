"""Career Knowledge Base Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.career import CareerDetailSchema, CareerListItemSchema
from app.schemas.common import APIResponse
from app.services.career_service import CareerService

router = APIRouter(prefix="/careers", tags=["Career Knowledge Base"])


@router.get(
    "",
    response_model=APIResponse[List[CareerListItemSchema]],
    summary="List all career roles in knowledge base",
)
def list_careers(
    family: Optional[str] = Query(None, description="Filter careers by family (e.g. 'Data & AI')"),
    db: Session = Depends(get_db),
):
    career_service = CareerService(db)
    careers = career_service.list_careers(family=family)
    return APIResponse(
        success=True,
        data=careers,
        message=f"Found {len(careers)} career roles.",
    )


@router.get(
    "/families",
    response_model=APIResponse[List[str]],
    summary="List distinct career families / categories",
)
def get_career_families(
    db: Session = Depends(get_db),
):
    career_service = CareerService(db)
    families = career_service.get_career_families()
    return APIResponse(
        success=True,
        data=families,
        message=f"Found {len(families)} distinct career families.",
    )


@router.get(
    "/{identifier}",
    response_model=APIResponse[CareerDetailSchema],
    summary="Get detailed information for a specific career role (by id or slug)",
)
def get_career_detail(
    identifier: str,
    db: Session = Depends(get_db),
):
    career_service = CareerService(db)
    career = career_service.get_career_by_id_or_slug(identifier)
    return APIResponse(
        success=True,
        data=career,
        message="Career role details retrieved.",
    )
