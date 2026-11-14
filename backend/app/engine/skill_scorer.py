"""Skill Compatibility Scorer.
Pure Python, zero framework dependencies.
"""

from typing import Dict, List, Tuple
from app.engine.types import (
    CareerRole,
    RequiredSkill,
    ScoringWeights,
    SkillImportance,
)
from app.engine.feature_extractor import NormalizedStudentFeatures


class SkillEvaluationResult:
    def __init__(
        self,
        skill_score: float,
        core_score: float,
        elective_score: float,
        matched_skills: List[Tuple[str, int, int]],     # (name, student_level, req_level)
        partial_skills: List[Tuple[str, int, int]],     # (name, student_level, req_level)
        missing_skills: List[Tuple[str, int, SkillImportance]],  # (name, req_level, importance)
    ):
        self.skill_score = skill_score
        self.core_score = core_score
        self.elective_score = elective_score
        self.matched_skills = matched_skills
        self.partial_skills = partial_skills
        self.missing_skills = missing_skills


def evaluate_skill_compatibility(
    features: NormalizedStudentFeatures,
    career: CareerRole,
    weights: ScoringWeights = ScoringWeights(),
) -> SkillEvaluationResult:
    """Calculate skill compatibility score between student and career."""
    if not career.required_skills:
        return SkillEvaluationResult(
            skill_score=100.0,
            core_score=100.0,
            elective_score=100.0,
            matched_skills=[],
            partial_skills=[],
            missing_skills=[],
        )

    student_skills = features.skills

    core_weighted_sum = 0.0
    core_total_weight = 0.0
    elective_weighted_sum = 0.0
    elective_total_weight = 0.0

    matched: List[Tuple[str, int, int]] = []
    partial: List[Tuple[str, int, int]] = []
    missing: List[Tuple[str, int, SkillImportance]] = []

    for req in career.required_skills:
        skill_name_lower = req.skill_name.strip().lower()
        req_level = max(1, min(5, req.required_level))
        skill_weight = float(req.weight if req.weight > 0 else 1.0)
        stud_level = student_skills.get(skill_name_lower, 0)

        if stud_level >= req_level:
            fulfillment = 1.0
            matched.append((req.skill_name, stud_level, req_level))
        elif stud_level > 0:
            fulfillment = stud_level / req_level
            partial.append((req.skill_name, stud_level, req_level))
        else:
            fulfillment = 0.0
            missing.append((req.skill_name, req_level, req.importance))

        if req.importance == SkillImportance.CORE:
            core_weighted_sum += fulfillment * skill_weight
            core_total_weight += skill_weight
        else:
            elective_weighted_sum += fulfillment * skill_weight
            elective_total_weight += skill_weight

    core_ratio = weights.core_skill_ratio
    elective_ratio = weights.elective_skill_ratio

    core_score = (core_weighted_sum / core_total_weight) if core_total_weight > 0 else 1.0

    if elective_total_weight > 0:
        elective_score = elective_weighted_sum / elective_total_weight
        final_skill_ratio = (core_ratio * core_score) + (elective_ratio * elective_score)
    else:
        # If no elective skills specified, core skills determine 100% of score
        elective_score = core_score
        final_skill_ratio = core_score

    skill_score_100 = round(final_skill_ratio * 100.0, 2)

    return SkillEvaluationResult(
        skill_score=max(0.0, min(100.0, skill_score_100)),
        core_score=round(core_score * 100.0, 2),
        elective_score=round(elective_score * 100.0, 2),
        matched_skills=matched,
        partial_skills=partial,
        missing_skills=missing,
    )
