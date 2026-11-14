"""Student Profile Schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field


class AcademicSchema(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = Field(None, json_schema_extra={"example": "B.Tech"})
    field_of_study: Optional[str] = Field(None, json_schema_extra={"example": "Computer Science & Engineering"})
    cgpa: Optional[float] = Field(None, ge=0.0, le=100.0, json_schema_extra={"example": 8.5})
    grading_scale: float = Field(10.0, json_schema_extra={"example": 10.0})
    graduation_year: Optional[int] = Field(None, json_schema_extra={"example": 2026})


class SkillItemSchema(BaseModel):
    name: str = Field(..., min_length=1, json_schema_extra={"example": "python"})
    level: int = Field(..., ge=1, le=5, description="Proficiency level from 1 (Novice) to 5 (Expert)", json_schema_extra={"example": 4})
    verified: bool = False


class RIASECSchema(BaseModel):
    realistic: float = Field(0.0, ge=0.0, le=1.0)
    investigative: float = Field(0.0, ge=0.0, le=1.0)
    artistic: float = Field(0.0, ge=0.0, le=1.0)
    social: float = Field(0.0, ge=0.0, le=1.0)
    enterprising: float = Field(0.0, ge=0.0, le=1.0)
    conventional: float = Field(0.0, ge=0.0, le=1.0)


class GoalSchema(BaseModel):
    target_roles: List[str] = Field(default_factory=list, json_schema_extra={"example": ["Data Scientist", "Machine Learning Engineer"]})
    target_domains: List[str] = Field(default_factory=list, json_schema_extra={"example": ["Data & AI", "Healthcare Tech"]})
    preferred_work_style: Optional[str] = Field("Hybrid", json_schema_extra={"example": "Remote"})


class CertificationSchema(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "AWS Certified Cloud Practitioner"})
    issuing_organization: Optional[str] = Field(None, json_schema_extra={"example": "Amazon Web Services"})
    issue_year: Optional[int] = Field(None, json_schema_extra={"example": 2025})


class ProjectSchema(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Customer Churn Prediction App"})
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list, json_schema_extra={"example": ["Python", "Scikit-Learn", "FastAPI"]})
    url: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    academic: Optional[AcademicSchema] = None
    skills: Optional[List[SkillItemSchema]] = None
    riasec: Optional[RIASECSchema] = None
    goals: Optional[GoalSchema] = None
    certifications: Optional[List[CertificationSchema]] = None
    projects: Optional[List[ProjectSchema]] = None


class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    academic: AcademicSchema
    skills: List[SkillItemSchema]
    riasec: RIASECSchema
    goals: GoalSchema
    certifications: List[CertificationSchema]
    projects: List[ProjectSchema]
