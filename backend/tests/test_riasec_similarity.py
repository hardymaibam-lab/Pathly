"""Tests for RIASEC Psychometric Similarity."""

from app.engine.riasec_matcher import compute_cosine_similarity, evaluate_riasec_matching
from app.engine.types import CareerRole, StudentProfileData, StudentRIASECInput
from app.engine.feature_extractor import extract_student_features


def test_cosine_similarity_identical_vectors():
    """Identical vectors must return 1.0."""
    vec = [0.2, 0.8, 0.1, 0.4, 0.3, 0.5]
    sim = compute_cosine_similarity(vec, vec)
    assert abs(sim - 1.0) < 1e-4


def test_cosine_similarity_orthogonal_vectors():
    """Completely orthogonal vectors must return 0.0."""
    vec_a = [1.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    vec_b = [0.0, 1.0, 0.0, 0.0, 0.0, 0.0]
    sim = compute_cosine_similarity(vec_a, vec_b)
    assert abs(sim - 0.0) < 1e-4


def test_zero_vector_returns_zero_similarity():
    """All-zero vector comparison returns 0.0."""
    zero_vec = [0.0] * 6
    normal_vec = [0.5, 0.5, 0.0, 0.0, 0.0, 0.0]
    sim = compute_cosine_similarity(zero_vec, normal_vec)
    assert sim == 0.0


def test_riasec_matching_evaluator():
    """Evaluate full RIASEC matching integration with career."""
    profile = StudentProfileData(
        id="riasec-tester",
        riasec=StudentRIASECInput(realistic=0.1, investigative=0.9, artistic=0.2, social=0.1, enterprising=0.3, conventional=0.4),
    )
    features = extract_student_features(profile)

    career = CareerRole(
        id="c-data",
        title="Data Scientist",
        slug="data-scientist",
        family="Data",
        description="",
        required_skills=[],
        riasec_profile=StudentRIASECInput(realistic=0.1, investigative=0.9, artistic=0.2, social=0.1, enterprising=0.3, conventional=0.4),
    )

    score, notes = evaluate_riasec_matching(features, career)
    assert score == 100.0
    assert "Investigative" in notes
