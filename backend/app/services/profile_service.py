"""Student Profile Service."""

from typing import Optional
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException
from app.models.entities import StudentProfile
from app.repositories.profile_repository import ProfileRepository
from app.repositories.user_repository import UserRepository
from app.schemas.profile import (
    AcademicSchema,
    CertificationSchema,
    GoalSchema,
    ProfileUpdateRequest,
    ProjectSchema,
    RIASECSchema,
    SkillItemSchema,
    StudentProfileResponse,
)
from app.engine.types import (
    StudentAcademicInput,
    StudentGoalInput,
    StudentProfileData,
    StudentRIASECInput,
    StudentSkillInput,
)


class ProfileService:
    def __init__(self, db: Session):
        self.db = db
        self.profile_repo = ProfileRepository(db)
        self.user_repo = UserRepository(db)

    def get_profile(self, user_id: str) -> StudentProfileResponse:
        profile = self.profile_repo.get_or_create(user_id)
        return self._to_response(profile)

    def update_profile(self, user_id: str, req: ProfileUpdateRequest) -> StudentProfileResponse:
        profile = self.profile_repo.get_or_create(user_id)

        if req.academic is not None:
            self.profile_repo.update_academic(
                profile_id=profile.id,
                institution=req.academic.institution,
                degree=req.academic.degree,
                field_of_study=req.academic.field_of_study,
                cgpa=req.academic.cgpa,
                grading_scale=req.academic.grading_scale,
                graduation_year=req.academic.graduation_year,
            )

        if req.riasec is not None:
            self.profile_repo.update_riasec(
                profile_id=profile.id,
                riasec_scores=req.riasec.model_dump(),
            )

        if req.goals is not None:
            self.profile_repo.update_goals(
                profile_id=profile.id,
                target_roles=req.goals.target_roles,
                target_domains=req.goals.target_domains,
                preferred_work_style=req.goals.preferred_work_style,
            )

        if req.skills is not None:
            skills_dicts = [s.model_dump() for s in req.skills]
            self.profile_repo.sync_skills(profile.id, skills_dicts)

        if req.certifications is not None:
            certs_dicts = [c.model_dump() for c in req.certifications]
            self.profile_repo.sync_certifications(profile.id, certs_dicts)

        if req.projects is not None:
            proj_dicts = [p.model_dump() for p in req.projects]
            self.profile_repo.sync_projects(profile.id, proj_dicts)

        updated = self.profile_repo.get_by_user_id(user_id)
        return self._to_response(updated)

    def get_engine_profile(self, user_id: str) -> StudentProfileData:
        """Convert a user's stored profile into pure Python StudentProfileData for the engine."""
        profile = self.profile_repo.get_or_create(user_id)
        user = self.user_repo.get_by_id(user_id)
        name = user.full_name if user else "Student"

        academic = None
        if profile.degree or profile.cgpa is not None:
            academic = StudentAcademicInput(
                degree=profile.degree or "",
                field_of_study=profile.field_of_study or "",
                cgpa=profile.cgpa or 0.0,
                grading_scale=profile.grading_scale or 10.0,
                institution=profile.institution,
                graduation_year=profile.graduation_year,
            )

        skills = [
            StudentSkillInput(
                name=s.skill_name,
                level=s.level,
                verified=s.verified,
            )
            for s in profile.skills
        ]

        riasec = StudentRIASECInput(
            realistic=profile.riasec_realistic,
            investigative=profile.riasec_investigative,
            artistic=profile.riasec_artistic,
            social=profile.riasec_social,
            enterprising=profile.riasec_enterprising,
            conventional=profile.riasec_conventional,
        )

        goals = StudentGoalInput(
            target_roles=profile.target_roles or [],
            target_domains=profile.target_domains or [],
            preferred_work_style=profile.preferred_work_style,
        )

        certs = [c.name for c in profile.certifications]
        projects = [f"{p.title}: {p.description or ''}" for p in profile.projects]

        return StudentProfileData(
            id=profile.id,
            name=name,
            academic=academic,
            skills=skills,
            riasec=riasec,
            goals=goals,
            certifications=certs,
            projects=projects,
        )

    def _to_response(self, profile: StudentProfile) -> StudentProfileResponse:
        return StudentProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            academic=AcademicSchema(
                institution=profile.institution,
                degree=profile.degree,
                field_of_study=profile.field_of_study,
                cgpa=profile.cgpa,
                grading_scale=profile.grading_scale,
                graduation_year=profile.graduation_year,
            ),
            skills=[
                SkillItemSchema(name=s.skill_name, level=s.level, verified=s.verified)
                for s in profile.skills
            ],
            riasec=RIASECSchema(
                realistic=profile.riasec_realistic,
                investigative=profile.riasec_investigative,
                artistic=profile.riasec_artistic,
                social=profile.riasec_social,
                enterprising=profile.riasec_enterprising,
                conventional=profile.riasec_conventional,
            ),
            goals=GoalSchema(
                target_roles=profile.target_roles or [],
                target_domains=profile.target_domains or [],
                preferred_work_style=profile.preferred_work_style or "Hybrid",
            ),
            certifications=[
                CertificationSchema(
                    name=c.name,
                    issuing_organization=c.issuing_organization,
                    issue_year=c.issue_year,
                )
                for c in profile.certifications
            ],
            projects=[
                ProjectSchema(
                    title=p.title,
                    description=p.description,
                    technologies=p.technologies or [],
                    url=p.url,
                )
                for p in profile.projects
            ],
        )
