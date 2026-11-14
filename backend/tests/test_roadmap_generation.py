"""Tests for Learning Roadmap Generation."""

from app.engine.roadmap import generate_learning_roadmap
from app.engine.types import (
    CareerRole,
    LearningResourceRef,
    ReadinessLevel,
    RequiredSkill,
    SkillImportance,
    StudentProfileData,
    StudentSkillInput,
)


def test_roadmap_stage_sequencing():
    profile = StudentProfileData(
        id="roadmap-student",
        skills=[
            StudentSkillInput("python", 4),
        ],
    )

    career = CareerRole(
        id="c-ds",
        title="Data Scientist",
        slug="data-scientist",
        family="Data & AI",
        description="",
        required_skills=[
            RequiredSkill("python", 4, SkillImportance.CORE, 2.0),
            RequiredSkill("statistics", 3, SkillImportance.CORE, 1.5),
            RequiredSkill("machine learning", 3, SkillImportance.CORE, 2.0),
            RequiredSkill("deep learning", 2, SkillImportance.ELECTIVE, 1.0),
        ],
        prerequisites={
            "machine learning": ["statistics", "python"],
            "deep learning": ["machine learning"],
        },
        capstone_project_idea="Build an automated predictive analytics engine.",
        learning_resources=[
            LearningResourceRef("Statistics 101", "edX", "https://edx.org", 20, "Beginner", "statistics"),
        ],
    )

    roadmap = generate_learning_roadmap(
        profile=profile,
        career=career,
        current_score=68.5,
        current_readiness=ReadinessLevel.MODERATE_READINESS,
    )

    assert roadmap.career_title == "Data Scientist"
    assert roadmap.total_duration_weeks >= 6
    assert len(roadmap.stages) > 0
    assert roadmap.projected_score_after_roadmap > roadmap.current_score
    assert roadmap.capstone_project is not None

    # Check that each stage has duration, weekly hours, and milestone
    for stage in roadmap.stages:
        assert stage.stage_number in [1, 2, 3]
        assert stage.estimated_duration_weeks > 0
        assert stage.weekly_hours_recommended > 0
        assert stage.milestone is not None
