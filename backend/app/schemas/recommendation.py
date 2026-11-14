"""Recommendation Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.profile import (
    AcademicSchema,
    GoalSchema,
    RIASECSchema,
    SkillItemSchema,
)


class ComponentScoresSchema(BaseModel):
    skill_score: float
    riasec_score: float
    academic_score: float
    goal_score: float


class ExplanationSchema(BaseModel):
    summary: str
    strengths: List[str]
    critical_gaps: List[str]
    riasec_alignment_notes: str
    academic_fit_notes: str


class LearningResourceRefSchema(BaseModel):
    title: str
    provider: str
    url: str
    estimated_hours: int
    difficulty_level: str
    skill_name: str


class SkillGapItemSchema(BaseModel):
    skill_name: str
    current_level: int
    required_level: int
    gap: int
    importance: str
    priority: str
    potential_score_gain: float
    resources: List[LearningResourceRefSchema] = Field(default_factory=list)


class CareerRecommendationItemSchema(BaseModel):
    career_id: str
    career_title: str
    career_slug: str
    career_family: str
    rank: int
    composite_score: float
    readiness_level: str
    component_scores: ComponentScoresSchema
    explanation: ExplanationSchema
    skill_gaps: List[SkillGapItemSchema]
    total_potential_gain: float


class RecommendationRunResponse(BaseModel):
    run_id: str
    run_timestamp: datetime
    scoring_profile_name: str
    recommendations: List[CareerRecommendationItemSchema]


class RecommendationHistorySummarySchema(BaseModel):
    run_id: str
    run_timestamp: datetime
    top_career_title: Optional[str]
    top_score: Optional[float]
    top_readiness: Optional[str]


class AdHocRecommendationRequest(BaseModel):
    academic: Optional[AcademicSchema] = None
    skills: List[SkillItemSchema] = Field(default_factory=list)
    riasec: Optional[RIASECSchema] = None
    goals: Optional[GoalSchema] = None
    scoring_profile_name: Optional[str] = "default_v1.1"


class WhatIfRequest(BaseModel):
    simulated_skills: Optional[List[SkillItemSchema]] = None
    simulated_cgpa: Optional[float] = None
    simulated_goals: Optional[List[str]] = None
    simulated_riasec: Optional[RIASECSchema] = None


class WhatIfDiffSchema(BaseModel):
    career_id: str
    career_title: str
    previous_score: float
    new_score: float
    score_delta: float
    previous_rank: int
    new_rank: int
    rank_delta: int
    previous_readiness: str
    new_readiness: str


class WhatIfResponse(BaseModel):
    diffs: List[WhatIfDiffSchema]
    simulated_recommendations: List[CareerRecommendationItemSchema]
