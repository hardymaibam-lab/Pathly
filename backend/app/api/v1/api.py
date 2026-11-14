"""API v1 Router Aggregator."""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    careers,
    llm,
    profiles,
    recommendations,
    roadmaps,
    skill_gaps,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(profiles.router)
api_router.include_router(careers.router)
api_router.include_router(recommendations.router)
api_router.include_router(skill_gaps.router)
api_router.include_router(roadmaps.router)
api_router.include_router(llm.router)
