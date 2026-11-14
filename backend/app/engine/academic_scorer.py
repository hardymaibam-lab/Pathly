"""Academic Compatibility and CGPA Fairness Scorer.
Pure Python, zero framework dependencies.
"""

from typing import Tuple
from app.engine.types import CareerRole
from app.engine.feature_extractor import NormalizedStudentFeatures


def calculate_cgpa_fairness_score(
    normalized_cgpa: float,
    min_required_cgpa: float = 0.60,
) -> float:
    """Calculate CGPA score with a fairness curve.

    Prevents harsh binary cliffs for students close to the cutoff,
    while rewarding consistent academic excellence.
    """
    if normalized_cgpa is None or normalized_cgpa <= 0:
        return 70.0  # Neutral baseline if grade not reported

    min_req = max(0.1, min(0.9, min_required_cgpa if min_required_cgpa else 0.60))

    if normalized_cgpa >= min_req:
        # Above or meets cutoff: range [80.0, 100.0]
        extra_ratio = (normalized_cgpa - min_req) / (1.0 - min_req) if (1.0 - min_req) > 0 else 1.0
        score = 80.0 + (20.0 * min(1.0, max(0.0, extra_ratio)))
    else:
        # Below cutoff: soft polynomial curve preventing absolute 0 penalty
        ratio = normalized_cgpa / min_req
        score = 80.0 * (ratio ** 1.5)

    return round(max(0.0, min(100.0, score)), 2)


def evaluate_degree_match(
    student_degree: str,
    student_major: str,
    career: CareerRole,
) -> Tuple[float, str]:
    """Score how well student's degree and major align with career requirements."""
    if not career.eligible_degrees and not career.preferred_degrees:
        return 85.0, "Open to all academic backgrounds."

    deg_combined = f"{student_degree} {student_major}".strip().lower()

    if not deg_combined:
        return 70.0, "Academic major details not specified; using baseline score."

    # Check preferred degrees (highest match)
    for pref in career.preferred_degrees:
        p_lower = pref.lower()
        if p_lower in deg_combined or any(part in deg_combined for part in p_lower.split()):
            return 100.0, f"Degree directly aligns with preferred qualification: {pref}."

    # Check eligible degrees (qualified match)
    for elig in career.eligible_degrees:
        e_lower = elig.lower()
        if e_lower in deg_combined or any(part in deg_combined for part in e_lower.split()):
            return 85.0, f"Degree qualifies under eligible backgrounds: {elig}."

    # General STEM match for technical roles
    stem_keywords = ["computer", "data", "software", "engineering", "information", "technology", "math", "statistics", "science"]
    if any(k in deg_combined for k in stem_keywords):
        return 75.0, "Degree is in a related STEM discipline."

    return 60.0, "Non-traditional academic background for this role."


def evaluate_academic_compatibility(
    features: NormalizedStudentFeatures,
    career: CareerRole,
) -> Tuple[float, float, float, str]:
    """Evaluate full academic compatibility including degree match and CGPA fairness.

    Returns:
        (total_academic_score, degree_score, cgpa_score, explanation)
    """
    degree_score, degree_notes = evaluate_degree_match(
        features.degree,
        features.field_of_study,
        career,
    )

    cgpa_score = calculate_cgpa_fairness_score(
        features.normalized_cgpa,
        career.min_cgpa_normalized,
    )

    # 50% degree fit + 50% CGPA fairness
    total_score = round((0.50 * degree_score) + (0.50 * cgpa_score), 2)
    explanation = f"{degree_notes} CGPA fairness rating: {cgpa_score}/100."

    return total_score, degree_score, cgpa_score, explanation
