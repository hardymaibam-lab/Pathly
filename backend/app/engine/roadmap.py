"""Learning Roadmap Generator.
Pure Python, zero framework dependencies.
"""

from typing import Dict, List, Set
from app.engine.types import (
    CareerRoadmap,
    CareerRole,
    LearningResourceRef,
    ReadinessLevel,
    RoadmapMilestone,
    RoadmapStage,
    ScoringWeights,
    SkillGapItem,
    SkillImportance,
    StudentProfileData,
)
from app.engine.feature_extractor import extract_student_features
from app.engine.skill_gaps import analyze_skill_gaps


def generate_learning_roadmap(
    profile: StudentProfileData,
    career: CareerRole,
    current_score: float,
    current_readiness: ReadinessLevel,
    weights: ScoringWeights = ScoringWeights(),
) -> CareerRoadmap:
    """Generate a structured, phased learning roadmap to bridge skill gaps."""
    features = extract_student_features(profile)
    gaps = analyze_skill_gaps(features, career, weights)

    if not gaps:
        # All requirements satisfied!
        empty_stage = RoadmapStage(
            stage_number=1,
            stage_name="Proficiency Maintenance & Portfolio Showcase",
            focus_skills=[s.skill_name for s in career.required_skills[:3]],
            estimated_duration_weeks=2,
            weekly_hours_recommended=5,
            resources=[],
            milestone=RoadmapMilestone(
                title="Interview Ready Portfolio",
                description="Package existing projects into a cohesive portfolio and initiate job applications.",
                estimated_week=2,
                associated_skills=[s.skill_name for s in career.required_skills[:3]],
            ),
        )
        return CareerRoadmap(
            career_id=career.id,
            career_title=career.title,
            total_duration_weeks=2,
            readiness_level=current_readiness,
            current_score=current_score,
            projected_score_after_roadmap=current_score,
            stages=[empty_stage],
            capstone_project=career.capstone_project_idea,
        )

    # Topological sorting / grouping based on career prerequisites
    prereq_graph = career.prerequisites or {}
    missing_skill_names = {g.skill_name.lower(): g for g in gaps}

    # Group into 3 phases:
    # Phase 1: Foundational gaps (skills that are prerequisites for others, or core skills with level 0)
    # Phase 2: Core competency gaps
    # Phase 3: Advanced specialization, electives, and capstone
    stage1_skills: List[SkillGapItem] = []
    stage2_skills: List[SkillGapItem] = []
    stage3_skills: List[SkillGapItem] = []

    # Helper: is skill A a prerequisite for any other required skill?
    def is_prereq_for_another(name: str) -> bool:
        name_l = name.lower()
        for target, prereqs in prereq_graph.items():
            if name_l in [p.lower() for p in prereqs]:
                return True
        return False

    for gap in gaps:
        if is_prereq_for_another(gap.skill_name) or (gap.importance == SkillImportance.CORE and gap.current_level == 0):
            stage1_skills.append(gap)
        elif gap.importance == SkillImportance.CORE:
            stage2_skills.append(gap)
        else:
            stage3_skills.append(gap)

    # Balance stages if one is empty
    if not stage1_skills and stage2_skills:
        stage1_skills.append(stage2_skills.pop(0))
    if not stage2_skills and stage3_skills:
        stage2_skills.append(stage3_skills.pop(0))

    stages: List[RoadmapStage] = []
    current_week_accumulator = 0

    stage_configs = [
        (1, "Phase 1: Foundations & Prerequisites", stage1_skills, 4, 10),
        (2, "Phase 2: Core Competencies & Practical Application", stage2_skills, 6, 12),
        (3, "Phase 3: Advanced Specialization & Capstone", stage3_skills, 4, 10),
    ]

    for stage_num, stage_name, skill_items, est_weeks, weekly_hrs in stage_configs:
        if not skill_items and stage_num > 1:
            continue

        resources: List[LearningResourceRef] = []
        focus_names: List[str] = []
        for g in skill_items:
            focus_names.append(g.skill_name)
            resources.extend(g.resources)

        current_week_accumulator += est_weeks

        # Create milestone
        if stage_num == 1:
            m_title = "Foundational Knowledge Check"
            m_desc = f"Build basic lab/code snippets demonstrating syntax and core concepts in {', '.join(focus_names[:3])}."
        elif stage_num == 2:
            m_title = "Integration Mini-Project"
            m_desc = f"Implement an applied mini-project integrating {', '.join(focus_names[:3])}."
        else:
            m_title = "Capstone Portfolio Milestone"
            m_desc = career.capstone_project_idea or f"Deploy a production-ready application showcasing {', '.join(focus_names[:3])}."

        milestone = RoadmapMilestone(
            title=m_title,
            description=m_desc,
            estimated_week=current_week_accumulator,
            associated_skills=focus_names,
        )

        stages.append(
            RoadmapStage(
                stage_number=stage_num,
                stage_name=stage_name,
                focus_skills=focus_names,
                estimated_duration_weeks=est_weeks,
                weekly_hours_recommended=weekly_hrs,
                resources=resources,
                milestone=milestone,
            )
        )

    # Projected score if all gaps are addressed
    potential_total_gain = sum(g.potential_score_gain for g in gaps)
    projected_score = min(100.0, round(current_score + potential_total_gain, 2))

    return CareerRoadmap(
        career_id=career.id,
        career_title=career.title,
        total_duration_weeks=max(2, current_week_accumulator),
        readiness_level=current_readiness,
        current_score=current_score,
        projected_score_after_roadmap=projected_score,
        stages=stages,
        capstone_project=career.capstone_project_idea,
    )
