"""Student Profile Repository."""

from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.entities import (
    StudentCertification,
    StudentProfile,
    StudentProject,
    StudentSkill,
)


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str) -> Optional[StudentProfile]:
        return self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

    def get_or_create(self, user_id: str) -> StudentProfile:
        profile = self.get_by_user_id(user_id)
        if not profile:
            profile = StudentProfile(user_id=user_id)
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
        return profile

    def update_academic(
        self,
        profile_id: str,
        institution: Optional[str],
        degree: Optional[str],
        field_of_study: Optional[str],
        cgpa: Optional[float],
        grading_scale: float = 10.0,
        graduation_year: Optional[int] = None,
    ) -> StudentProfile:
        profile = self.db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
        if profile:
            if institution is not None:
                profile.institution = institution
            if degree is not None:
                profile.degree = degree
            if field_of_study is not None:
                profile.field_of_study = field_of_study
            if cgpa is not None:
                profile.cgpa = cgpa
            if grading_scale is not None:
                profile.grading_scale = grading_scale
            if graduation_year is not None:
                profile.graduation_year = graduation_year
            self.db.commit()
            self.db.refresh(profile)
        return profile

    def update_riasec(self, profile_id: str, riasec_scores: Dict[str, float]) -> StudentProfile:
        profile = self.db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
        if profile:
            profile.riasec_realistic = float(riasec_scores.get("realistic", 0.0))
            profile.riasec_investigative = float(riasec_scores.get("investigative", 0.0))
            profile.riasec_artistic = float(riasec_scores.get("artistic", 0.0))
            profile.riasec_social = float(riasec_scores.get("social", 0.0))
            profile.riasec_enterprising = float(riasec_scores.get("enterprising", 0.0))
            profile.riasec_conventional = float(riasec_scores.get("conventional", 0.0))
            self.db.commit()
            self.db.refresh(profile)
        return profile

    def update_goals(
        self,
        profile_id: str,
        target_roles: List[str],
        target_domains: List[str],
        preferred_work_style: Optional[str] = None,
    ) -> StudentProfile:
        profile = self.db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
        if profile:
            profile.target_roles = target_roles
            profile.target_domains = target_domains
            if preferred_work_style:
                profile.preferred_work_style = preferred_work_style
            self.db.commit()
            self.db.refresh(profile)
        return profile

    def sync_skills(self, profile_id: str, skills_data: List[Dict[str, Any]]) -> List[StudentSkill]:
        # Clear existing skills for this profile and insert fresh set
        self.db.query(StudentSkill).filter(StudentSkill.profile_id == profile_id).delete()
        new_skills = []
        for s in skills_data:
            skill = StudentSkill(
                profile_id=profile_id,
                skill_name=s["name"].strip().lower(),
                level=max(1, min(5, int(s.get("level", 1)))),
                verified=bool(s.get("verified", False)),
            )
            self.db.add(skill)
            new_skills.append(skill)
        self.db.commit()
        return new_skills

    def sync_certifications(self, profile_id: str, certs_data: List[Dict[str, Any]]) -> List[StudentCertification]:
        self.db.query(StudentCertification).filter(StudentCertification.profile_id == profile_id).delete()
        new_certs = []
        for c in certs_data:
            cert = StudentCertification(
                profile_id=profile_id,
                name=c["name"].strip(),
                issuing_organization=c.get("issuing_organization"),
                issue_year=c.get("issue_year"),
            )
            self.db.add(cert)
            new_certs.append(cert)
        self.db.commit()
        return new_certs

    def sync_projects(self, profile_id: str, projects_data: List[Dict[str, Any]]) -> List[StudentProject]:
        self.db.query(StudentProject).filter(StudentProject.profile_id == profile_id).delete()
        new_projects = []
        for p in projects_data:
            project = StudentProject(
                profile_id=profile_id,
                title=p["title"].strip(),
                description=p.get("description"),
                technologies=p.get("technologies", []),
                url=p.get("url"),
            )
            self.db.add(project)
            new_projects.append(project)
        self.db.commit()
        return new_projects
