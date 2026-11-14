"""Tests for Skill Gap Analysis."""

from app.engine.types import (
    CareerRole,
    GapPriority,
    LearningResourceRef,
    RequiredSkill,
    SkillImportance,
    StudentProfileData,
    StudentSkillInput,
)
from app.engine.feature_extractor import extract_student_features
from app.engine.skill_gaps import analyze_skill_gaps


def test_skill_gap_quantification_and_prioritization():
    profile = StudentProfileData(
        id="gap-tester",
        skills=[
            StudentSkillInput("python", 4),       # Exceeds req level 3 -> No gap
            StudentSkillInput("sql", 1),          # Required 3 -> Partial gap of 2 (Core -> HIGH)
            # "machine learning" is missing completely -> Gap of 3 (Core -> HIGH)
            StudentSkillInput("docker", 1),       # Required 2 -> Elective gap of 1 (Elective -> LOW)
        ],
    )
    features = extract_student_features(profile)

    career = CareerRole(
        id="c-test",
        title="AI Engineer",
        slug="ai-engineer",
        family="Data & AI",
        description="",
        required_skills=[
            RequiredSkill("python", 3, SkillImportance.CORE, 2.0),
            RequiredSkill("sql", 3, SkillImportance.CORE, 1.5),
            RequiredSkill("machine learning", 3, SkillImportance.CORE, 2.0),
            RequiredSkill("docker", 2, SkillImportance.ELECTIVE, 1.0),
        ],
        learning_resources=[
            LearningResourceRef("ML Masterclass", "Coursera", "https://coursera.org", 30, "Intermediate", "machine learning"),
        ],
    )

    gaps = analyze_skill_gaps(features, career)

    # Python should NOT be in gaps
    gap_skills = [g.skill_name.lower() for g in gaps]
    assert "python" not in gap_skills

    # SQL and Machine Learning should be HIGH priority
    ml_gap = next(g for g in gaps if g.skill_name == "machine learning")
    assert ml_gap.gap == 3
    assert ml_gap.current_level == 0
    assert ml_gap.required_level == 3
    assert ml_gap.priority == GapPriority.HIGH
    assert ml_gap.potential_score_gain > 0.0
    assert len(ml_gap.resources) == 1

    sql_gap = next(g for g in gaps if g.skill_name == "sql")
    assert sql_gap.gap == 2
    assert sql_gap.priority == GapPriority.HIGH

    # Docker should be LOW priority
    docker_gap = next(g for g in gaps if g.skill_name == "docker")
    assert docker_gap.gap == 1
    assert docker_gap.priority == GapPriority.LOW
