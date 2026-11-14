"""Skill Gap Analysis Engine.
Pure Python, zero framework dependencies.
"""

from typing import Dict, List
from app.engine.types import (
    CareerRole,
    GapPriority,
    RequiredSkill,
    ScoringWeights,
    SkillGapItem,
    SkillImportance,
)
from app.engine.feature_extractor import NormalizedStudentFeatures


def analyze_skill_gaps(
    features: NormalizedStudentFeatures,
    career: CareerRole,
    weights: ScoringWeights = ScoringWeights(),
) -> List[SkillGapItem]:
    """Identify missing skills, quantify proficiency gaps, prioritize,

    and calculate potential score improvements.
    """
    student_skills = features.skills
    gaps: List[SkillGapItem] = []

    # Calculate total weights for core and elective to compute exact delta
    core_total_weight = sum(
        r.weight for r in career.required_skills if r.importance == SkillImportance.CORE
    ) or 1.0
    elective_total_weight = sum(
        r.weight for r in career.required_skills if r.importance == SkillImportance.ELECTIVE
    ) or 1.0

    # Index learning resources by skill_name (case-insensitive)
    resources_by_skill: Dict[str, list] = {}
    for res in career.learning_resources:
        key = res.skill_name.strip().lower()
        if key not in resources_by_skill:
            resources_by_skill[key] = []
        resources_by_skill[key].append(res)

    for req in career.required_skills:
        skill_name_lower = req.skill_name.strip().lower()
        curr_level = student_skills.get(skill_name_lower, 0)
        req_level = max(1, min(5, req.required_level))

        if curr_level < req_level:
            gap_size = req_level - curr_level
            fulfillment_delta = (req_level - curr_level) / req_level

            # Calculate potential composite score improvement
            if req.importance == SkillImportance.CORE:
                skill_weight_in_category = req.weight / core_total_weight
                category_ratio = weights.core_skill_ratio
            else:
                skill_weight_in_category = req.weight / elective_total_weight
                category_ratio = weights.elective_skill_ratio

            skill_score_delta = category_ratio * skill_weight_in_category * fulfillment_delta * 100.0
            composite_gain = round(weights.skill_weight * skill_score_delta, 2)

            # Assign Priority
            if req.importance == SkillImportance.CORE:
                if gap_size >= 2 or curr_level == 0:
                    priority = GapPriority.HIGH
                else:
                    priority = GapPriority.MEDIUM
            else:
                if gap_size >= 2:
                    priority = GapPriority.MEDIUM
                else:
                    priority = GapPriority.LOW

            matched_resources = resources_by_skill.get(skill_name_lower, [])

            gaps.append(
                SkillGapItem(
                    skill_name=req.skill_name,
                    current_level=curr_level,
                    required_level=req_level,
                    gap=gap_size,
                    importance=req.importance,
                    priority=priority,
                    potential_score_gain=composite_gain,
                    resources=matched_resources,
                )
            )

    # Sort gaps by priority (HIGH first), then by potential score gain descending
    priority_order = {GapPriority.HIGH: 0, GapPriority.MEDIUM: 1, GapPriority.LOW: 2}
    gaps.sort(key=lambda g: (priority_order[g.priority], -g.potential_score_gain))

    return gaps
