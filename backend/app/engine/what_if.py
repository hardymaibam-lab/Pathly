"""What-If Simulation Engine.
Pure Python, zero framework dependencies.
"""

from copy import deepcopy
from typing import Dict, List, Optional
from app.engine.types import (
    CareerRecommendationResult,
    CareerRole,
    ScoringWeights,
    StudentAcademicInput,
    StudentGoalInput,
    StudentProfileData,
    StudentRIASECInput,
    StudentSkillInput,
    WhatIfDiff,
)
from app.engine.aggregator import rank_career_recommendations


class WhatIfSimulationResult:
    def __init__(
        self,
        baseline_recommendations: List[CareerRecommendationResult],
        simulated_recommendations: List[CareerRecommendationResult],
        diffs: List[WhatIfDiff],
    ):
        self.baseline_recommendations = baseline_recommendations
        self.simulated_recommendations = simulated_recommendations
        self.diffs = diffs


def simulate_what_if_scenario(
    base_profile: StudentProfileData,
    careers: List[CareerRole],
    simulated_skills: Optional[List[StudentSkillInput]] = None,
    simulated_cgpa: Optional[float] = None,
    simulated_goals: Optional[List[str]] = None,
    simulated_riasec: Optional[StudentRIASECInput] = None,
    weights: ScoringWeights = ScoringWeights(),
) -> WhatIfSimulationResult:
    """Run deterministic what-if analysis simulating changes to skills, grades, or interests."""
    # 1. Run Baseline
    baseline = rank_career_recommendations(base_profile, careers, weights)
    baseline_by_id = {r.career_id: r for r in baseline}

    # 2. Build Simulated Profile
    sim_profile = deepcopy(base_profile)

    # Apply simulated skills
    if simulated_skills:
        existing_skills: Dict[str, StudentSkillInput] = {
            s.name.strip().lower(): s for s in sim_profile.skills
        }
        for s in simulated_skills:
            key = s.name.strip().lower()
            existing_skills[key] = s
        sim_profile.skills = list(existing_skills.values())

    # Apply simulated CGPA
    if simulated_cgpa is not None:
        if sim_profile.academic is None:
            sim_profile.academic = StudentAcademicInput(
                degree="Computer Science",
                field_of_study="Engineering",
                cgpa=simulated_cgpa,
                grading_scale=10.0,
            )
        else:
            sim_profile.academic.cgpa = simulated_cgpa

    # Apply simulated goals
    if simulated_goals is not None:
        if sim_profile.goals is None:
            sim_profile.goals = StudentGoalInput(target_roles=simulated_goals)
        else:
            sim_profile.goals.target_roles = simulated_goals

    # Apply simulated RIASEC
    if simulated_riasec is not None:
        sim_profile.riasec = simulated_riasec

    # 3. Run Simulated Recommendations
    simulated = rank_career_recommendations(sim_profile, careers, weights)

    # 4. Compute Diffs
    diffs: List[WhatIfDiff] = []
    for sim_rec in simulated:
        base_rec = baseline_by_id.get(sim_rec.career_id)
        if base_rec:
            diff = WhatIfDiff(
                career_id=sim_rec.career_id,
                career_title=sim_rec.career_title,
                previous_score=base_rec.composite_score,
                new_score=sim_rec.composite_score,
                score_delta=round(sim_rec.composite_score - base_rec.composite_score, 2),
                previous_rank=base_rec.rank,
                new_rank=sim_rec.rank,
                rank_delta=base_rec.rank - sim_rec.rank,  # positive means improved rank
                previous_readiness=base_rec.readiness_level,
                new_readiness=sim_rec.readiness_level,
            )
            diffs.append(diff)

    return WhatIfSimulationResult(
        baseline_recommendations=baseline,
        simulated_recommendations=simulated,
        diffs=diffs,
    )
