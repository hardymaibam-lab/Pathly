"""Feature Extractor for Student Profile Data.
Pure Python, zero external framework dependencies.
"""

import math
from typing import Dict, List, Set, Tuple
from app.engine.types import (
    StudentAcademicInput,
    StudentGoalInput,
    StudentProfileData,
    StudentRIASECInput,
)


class NormalizedStudentFeatures:
    def __init__(
        self,
        skills: Dict[str, int],
        normalized_cgpa: float,
        degree: str,
        field_of_study: str,
        riasec_vector: List[float],
        target_roles: Set[str],
        target_domains: Set[str],
        certifications: Set[str],
        projects: List[str],
    ):
        self.skills = skills
        self.normalized_cgpa = normalized_cgpa
        self.degree = degree
        self.field_of_study = field_of_study
        self.riasec_vector = riasec_vector
        self.target_roles = target_roles
        self.target_domains = target_domains
        self.certifications = certifications
        self.projects = projects


def normalize_cgpa(cgpa: float, grading_scale: float = 10.0) -> float:
    """Normalize CGPA to a 0.0 - 1.0 interval."""
    if cgpa is None or cgpa <= 0:
        return 0.0

    # Auto-detect if grading_scale seems mismatched
    if grading_scale is None or grading_scale <= 0:
        if cgpa <= 4.0:
            grading_scale = 4.0
        elif cgpa <= 10.0:
            grading_scale = 10.0
        else:
            grading_scale = 100.0

    ratio = cgpa / grading_scale
    return max(0.0, min(1.0, float(ratio)))


def normalize_riasec_vector(riasec: Optional[StudentRIASECInput]) -> List[float]:
    """Convert RIASEC input into a normalized 6D vector [R, I, A, S, E, C]."""
    if riasec is None:
        return [0.0] * 6

    raw = [
        float(riasec.realistic or 0.0),
        float(riasec.investigative or 0.0),
        float(riasec.artistic or 0.0),
        float(riasec.social or 0.0),
        float(riasec.enterprising or 0.0),
        float(riasec.conventional or 0.0),
    ]

    magnitude = math.sqrt(sum(x * x for x in raw))
    if magnitude > 0:
        return [x / magnitude for x in raw]
    return raw


def extract_student_features(profile: StudentProfileData) -> NormalizedStudentFeatures:
    """Transform raw student profile data into clean normalized features."""
    skills_dict: Dict[str, int] = {}
    if profile.skills:
        for s in profile.skills:
            if s.name:
                cleaned_name = s.name.strip().lower()
                level = max(1, min(5, int(s.level if s.level is not None else 1)))
                skills_dict[cleaned_name] = level

    normalized_cgpa = 0.70  # Default neutral CGPA if none provided
    degree = ""
    field_of_study = ""
    if profile.academic:
        scale = profile.academic.grading_scale if profile.academic.grading_scale else 10.0
        normalized_cgpa = normalize_cgpa(profile.academic.cgpa, scale)
        degree = (profile.academic.degree or "").strip().lower()
        field_of_study = (profile.academic.field_of_study or "").strip().lower()

    riasec_vector = normalize_riasec_vector(profile.riasec)

    target_roles: Set[str] = set()
    target_domains: Set[str] = set()
    if profile.goals:
        if profile.goals.target_roles:
            target_roles = {r.strip().lower() for r in profile.goals.target_roles if r}
        if profile.goals.target_domains:
            target_domains = {d.strip().lower() for d in profile.goals.target_domains if d}

    certs = {c.strip().lower() for c in profile.certifications if c}
    projects = [p.strip() for p in profile.projects if p]

    return NormalizedStudentFeatures(
        skills=skills_dict,
        normalized_cgpa=normalized_cgpa,
        degree=degree,
        field_of_study=field_of_study,
        riasec_vector=riasec_vector,
        target_roles=target_roles,
        target_domains=target_domains,
        certifications=certs,
        projects=projects,
    )
