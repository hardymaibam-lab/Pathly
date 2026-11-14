"""Recommendation Service.
Orchestrates data fetching and delegates calculation to the pure Python recommendation engine.
"""

import json
import os
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import NotFoundException
from app.engine.types import (
    CareerRecommendationResult,
    CareerRole,
    ScoringWeights,
    StudentAcademicInput,
    StudentGoalInput,
    StudentProfileData,
    StudentRIASECInput,
    StudentSkillInput,
)
from app.engine.aggregator import rank_career_recommendations
from app.engine.what_if import simulate_what_if_scenario
from app.repositories.career_repository import CareerRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.services.profile_service import ProfileService
from app.schemas.recommendation import (
    AdHocRecommendationRequest,
    CareerRecommendationItemSchema,
    ComponentScoresSchema,
    ExplanationSchema,
    LearningResourceRefSchema,
    RecommendationHistorySummarySchema,
    RecommendationRunResponse,
    SkillGapItemSchema,
    WhatIfDiffSchema,
    WhatIfRequest,
    WhatIfResponse,
)


class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.career_repo = CareerRepository(db)
        self.rec_repo = RecommendationRepository(db)
        self.profile_service = ProfileService(db)

    def load_scoring_weights(self, profile_name: str = "default_v1.1") -> ScoringWeights:
        """Load configurable scoring profile from JSON or fallback to defaults."""
        profile_path = settings.DEFAULT_SCORING_PROFILE_PATH
        if os.path.exists(profile_path):
            try:
                with open(profile_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    w = data.get("weights", {})
                    return ScoringWeights(
                        skill_weight=float(w.get("skill_weight", 0.40)),
                        riasec_weight=float(w.get("riasec_weight", 0.25)),
                        academic_weight=float(w.get("academic_weight", 0.20)),
                        goal_weight=float(w.get("goal_weight", 0.15)),
                        core_skill_ratio=float(w.get("core_skill_ratio", 0.75)),
                        elective_skill_ratio=float(w.get("elective_skill_ratio", 0.25)),
                    )
            except Exception:
                pass
        return ScoringWeights()

    def generate_recommendations_for_user(
        self,
        user_id: str,
        save_run: bool = True,
        profile_name: str = "default_v1.1",
    ) -> RecommendationRunResponse:
        """Fetch user profile, load knowledge base careers, and execute recommendation engine."""
        engine_profile = self.profile_service.get_engine_profile(user_id)
        engine_careers = self.career_repo.get_all_engine_careers()

        if not engine_careers:
            raise NotFoundException("Career knowledge base is empty. Please run seed_data first.")

        weights = self.load_scoring_weights(profile_name)
        results = rank_career_recommendations(engine_profile, engine_careers, weights)

        mapped_items = [self._map_engine_result_to_schema(r) for r in results]

        run_id = f"run-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        timestamp = datetime.now(timezone.utc)

        if save_run:
            top_match = mapped_items[0] if mapped_items else None
            # Store snapshots
            input_snapshot = {
                "skills": [{"name": s.name, "level": s.level} for s in engine_profile.skills],
                "academic": {
                    "degree": engine_profile.academic.degree if engine_profile.academic else "",
                    "cgpa": engine_profile.academic.cgpa if engine_profile.academic else 0.0,
                    "scale": engine_profile.academic.grading_scale if engine_profile.academic else 10.0,
                },
                "riasec": {
                    "r": engine_profile.riasec.realistic if engine_profile.riasec else 0.0,
                    "i": engine_profile.riasec.investigative if engine_profile.riasec else 0.0,
                    "a": engine_profile.riasec.artistic if engine_profile.riasec else 0.0,
                    "s": engine_profile.riasec.social if engine_profile.riasec else 0.0,
                    "e": engine_profile.riasec.enterprising if engine_profile.riasec else 0.0,
                    "c": engine_profile.riasec.conventional if engine_profile.riasec else 0.0,
                },
                "goals": engine_profile.goals.target_roles if engine_profile.goals else [],
            }
            results_snapshot = [item.model_dump() for item in mapped_items]

            saved = self.rec_repo.save_run(
                user_id=user_id,
                profile_id=engine_profile.id,
                scoring_profile_name=profile_name,
                input_snapshot=input_snapshot,
                results_snapshot=results_snapshot,
                top_career_id=top_match.career_id if top_match else None,
                top_career_title=top_match.career_title if top_match else None,
                top_score=top_match.composite_score if top_match else None,
                top_readiness=top_match.readiness_level if top_match else None,
            )
            run_id = saved.id
            timestamp = saved.run_timestamp

        return RecommendationRunResponse(
            run_id=run_id,
            run_timestamp=timestamp,
            scoring_profile_name=profile_name,
            recommendations=mapped_items,
        )

    def run_ad_hoc_recommendation(self, req: AdHocRecommendationRequest) -> RecommendationRunResponse:
        """Run recommendation engine with arbitrary input payload (useful for testing or guest flow)."""
        engine_careers = self.career_repo.get_all_engine_careers()
        if not engine_careers:
            raise NotFoundException("Career knowledge base is empty. Please run seed_data first.")

        academic = None
        if req.academic:
            academic = StudentAcademicInput(
                degree=req.academic.degree or "",
                field_of_study=req.academic.field_of_study or "",
                cgpa=req.academic.cgpa or 0.0,
                grading_scale=req.academic.grading_scale or 10.0,
                institution=req.academic.institution,
                graduation_year=req.academic.graduation_year,
            )

        skills = [
            StudentSkillInput(name=s.name, level=s.level, verified=s.verified)
            for s in req.skills
        ]

        riasec = None
        if req.riasec:
            riasec = StudentRIASECInput(
                realistic=req.riasec.realistic,
                investigative=req.riasec.investigative,
                artistic=req.riasec.artistic,
                social=req.riasec.social,
                enterprising=req.riasec.enterprising,
                conventional=req.riasec.conventional,
            )

        goals = None
        if req.goals:
            goals = StudentGoalInput(
                target_roles=req.goals.target_roles,
                target_domains=req.goals.target_domains,
                preferred_work_style=req.goals.preferred_work_style,
            )

        profile = StudentProfileData(
            id="ad-hoc",
            name="Guest Candidate",
            academic=academic,
            skills=skills,
            riasec=riasec,
            goals=goals,
        )

        weights = self.load_scoring_weights(req.scoring_profile_name or "default_v1.1")
        results = rank_career_recommendations(profile, engine_careers, weights)
        mapped = [self._map_engine_result_to_schema(r) for r in results]

        return RecommendationRunResponse(
            run_id=f"adhoc-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            run_timestamp=datetime.now(timezone.utc),
            scoring_profile_name=req.scoring_profile_name or "default_v1.1",
            recommendations=mapped,
        )

    def get_user_history(self, user_id: str) -> List[RecommendationHistorySummarySchema]:
        runs = self.rec_repo.get_runs_by_user(user_id)
        return [
            RecommendationHistorySummarySchema(
                run_id=r.id,
                run_timestamp=r.run_timestamp,
                top_career_title=r.top_career_title,
                top_score=r.top_score,
                top_readiness=r.top_readiness,
            )
            for r in runs
        ]

    def get_run_details(self, run_id: str) -> RecommendationRunResponse:
        run = self.rec_repo.get_run_by_id(run_id)
        if not run:
            raise NotFoundException(f"Recommendation run '{run_id}' not found.")

        # Reconstruct from results_snapshot
        items = [CareerRecommendationItemSchema(**item) for item in run.results_snapshot]
        return RecommendationRunResponse(
            run_id=run.id,
            run_timestamp=run.run_timestamp,
            scoring_profile_name=run.scoring_profile_name,
            recommendations=items,
        )

    def run_what_if_analysis(self, user_id: str, req: WhatIfRequest) -> WhatIfResponse:
        """Simulate profile changes and measure impact on scores, ranks, and readiness."""
        base_profile = self.profile_service.get_engine_profile(user_id)
        engine_careers = self.career_repo.get_all_engine_careers()

        sim_skills = None
        if req.simulated_skills:
            sim_skills = [
                StudentSkillInput(name=s.name, level=s.level, verified=s.verified)
                for s in req.simulated_skills
            ]

        sim_riasec = None
        if req.simulated_riasec:
            sim_riasec = StudentRIASECInput(
                realistic=req.simulated_riasec.realistic,
                investigative=req.simulated_riasec.investigative,
                artistic=req.simulated_riasec.artistic,
                social=req.simulated_riasec.social,
                enterprising=req.simulated_riasec.enterprising,
                conventional=req.simulated_riasec.conventional,
            )

        weights = self.load_scoring_weights()
        sim_result = simulate_what_if_scenario(
            base_profile=base_profile,
            careers=engine_careers,
            simulated_skills=sim_skills,
            simulated_cgpa=req.simulated_cgpa,
            simulated_goals=req.simulated_goals,
            simulated_riasec=sim_riasec,
            weights=weights,
        )

        diff_schemas = [
            WhatIfDiffSchema(
                career_id=d.career_id,
                career_title=d.career_title,
                previous_score=d.previous_score,
                new_score=d.new_score,
                score_delta=d.score_delta,
                previous_rank=d.previous_rank,
                new_rank=d.new_rank,
                rank_delta=d.rank_delta,
                previous_readiness=d.previous_readiness.value,
                new_readiness=d.new_readiness.value,
            )
            for d in sim_result.diffs
        ]

        sim_schemas = [self._map_engine_result_to_schema(r) for r in sim_result.simulated_recommendations]

        return WhatIfResponse(
            diffs=diff_schemas,
            simulated_recommendations=sim_schemas,
        )

    def _map_engine_result_to_schema(self, res: CareerRecommendationResult) -> CareerRecommendationItemSchema:
        return CareerRecommendationItemSchema(
            career_id=res.career_id,
            career_title=res.career_title,
            career_slug=res.career_slug,
            career_family=res.career_family,
            rank=res.rank,
            composite_score=res.composite_score,
            readiness_level=res.readiness_level.value,
            component_scores=ComponentScoresSchema(
                skill_score=res.component_scores.skill_score,
                riasec_score=res.component_scores.riasec_score,
                academic_score=res.component_scores.academic_score,
                goal_score=res.component_scores.goal_score,
            ),
            explanation=ExplanationSchema(
                summary=res.explanation.summary,
                strengths=res.explanation.strengths,
                critical_gaps=res.explanation.critical_gaps,
                riasec_alignment_notes=res.explanation.riasec_alignment_notes,
                academic_fit_notes=res.explanation.academic_fit_notes,
            ),
            skill_gaps=[
                SkillGapItemSchema(
                    skill_name=g.skill_name,
                    current_level=g.current_level,
                    required_level=g.required_level,
                    gap=g.gap,
                    importance=g.importance.value,
                    priority=g.priority.value,
                    potential_score_gain=g.potential_score_gain,
                    resources=[
                        LearningResourceRefSchema(
                            title=res_item.title,
                            provider=res_item.provider,
                            url=res_item.url,
                            estimated_hours=res_item.estimated_hours,
                            difficulty_level=res_item.difficulty_level,
                            skill_name=res_item.skill_name,
                        )
                        for res_item in g.resources
                    ],
                )
                for g in res.skill_gaps
            ],
            total_potential_gain=res.total_potential_gain,
        )
