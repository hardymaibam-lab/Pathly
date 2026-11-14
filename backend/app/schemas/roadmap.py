"""Roadmap Schemas."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.recommendation import LearningResourceRefSchema


class RoadmapMilestoneSchema(BaseModel):
    title: str
    description: str
    estimated_week: int
    associated_skills: List[str]


class RoadmapStageSchema(BaseModel):
    stage_number: int
    stage_name: str
    focus_skills: List[str]
    estimated_duration_weeks: int
    weekly_hours_recommended: int
    resources: List[LearningResourceRefSchema]
    milestone: Optional[RoadmapMilestoneSchema] = None


class CareerRoadmapResponse(BaseModel):
    career_id: str
    career_title: str
    total_duration_weeks: int
    readiness_level: str
    current_score: float
    projected_score_after_roadmap: float
    stages: List[RoadmapStageSchema]
    capstone_project: Optional[str] = None


class ProgressUpdateRequest(BaseModel):
    completed_skills: Optional[List[str]] = None
    completed_milestones: Optional[List[str]] = None
    notes: Optional[str] = None


class ProgressResponse(BaseModel):
    career_id: str
    completed_skills: List[str]
    completed_milestones: List[str]
    notes: Optional[str] = None
    updated_at: datetime
