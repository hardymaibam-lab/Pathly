"""Recommendation History & Roadmap Progress Repository."""

from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.entities import RecommendationRun, RoadmapProgress


class RecommendationRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_run(
        self,
        user_id: str,
        profile_id: str,
        scoring_profile_name: str,
        input_snapshot: Dict[str, Any],
        results_snapshot: List[Dict[str, Any]],
        top_career_id: Optional[str] = None,
        top_career_title: Optional[str] = None,
        top_score: Optional[float] = None,
        top_readiness: Optional[str] = None,
    ) -> RecommendationRun:
        run = RecommendationRun(
            user_id=user_id,
            profile_id=profile_id,
            scoring_profile_name=scoring_profile_name,
            input_snapshot=input_snapshot,
            results_snapshot=results_snapshot,
            top_career_id=top_career_id,
            top_career_title=top_career_title,
            top_score=top_score,
            top_readiness=top_readiness,
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def get_runs_by_user(self, user_id: str, limit: int = 10) -> List[RecommendationRun]:
        return (
            self.db.query(RecommendationRun)
            .filter(RecommendationRun.user_id == user_id)
            .order_by(RecommendationRun.run_timestamp.desc())
            .limit(limit)
            .all()
        )

    def get_run_by_id(self, run_id: str) -> Optional[RecommendationRun]:
        return self.db.query(RecommendationRun).filter(RecommendationRun.id == run_id).first()

    def get_or_create_roadmap_progress(self, user_id: str, career_id: str) -> RoadmapProgress:
        progress = (
            self.db.query(RoadmapProgress)
            .filter(RoadmapProgress.user_id == user_id, RoadmapProgress.career_id == career_id)
            .first()
        )
        if not progress:
            progress = RoadmapProgress(
                user_id=user_id,
                career_id=career_id,
                completed_skills=[],
                completed_milestones=[],
            )
            self.db.add(progress)
            self.db.commit()
            self.db.refresh(progress)
        return progress

    def update_roadmap_progress(
        self,
        user_id: str,
        career_id: str,
        completed_skills: Optional[List[str]] = None,
        completed_milestones: Optional[List[str]] = None,
        notes: Optional[str] = None,
    ) -> RoadmapProgress:
        progress = self.get_or_create_roadmap_progress(user_id, career_id)
        if completed_skills is not None:
            progress.completed_skills = completed_skills
        if completed_milestones is not None:
            progress.completed_milestones = completed_milestones
        if notes is not None:
            progress.notes = notes
        self.db.commit()
        self.db.refresh(progress)
        return progress
