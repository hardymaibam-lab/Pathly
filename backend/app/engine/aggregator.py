"""Recommendation Aggregator and Ranker.
Pure Python, zero framework dependencies.
"""

from typing import List, Optional
from app.engine.types import (
    CareerRecommendationResult,
    CareerRole,
    ComponentScores,
    ScoringWeights,
    StudentProfileData,
)
from app.engine.feature_extractor import extract_student_features
from app.engine.skill_scorer import evaluate_skill_compatibility
from app.engine.riasec_matcher import evaluate_riasec_matching
from app.engine.academic_scorer import evaluate_academic_compatibility
from app.engine.goal_aligner import evaluate_goal_alignment
from app.engine.readiness import classify_readiness
from app.engine.skill_gaps import analyze_skill_gaps
from app.engine.explainability import generate_explanation


def calculate_career_recommendation(
    profile: StudentProfileData,
    career: CareerRole,
    weights: ScoringWeights = ScoringWeights(),
) -> CareerRecommendationResult:
    """Compute recommendation metrics for a single career role."""
    features = extract_student_features(profile)

    # 1. Skill Compatibility
    skill_eval = evaluate_skill_compatibility(features, career, weights)

    # 2. RIASEC Interest Matching
    riasec_score, riasec_notes = evaluate_riasec_matching(features, career)

    # 3. Academic Compatibility
    academic_score, deg_score, cgpa_score, acad_notes = evaluate_academic_compatibility(features, career)

    # 4. Career Goal Alignment
    goal_score, goal_notes = evaluate_goal_alignment(features, career)

    # 5. Score Aggregation
    composite = (
        (weights.skill_weight * skill_eval.skill_score)
        + (weights.riasec_weight * riasec_score)
        + (weights.academic_weight * academic_score)
        + (weights.goal_weight * goal_score)
    )
    composite_score = round(max(0.0, min(100.0, composite)), 2)

    # 6. Readiness Classification
    readiness = classify_readiness(composite_score)

    # 7. Skill Gaps Analysis
    gaps = analyze_skill_gaps(features, career, weights)
    total_gain = round(sum(g.potential_score_gain for g in gaps), 2)

    component_scores = ComponentScores(
        skill_score=skill_eval.skill_score,
        riasec_score=riasec_score,
        academic_score=academic_score,
        goal_score=goal_score,
    )

    # Temporary rank 0; will be set after sorting
    explanation = generate_explanation(
        career=career,
        rank=0,
        composite_score=composite_score,
        readiness=readiness,
        component_scores=component_scores,
        skill_eval=skill_eval,
        riasec_notes=riasec_notes,
        academic_notes=acad_notes,
        skill_gaps=gaps,
    )

    return CareerRecommendationResult(
        career_id=career.id,
        career_title=career.title,
        career_slug=career.slug,
        career_family=career.family,
        rank=0,
        composite_score=composite_score,
        readiness_level=readiness,
        component_scores=component_scores,
        explanation=explanation,
        skill_gaps=gaps,
        total_potential_gain=total_gain,
    )


def rank_career_recommendations(
    profile: StudentProfileData,
    careers: List[CareerRole],
    weights: ScoringWeights = ScoringWeights(),
    top_n: Optional[int] = None,
) -> List[CareerRecommendationResult]:
    """Score and rank all careers for a given student profile."""
    results: List[CareerRecommendationResult] = []

    for career in careers:
        rec = calculate_career_recommendation(profile, career, weights)
        results.append(rec)

    # Sort descending by composite score; tie-breaker: skill score
    results.sort(
        key=lambda r: (r.composite_score, r.component_scores.skill_score),
        reverse=True,
    )

    # Update ranks and explanations with actual assigned rank
    for idx, rec in enumerate(results, start=1):
        rec.rank = idx
        # Update summary in explanation with actual assigned rank
        rec.explanation.summary = (
            f"{rec.career_title} is ranked #{rec.rank} with a composite score of {rec.composite_score}%. "
            f"Your current readiness is classified as {rec.readiness_level.value}."
        )

    if top_n is not None and top_n > 0:
        return results[:top_n]

    return results
