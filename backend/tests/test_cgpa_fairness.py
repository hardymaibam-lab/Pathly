"""Tests for CGPA Fairness Normalization and Scoring."""

from app.engine.feature_extractor import normalize_cgpa
from app.engine.academic_scorer import calculate_cgpa_fairness_score


def test_cgpa_scale_normalization():
    """Verify CGPA is correctly normalized across 10-point, 4-point, and percentage scales."""
    # 10.0 scale
    assert abs(normalize_cgpa(8.5, 10.0) - 0.85) < 1e-4
    assert abs(normalize_cgpa(7.0, 10.0) - 0.70) < 1e-4

    # 4.0 scale
    assert abs(normalize_cgpa(3.4, 4.0) - 0.85) < 1e-4
    assert abs(normalize_cgpa(4.0, 4.0) - 1.00) < 1e-4

    # 100 percentage scale
    assert abs(normalize_cgpa(85.0, 100.0) - 0.85) < 1e-4
    assert abs(normalize_cgpa(60.0, 100.0) - 0.60) < 1e-4


def test_cgpa_boundary_clamping():
    """CGPA normalization must clamp to [0.0, 1.0]."""
    assert normalize_cgpa(-1.0, 10.0) == 0.0
    assert normalize_cgpa(12.0, 10.0) == 1.0
    assert normalize_cgpa(0.0, 10.0) == 0.0


def test_cgpa_fairness_curve_qualifies_above_cutoff():
    """Students at or above min requirement (e.g. 0.65) must receive at least 80% fairness score."""
    min_cgpa = 0.65

    score_at_cutoff = calculate_cgpa_fairness_score(0.65, min_cgpa)
    assert score_at_cutoff >= 80.0

    score_above_cutoff = calculate_cgpa_fairness_score(0.85, min_cgpa)
    assert score_above_cutoff > score_at_cutoff
    assert score_above_cutoff <= 100.0

    score_perfect = calculate_cgpa_fairness_score(1.0, min_cgpa)
    assert score_perfect == 100.0


def test_cgpa_fairness_avoids_binary_cliff():
    """A student with 0.64 when minimum is 0.65 must not drop to 0 score (smooth soft-landing)."""
    min_cgpa = 0.65
    score_just_below = calculate_cgpa_fairness_score(0.63, min_cgpa)
    score_at_cutoff = calculate_cgpa_fairness_score(0.65, min_cgpa)

    # Must be close to cutoff score (e.g. within 10 points) instead of 0
    assert score_just_below > 70.0
    assert score_just_below < score_at_cutoff
