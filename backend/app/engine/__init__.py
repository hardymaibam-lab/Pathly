"""Pure Python Recommendation Engine.
According to Technical Specification v1.1.
Zero imports of FastAPI, SQLAlchemy, databases, or LLMs.
"""

from app.engine.types import (
    CareerExplanation,
    CareerRecommendationResult,
    CareerRoadmap,
    CareerRole,
    ComponentScores,
    GapPriority,
    LearningResourceRef,
    ReadinessLevel,
    RequiredSkill,
    RoadmapMilestone,
    RoadmapStage,
    ScoringWeights,
    SkillGapItem,
    SkillImportance,
    StudentAcademicInput,
    StudentGoalInput,
    StudentProfileData,
    StudentRIASECInput,
    StudentSkillInput,
    WhatIfDiff,
)
from app.engine.feature_extractor import extract_student_features, normalize_cgpa, normalize_riasec_vector
from app.engine.skill_scorer import evaluate_skill_compatibility
from app.engine.riasec_matcher import evaluate_riasec_matching, compute_cosine_similarity
from app.engine.academic_scorer import evaluate_academic_compatibility, calculate_cgpa_fairness_score
from app.engine.goal_aligner import evaluate_goal_alignment
from app.engine.readiness import classify_readiness, get_readiness_label
from app.engine.skill_gaps import analyze_skill_gaps
from app.engine.explainability import generate_explanation
from app.engine.aggregator import calculate_career_recommendation, rank_career_recommendations
from app.engine.roadmap import generate_learning_roadmap
from app.engine.what_if import simulate_what_if_scenario, WhatIfSimulationResult

__all__ = [
    "CareerExplanation",
    "CareerRecommendationResult",
    "CareerRoadmap",
    "CareerRole",
    "ComponentScores",
    "GapPriority",
    "LearningResourceRef",
    "ReadinessLevel",
    "RequiredSkill",
    "RoadmapMilestone",
    "RoadmapStage",
    "ScoringWeights",
    "SkillGapItem",
    "SkillImportance",
    "StudentAcademicInput",
    "StudentGoalInput",
    "StudentProfileData",
    "StudentRIASECInput",
    "StudentSkillInput",
    "WhatIfDiff",
    "WhatIfSimulationResult",
    "extract_student_features",
    "normalize_cgpa",
    "normalize_riasec_vector",
    "evaluate_skill_compatibility",
    "evaluate_riasec_matching",
    "compute_cosine_similarity",
    "evaluate_academic_compatibility",
    "calculate_cgpa_fairness_score",
    "evaluate_goal_alignment",
    "classify_readiness",
    "get_readiness_label",
    "analyze_skill_gaps",
    "generate_explanation",
    "calculate_career_recommendation",
    "rank_career_recommendations",
    "generate_learning_roadmap",
    "simulate_what_if_scenario",
]
