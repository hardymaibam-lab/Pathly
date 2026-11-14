"""Roadmap Service."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException
from app.engine.roadmap import generate_learning_roadmap
from app.engine.types import ScoringWeights
from app.repositories.career_repository import CareerRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.services.profile_service import ProfileService
from app.services.recommendation_service import RecommendationService
from app.schemas.recommendation import LearningResourceRefSchema
from app.schemas.roadmap import (
    CareerRoadmapResponse,
    ProgressResponse,
    ProgressUpdateRequest,
    RoadmapMilestoneSchema,
    RoadmapStageSchema,
)


class RoadmapService:
    def __init__(self, db: Session):
        self.db = db
        self.career_repo = CareerRepository(db)
        self.rec_repo = RecommendationRepository(db)
        self.profile_service = ProfileService(db)
        self.rec_service = RecommendationService(db)

    def get_roadmap_for_career(self, user_id: str, career_id: str) -> CareerRoadmapResponse:
        db_career = self.career_repo.get_by_id(career_id)
        if not db_career:
            db_career = self.career_repo.get_by_slug(career_id)
        if not db_career:
            raise NotFoundException(f"Career '{career_id}' not found.")

        engine_career = self.career_repo.to_engine_career(db_career)
        engine_profile = self.profile_service.get_engine_profile(user_id)
        weights = self.rec_service.load_scoring_weights()

        # Compute current recommendation score for context
        recs = self.rec_service.generate_recommendations_for_user(user_id, save_run=False)
        target_rec = next((r for r in recs.recommendations if r.career_id == engine_career.id), None)

        current_score = target_rec.composite_score if target_rec else 50.0
        current_readiness = target_rec.readiness_level if target_rec else "DEVELOPING"

        # Import enum value for engine
        from app.engine.types import ReadinessLevel
        readiness_enum = ReadinessLevel(current_readiness)

        roadmap = generate_learning_roadmap(
            profile=engine_profile,
            career=engine_career,
            current_score=current_score,
            current_readiness=readiness_enum,
            weights=weights,
        )

        stage_schemas: List[RoadmapStageSchema] = []
        for s in roadmap.stages:
            milestone_schema = None
            if s.milestone:
                milestone_schema = RoadmapMilestoneSchema(
                    title=s.milestone.title,
                    description=s.milestone.description,
                    estimated_week=s.milestone.estimated_week,
                    associated_skills=s.milestone.associated_skills,
                )

            resources_schemas = [
                LearningResourceRefSchema(
                    title=r.title,
                    provider=r.provider,
                    url=r.url,
                    estimated_hours=r.estimated_hours,
                    difficulty_level=r.difficulty_level,
                    skill_name=r.skill_name,
                )
                for r in s.resources
            ]

            stage_schemas.append(
                RoadmapStageSchema(
                    stage_number=s.stage_number,
                    stage_name=s.stage_name,
                    focus_skills=s.focus_skills,
                    estimated_duration_weeks=s.estimated_duration_weeks,
                    weekly_hours_recommended=s.weekly_hours_recommended,
                    resources=resources_schemas,
                    milestone=milestone_schema,
                )
            )

        return CareerRoadmapResponse(
            career_id=roadmap.career_id,
            career_title=roadmap.career_title,
            total_duration_weeks=roadmap.total_duration_weeks,
            readiness_level=roadmap.readiness_level.value,
            current_score=roadmap.current_score,
            projected_score_after_roadmap=roadmap.projected_score_after_roadmap,
            stages=stage_schemas,
            capstone_project=roadmap.capstone_project,
        )

    def get_progress(self, user_id: str, career_id: str) -> ProgressResponse:
        progress = self.rec_repo.get_or_create_roadmap_progress(user_id, career_id)
        return ProgressResponse(
            career_id=career_id,
            completed_skills=progress.completed_skills or [],
            completed_milestones=progress.completed_milestones or [],
            notes=progress.notes,
            updated_at=progress.updated_at,
        )

    def update_progress(self, user_id: str, career_id: str, req: ProgressUpdateRequest) -> ProgressResponse:
        progress = self.rec_repo.update_roadmap_progress(
            user_id=user_id,
            career_id=career_id,
            completed_skills=req.completed_skills,
            completed_milestones=req.completed_milestones,
            notes=req.notes,
        )
        return ProgressResponse(
            career_id=career_id,
            completed_skills=progress.completed_skills or [],
            completed_milestones=progress.completed_milestones or [],
            notes=progress.notes,
            updated_at=progress.updated_at,
        )
