"""Pure Python Data Types for Recommendation Engine.
This module has ZERO external framework dependencies (no FastAPI, no SQLAlchemy).
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Any


class ReadinessLevel(str, Enum):
    HIGH_READINESS = "HIGH_READINESS"            # Score >= 80%
    MODERATE_READINESS = "MODERATE_READINESS"    # Score 65% - 79%
    DEVELOPING = "DEVELOPING"                    # Score 50% - 64%
    EXPLORATORY = "EXPLORATORY"                  # Score < 50%


class SkillImportance(str, Enum):
    CORE = "core"
    ELECTIVE = "elective"


class GapPriority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass
class StudentSkillInput:
    name: str
    level: int  # 1 to 5
    verified: bool = False


@dataclass
class StudentAcademicInput:
    degree: str
    field_of_study: str
    cgpa: float
    grading_scale: float = 10.0  # 10.0, 4.0, or 100.0
    institution: Optional[str] = None
    graduation_year: Optional[int] = None


@dataclass
class StudentRIASECInput:
    realistic: float = 0.0
    investigative: float = 0.0
    artistic: float = 0.0
    social: float = 0.0
    enterprising: float = 0.0
    conventional: float = 0.0


@dataclass
class StudentGoalInput:
    target_roles: List[str] = field(default_factory=list)
    target_domains: List[str] = field(default_factory=list)
    preferred_work_style: Optional[str] = None  # Remote, Hybrid, Onsite


@dataclass
class StudentProfileData:
    id: Optional[str] = None
    name: Optional[str] = None
    academic: Optional[StudentAcademicInput] = None
    skills: List[StudentSkillInput] = field(default_factory=list)
    riasec: Optional[StudentRIASECInput] = None
    goals: Optional[StudentGoalInput] = None
    certifications: List[str] = field(default_factory=list)
    projects: List[str] = field(default_factory=list)


@dataclass
class RequiredSkill:
    skill_name: str
    required_level: int = 3  # 1 to 5
    importance: SkillImportance = SkillImportance.CORE
    weight: float = 1.0


@dataclass
class LearningResourceRef:
    title: str
    provider: str
    url: str
    estimated_hours: int
    difficulty_level: str  # Beginner, Intermediate, Advanced
    skill_name: str


@dataclass
class CareerRole:
    id: str
    title: str
    slug: str
    family: str  # e.g., "Data & AI", "Software Engineering", "Cloud & DevOps"
    description: str
    required_skills: List[RequiredSkill]
    eligible_degrees: List[str] = field(default_factory=list)
    preferred_degrees: List[str] = field(default_factory=list)
    min_cgpa_normalized: float = 0.60  # On 0.0 - 1.0 scale (e.g. 6.0/10 or 2.4/4)
    riasec_profile: Optional[StudentRIASECInput] = None
    learning_resources: List[LearningResourceRef] = field(default_factory=list)
    prerequisites: Dict[str, List[str]] = field(default_factory=dict)  # skill -> list of prerequisite skills
    capstone_project_idea: Optional[str] = None
    average_salary_range: Optional[str] = None


@dataclass
class ScoringWeights:
    skill_weight: float = 0.40
    riasec_weight: float = 0.25
    academic_weight: float = 0.20
    goal_weight: float = 0.15
    core_skill_ratio: float = 0.75
    elective_skill_ratio: float = 0.25


@dataclass
class SkillGapItem:
    skill_name: str
    current_level: int
    required_level: int
    gap: int
    importance: SkillImportance
    priority: GapPriority
    potential_score_gain: float
    resources: List[LearningResourceRef] = field(default_factory=list)


@dataclass
class ComponentScores:
    skill_score: float        # 0 - 100
    riasec_score: float        # 0 - 100
    academic_score: float     # 0 - 100
    goal_score: float         # 0 - 100


@dataclass
class CareerExplanation:
    summary: str
    strengths: List[str]
    critical_gaps: List[str]
    riasec_alignment_notes: str
    academic_fit_notes: str


@dataclass
class CareerRecommendationResult:
    career_id: str
    career_title: str
    career_slug: str
    career_family: str
    rank: int
    composite_score: float
    readiness_level: ReadinessLevel
    component_scores: ComponentScores
    explanation: CareerExplanation
    skill_gaps: List[SkillGapItem] = field(default_factory=list)
    total_potential_gain: float = 0.0


@dataclass
class RoadmapMilestone:
    title: str
    description: str
    estimated_week: int
    associated_skills: List[str]


@dataclass
class RoadmapStage:
    stage_number: int
    stage_name: str  # e.g. "Foundation", "Core Competencies", "Specialization & Capstone"
    focus_skills: List[str]
    estimated_duration_weeks: int
    weekly_hours_recommended: int
    resources: List[LearningResourceRef]
    milestone: Optional[RoadmapMilestone] = None


@dataclass
class CareerRoadmap:
    career_id: str
    career_title: str
    total_duration_weeks: int
    readiness_level: ReadinessLevel
    current_score: float
    projected_score_after_roadmap: float
    stages: List[RoadmapStage]
    capstone_project: Optional[str] = None


@dataclass
class WhatIfDiff:
    career_id: str
    career_title: str
    previous_score: float
    new_score: float
    score_delta: float
    previous_rank: int
    new_rank: int
    rank_delta: int
    previous_readiness: ReadinessLevel
    new_readiness: ReadinessLevel
