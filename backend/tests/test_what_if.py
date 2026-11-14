"""Tests for What-If Simulation Engine."""

from app.engine.types import (
    CareerRole,
    RequiredSkill,
    SkillImportance,
    StudentProfileData,
    StudentSkillInput,
)
from app.engine.what_if import simulate_what_if_scenario


def test_what_if_skill_upskilling():
    profile = StudentProfileData(
        id="whatif-user",
        skills=[
            StudentSkillInput("python", 2),
        ],
    )

    careers = [
        CareerRole(
            id="c-backend",
            title="Backend Engineer",
            slug="backend-engineer",
            family="Software Engineering",
            description="",
            required_skills=[
                RequiredSkill("python", 4, SkillImportance.CORE, 2.0),
                RequiredSkill("postgresql", 3, SkillImportance.CORE, 1.5),
            ],
        )
    ]

    # Simulate learning Python to 4 and PostgreSQL to 3
    sim_skills = [
        StudentSkillInput("python", 4),
        StudentSkillInput("postgresql", 3),
    ]

    result = simulate_what_if_scenario(
        base_profile=profile,
        careers=careers,
        simulated_skills=sim_skills,
    )

    assert len(result.diffs) == 1
    diff = result.diffs[0]

    assert diff.career_title == "Backend Engineer"
    assert diff.new_score > diff.previous_score
    assert diff.score_delta > 0.0
    assert result.simulated_recommendations[0].composite_score > result.baseline_recommendations[0].composite_score
