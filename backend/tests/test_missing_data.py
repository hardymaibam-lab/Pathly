"""Tests for Robust Handling of Incomplete or Missing Student Data."""

from app.engine.types import (
    CareerRole,
    RequiredSkill,
    SkillImportance,
    StudentProfileData,
)
from app.engine.aggregator import (
    calculate_career_recommendation,
    rank_career_recommendations,
)


def get_mock_career():
    return CareerRole(
        id="mock-career-01",
        title="Software Engineer",
        slug="software-engineer",
        family="Software Engineering",
        description="Generalist developer.",
        required_skills=[
            RequiredSkill("python", 3, SkillImportance.CORE, 1.0),
            RequiredSkill("git", 2, SkillImportance.ELECTIVE, 1.0),
        ],
    )


def test_completely_empty_profile_does_not_crash():
    """An empty profile must compute safely with baseline non-negative scores."""
    empty_profile = StudentProfileData(id="empty-user")
    career = get_mock_career()

    rec = calculate_career_recommendation(empty_profile, career)

    assert rec is not None
    assert rec.composite_score >= 0.0
    assert rec.component_scores.skill_score == 0.0  # Has 0 skills
    assert rec.component_scores.academic_score > 0.0  # Neutral baseline
    assert rec.component_scores.riasec_score > 0.0    # Neutral baseline
    assert rec.component_scores.goal_score > 0.0      # Neutral baseline
    assert len(rec.skill_gaps) == 2                   # All skills identified as gaps


def test_none_fields_handling():
    """Profile with None for academic, riasec, and goals."""
    profile = StudentProfileData(
        id="partial-user",
        name=None,
        academic=None,
        skills=[],
        riasec=None,
        goals=None,
    )
    careers = [get_mock_career()]

    results = rank_career_recommendations(profile, careers)
    assert len(results) == 1
    assert results[0].rank == 1
    assert results[0].explanation is not None
