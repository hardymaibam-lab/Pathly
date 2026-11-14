"""Tests for Pure Python Recommendation Engine."""

from app.engine.types import (
    CareerRole,
    ReadinessLevel,
    RequiredSkill,
    ScoringWeights,
    SkillImportance,
    StudentAcademicInput,
    StudentGoalInput,
    StudentProfileData,
    StudentRIASECInput,
    StudentSkillInput,
)
from app.engine.aggregator import (
    calculate_career_recommendation,
    rank_career_recommendations,
)
from app.engine.readiness import classify_readiness


def sample_test_careers():
    return [
        CareerRole(
            id="career-1",
            title="Data Scientist",
            slug="data-scientist",
            family="Data & AI",
            description="Extracts insights from data using ML and statistics.",
            required_skills=[
                RequiredSkill("python", 4, SkillImportance.CORE, 2.0),
                RequiredSkill("sql", 3, SkillImportance.CORE, 1.5),
                RequiredSkill("machine learning", 3, SkillImportance.CORE, 2.0),
                RequiredSkill("statistics", 3, SkillImportance.CORE, 1.5),
                RequiredSkill("deep learning", 2, SkillImportance.ELECTIVE, 1.0),
            ],
            eligible_degrees=["B.Tech", "B.Sc", "MS"],
            preferred_degrees=["Computer Science", "Data Science"],
            min_cgpa_normalized=0.65,
            riasec_profile=StudentRIASECInput(realistic=0.3, investigative=0.9, artistic=0.2, social=0.2, enterprising=0.4, conventional=0.6),
        ),
        CareerRole(
            id="career-2",
            title="Frontend Developer",
            slug="frontend-developer",
            family="Software Engineering",
            description="Builds interactive user interfaces.",
            required_skills=[
                RequiredSkill("javascript", 4, SkillImportance.CORE, 2.0),
                RequiredSkill("react", 4, SkillImportance.CORE, 2.0),
                RequiredSkill("css", 3, SkillImportance.CORE, 1.5),
            ],
            eligible_degrees=["B.Tech", "BCA"],
            preferred_degrees=["Computer Science"],
            min_cgpa_normalized=0.55,
            riasec_profile=StudentRIASECInput(realistic=0.3, investigative=0.4, artistic=0.8, social=0.4, enterprising=0.3, conventional=0.4),
        ),
    ]


def test_recommendation_determinism(ananya_profile):
    """Calling the engine twice with identical inputs must produce identical results."""
    careers = sample_test_careers()
    weights = ScoringWeights()

    run1 = rank_career_recommendations(ananya_profile, careers, weights)
    run2 = rank_career_recommendations(ananya_profile, careers, weights)

    assert len(run1) == len(run2)
    for r1, r2 in zip(run1, run2):
        assert r1.career_id == r2.career_id
        assert r1.composite_score == r2.composite_score
        assert r1.rank == r2.rank
        assert r1.readiness_level == r2.readiness_level
        assert r1.component_scores.skill_score == r2.component_scores.skill_score
        assert r1.component_scores.riasec_score == r2.component_scores.riasec_score
        assert r1.component_scores.academic_score == r2.component_scores.academic_score
        assert r1.component_scores.goal_score == r2.component_scores.goal_score


def test_recommendation_ranking_order(ananya_profile):
    """Ananya with strong Python, ML, and Investigative traits should rank Data Scientist far above Frontend Developer."""
    careers = sample_test_careers()
    results = rank_career_recommendations(ananya_profile, careers)

    assert results[0].career_title == "Data Scientist"
    assert results[0].rank == 1
    assert results[0].composite_score > results[1].composite_score
    assert results[1].career_title == "Frontend Developer"
    assert results[1].rank == 2


def test_readiness_classification():
    """Verify threshold classification according to Technical Spec v1.1."""
    assert classify_readiness(95.0) == ReadinessLevel.HIGH_READINESS
    assert classify_readiness(80.0) == ReadinessLevel.HIGH_READINESS
    assert classify_readiness(79.9) == ReadinessLevel.MODERATE_READINESS
    assert classify_readiness(65.0) == ReadinessLevel.MODERATE_READINESS
    assert classify_readiness(64.9) == ReadinessLevel.DEVELOPING
    assert classify_readiness(50.0) == ReadinessLevel.DEVELOPING
    assert classify_readiness(49.9) == ReadinessLevel.EXPLORATORY
    assert classify_readiness(15.0) == ReadinessLevel.EXPLORATORY


def test_scoring_weights_customization(ananya_profile):
    """Changing weights changes composite score predictably."""
    career = sample_test_careers()[0]

    # Equal weights
    w_equal = ScoringWeights(skill_weight=0.25, riasec_weight=0.25, academic_weight=0.25, goal_weight=0.25)
    rec_equal = calculate_career_recommendation(ananya_profile, career, w_equal)

    # Skill dominated weight
    w_skill = ScoringWeights(skill_weight=0.80, riasec_weight=0.10, academic_weight=0.05, goal_weight=0.05)
    rec_skill = calculate_career_recommendation(ananya_profile, career, w_skill)

    assert rec_equal.composite_score != rec_skill.composite_score
    # Component scores themselves remain invariant to top-level weight changes
    assert rec_equal.component_scores.skill_score == rec_skill.component_scores.skill_score
