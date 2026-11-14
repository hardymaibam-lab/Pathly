"""Reproduce the Worked Example for Ananya (Pages 5-6 of Technical Specification v1.1)."""

import json
import os
from app.engine.aggregator import rank_career_recommendations
from app.engine.roadmap import generate_learning_roadmap
from app.engine.types import (
    CareerRole,
    LearningResourceRef,
    ReadinessLevel,
    RequiredSkill,
    ScoringWeights,
    SkillImportance,
    StudentRIASECInput,
)


def load_knowledge_base_careers():
    dataset_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "careers", "careers_dataset.json"
    )
    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    careers = []
    for c in data:
        req_skills = [
            RequiredSkill(
                skill_name=s["skill_name"],
                required_level=s["required_level"],
                importance=SkillImportance.CORE if s["importance"] == "core" else SkillImportance.ELECTIVE,
                weight=s.get("weight", 1.0),
            )
            for s in c.get("required_skills", [])
        ]
        resources = [
            LearningResourceRef(
                title=r["title"],
                provider=r["provider"],
                url=r["url"],
                estimated_hours=r["estimated_hours"],
                difficulty_level=r["difficulty_level"],
                skill_name=r["skill_name"],
            )
            for r in c.get("learning_resources", [])
        ]
        riasec = StudentRIASECInput(
            realistic=c["riasec_profile"]["realistic"],
            investigative=c["riasec_profile"]["investigative"],
            artistic=c["riasec_profile"]["artistic"],
            social=c["riasec_profile"]["social"],
            enterprising=c["riasec_profile"]["enterprising"],
            conventional=c["riasec_profile"]["conventional"],
        )
        careers.append(
            CareerRole(
                id=c["id"],
                title=c["title"],
                slug=c["slug"],
                family=c["family"],
                description=c["description"],
                required_skills=req_skills,
                eligible_degrees=c.get("eligible_degrees", []),
                preferred_degrees=c.get("preferred_degrees", []),
                min_cgpa_normalized=c.get("min_cgpa_normalized", 0.60),
                riasec_profile=riasec,
                learning_resources=resources,
                prerequisites=c.get("prerequisites", {}),
                capstone_project_idea=c.get("capstone_project_idea"),
                average_salary_range=c.get("average_salary_range"),
            )
        )
    return careers


def test_ananya_case_study_worked_example(ananya_profile):
    """Execution of Technical Specification v1.1 worked example for student 'Ananya'.

    Verifies:
    1. Recommendation engine correctly extracts Ananya's multi-dimensional features.
    2. 'Data Scientist' emerges as the top recommended career role.
    3. Composite score falls in High Readiness (>= 80%).
    4. Skill gaps highlight Deep Learning and leveling up Statistics/ML.
    5. Learning roadmap generates structured phases to close those gaps.
    """
    careers = load_knowledge_base_careers()
    weights = ScoringWeights(
        skill_weight=0.40,
        riasec_weight=0.25,
        academic_weight=0.20,
        goal_weight=0.15,
        core_skill_ratio=0.75,
        elective_skill_ratio=0.25,
    )

    results = rank_career_recommendations(ananya_profile, careers, weights)

    # 1. Verification of top match
    top_recommendation = results[0]
    assert top_recommendation.career_title == "Data Scientist"
    assert top_recommendation.rank == 1
    assert top_recommendation.composite_score >= 80.0
    assert top_recommendation.readiness_level == ReadinessLevel.HIGH_READINESS

    # 2. Verification of component scores
    components = top_recommendation.component_scores
    # High academic compatibility: B.Tech CSE + 8.5 CGPA
    assert components.academic_score >= 90.0
    # High RIASEC interest synergy: High Investigative (0.90) matches Data Science (0.90)
    assert components.riasec_score >= 90.0
    # Goal alignment: Target role is explicitly "Data Scientist"
    assert components.goal_score == 100.0
    # Skill compatibility: Strong Python/SQL/Pandas with room for ML/Deep Learning growth
    assert components.skill_score >= 70.0

    # 3. Verification of skill gaps
    gap_names = [g.skill_name.lower() for g in top_recommendation.skill_gaps]
    assert "deep learning" in gap_names

    # 4. Verification of Roadmap
    target_career = next(c for c in careers if c.id == top_recommendation.career_id)
    roadmap = generate_learning_roadmap(
        profile=ananya_profile,
        career=target_career,
        current_score=top_recommendation.composite_score,
        current_readiness=top_recommendation.readiness_level,
        weights=weights,
    )

    assert roadmap.career_title == "Data Scientist"
    assert roadmap.projected_score_after_roadmap > top_recommendation.composite_score
    assert len(roadmap.stages) >= 2
    assert "customer churn" in (roadmap.capstone_project or "").lower()
