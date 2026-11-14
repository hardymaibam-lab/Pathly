"""Career Knowledge Base Schemas."""

from typing import Dict, List, Optional
from pydantic import BaseModel
from app.schemas.profile import RIASECSchema


class RequiredSkillSchema(BaseModel):
    skill_name: str
    required_level: int
    importance: str  # "core" or "elective"
    weight: float


class LearningResourceSchema(BaseModel):
    title: str
    provider: str
    url: str
    estimated_hours: int
    difficulty_level: str
    skill_name: str


class CareerListItemSchema(BaseModel):
    id: str
    title: str
    slug: str
    family: str
    description: str
    average_salary_range: Optional[str] = None
    min_cgpa_normalized: float


class CareerDetailSchema(CareerListItemSchema):
    eligible_degrees: List[str]
    preferred_degrees: List[str]
    riasec_profile: RIASECSchema
    required_skills: List[RequiredSkillSchema]
    learning_resources: List[LearningResourceSchema]
    prerequisites: Dict[str, List[str]]
    capstone_project_idea: Optional[str] = None
