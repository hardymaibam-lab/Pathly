"""Explainability Generator for Recommendations.
Pure Python, zero framework dependencies.
"""

from typing import List
from app.engine.types import (
    CareerExplanation,
    CareerRole,
    ComponentScores,
    ReadinessLevel,
    SkillGapItem,
)
from app.engine.skill_scorer import SkillEvaluationResult


def generate_explanation(
    career: CareerRole,
    rank: int,
    composite_score: float,
    readiness: ReadinessLevel,
    component_scores: ComponentScores,
    skill_eval: SkillEvaluationResult,
    riasec_notes: str,
    academic_notes: str,
    skill_gaps: List[SkillGapItem],
) -> CareerExplanation:
    """Generate structured explainability for a career recommendation."""
    # Summary
    summary = (
        f"{career.title} is ranked #{rank} with a composite score of {composite_score}%. "
        f"Your current readiness is classified as {readiness.value}."
    )

    # Strengths
    strengths: List[str] = []
    if skill_eval.matched_skills:
        top_matched = [name for name, _, _ in skill_eval.matched_skills[:4]]
        strengths.append(f"Full proficiency match in key skills: {', '.join(top_matched)}.")

    if skill_eval.partial_skills:
        top_partial = [name for name, s_lvl, r_lvl in skill_eval.partial_skills[:3]]
        strengths.append(f"Foundational knowledge present in: {', '.join(top_partial)}.")

    if component_scores.academic_score >= 80.0:
        strengths.append("Academic degree and coursework strongly qualify for this role.")

    if component_scores.riasec_score >= 80.0:
        strengths.append("High psychometric interest synergy with day-to-day role activities.")

    if not strengths:
        strengths.append("Emerging profile with transferable skills for this career track.")

    # Critical gaps
    critical_gaps: List[str] = []
    high_priority_gaps = [g for g in skill_gaps if g.priority.value == "HIGH"]
    for gap in high_priority_gaps[:3]:
        critical_gaps.append(
            f"Needs {gap.skill_name} (Level {gap.required_level}) - currently at Level {gap.current_level} "
            f"(closing adds +{gap.potential_score_gain}% to overall match)."
        )

    if not critical_gaps and skill_gaps:
        for gap in skill_gaps[:2]:
            critical_gaps.append(
                f"Minor gap in {gap.skill_name} (Level {gap.required_level}) - adds +{gap.potential_score_gain}%."
            )
    elif not critical_gaps:
        critical_gaps.append("No critical skill gaps identified; profile fulfills core requirements.")

    return CareerExplanation(
        summary=summary,
        strengths=strengths,
        critical_gaps=critical_gaps,
        riasec_alignment_notes=riasec_notes,
        academic_fit_notes=academic_notes,
    )
