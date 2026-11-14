"""RIASEC Interest Matcher.
Pure Python, zero framework dependencies.
"""

import math
from typing import List, Optional, Tuple
from app.engine.types import CareerRole, StudentRIASECInput
from app.engine.feature_extractor import NormalizedStudentFeatures, normalize_riasec_vector


HEXAGON_ORDER = ["R", "I", "A", "S", "E", "C"]


def compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two numeric vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    cosine = dot_product / (norm_a * norm_b)
    # Clamp to [0.0, 1.0] since RIASEC traits are non-negative
    return max(0.0, min(1.0, cosine))


def evaluate_riasec_matching(
    features: NormalizedStudentFeatures,
    career: CareerRole,
) -> Tuple[float, str]:
    """Calculate RIASEC interest compatibility score and explanation.

    Returns:
        (score_0_to_100, explanation_string)
    """
    student_vec = features.riasec_vector
    career_vec = normalize_riasec_vector(career.riasec_profile)

    # Check if student or career vector is empty/all zero
    student_norm = sum(abs(x) for x in student_vec)
    career_norm = sum(abs(x) for x in career_vec)

    if student_norm == 0.0 or career_norm == 0.0:
        # Default neutral score when RIASEC data is not yet recorded
        return 70.0, "Interest profile not fully completed; assigned baseline alignment."

    cosine = compute_cosine_similarity(student_vec, career_vec)
    score_100 = round(cosine * 100.0, 2)

    # Identify primary traits
    trait_names = [
        "Realistic (Hands-on/Technical)",
        "Investigative (Analytical/Research)",
        "Artistic (Creative/Design)",
        "Social (Helping/Collaborative)",
        "Enterprising (Leadership/Persuasive)",
        "Conventional (Organized/Systematic)",
    ]

    top_student_idx = max(range(6), key=lambda i: student_vec[i])
    top_career_idx = max(range(6), key=lambda i: career_vec[i])

    student_trait = trait_names[top_student_idx].split()[0]
    career_trait = trait_names[top_career_idx].split()[0]

    if top_student_idx == top_career_idx:
        notes = f"Strong psychological fit: both emphasize {student_trait} traits."
    else:
        notes = f"Primary interest is {student_trait}; career emphasizes {career_trait}."

    return score_100, notes
