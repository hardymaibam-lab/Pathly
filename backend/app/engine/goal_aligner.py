"""Career Goal Aligner.
Pure Python, zero framework dependencies.
"""

from typing import Tuple
from app.engine.types import CareerRole
from app.engine.feature_extractor import NormalizedStudentFeatures


def evaluate_goal_alignment(
    features: NormalizedStudentFeatures,
    career: CareerRole,
) -> Tuple[float, str]:
    """Score alignment between student's career aspirations and the career role.

    Returns:
        (score_0_to_100, explanation_string)
    """
    target_roles = features.target_roles
    target_domains = features.target_domains

    if not target_roles and not target_domains:
        return 75.0, "No target roles specified; neutral goal alignment applied."

    career_title_lower = career.title.strip().lower()
    career_family_lower = career.family.strip().lower()

    # Exact or substring role title match
    for role in target_roles:
        if role in career_title_lower or career_title_lower in role:
            return 100.0, f"Direct match with target aspiration: '{role}'."

    # Career family or domain match
    for domain in target_domains:
        if domain in career_family_lower or career_family_lower in domain:
            return 85.0, f"High alignment with target industry domain: '{domain}'."

    # Sub-word matching
    title_words = set(career_title_lower.split())
    for role in target_roles:
        role_words = set(role.split())
        common = title_words.intersection(role_words)
        # Avoid common stop words
        common = {w for w in common if w not in {"engineer", "developer", "specialist", "analyst"}}
        if common:
            return 80.0, f"Partial alignment with target role concept ({', '.join(common)})."

    return 60.0, f"Role is outside primary declared goals ({career.family})."
