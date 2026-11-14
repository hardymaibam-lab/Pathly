"""Career Knowledge Base Repository."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.entities import Career, CareerSkillRequirement, LearningResource
from app.engine.types import (
    CareerRole,
    LearningResourceRef,
    RequiredSkill,
    SkillImportance,
    StudentRIASECInput,
)


class CareerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, family: Optional[str] = None) -> List[Career]:
        query = self.db.query(Career)
        if family:
            query = query.filter(Career.family.ilike(f"%{family}%"))
        return query.all()

    def get_by_id(self, career_id: str) -> Optional[Career]:
        return self.db.query(Career).filter(Career.id == career_id).first()

    def get_by_slug(self, slug: str) -> Optional[Career]:
        return self.db.query(Career).filter(Career.slug == slug).first()

    def get_distinct_families(self) -> List[str]:
        results = self.db.query(Career.family).distinct().all()
        return [r[0] for r in results if r[0]]

    def to_engine_career(self, db_career: Career) -> CareerRole:
        """Convert a database Career model into pure Python CareerRole dataclass."""
        req_skills: List[RequiredSkill] = []
        for req in db_career.required_skills:
            importance = SkillImportance.CORE if req.importance == "core" else SkillImportance.ELECTIVE
            req_skills.append(
                RequiredSkill(
                    skill_name=req.skill_name,
                    required_level=req.required_level,
                    importance=importance,
                    weight=req.weight,
                )
            )

        resources: List[LearningResourceRef] = []
        for res in db_career.learning_resources:
            resources.append(
                LearningResourceRef(
                    title=res.title,
                    provider=res.provider,
                    url=res.url,
                    estimated_hours=res.estimated_hours,
                    difficulty_level=res.difficulty_level,
                    skill_name=res.skill_name,
                )
            )

        riasec_profile = StudentRIASECInput(
            realistic=db_career.riasec_realistic,
            investigative=db_career.riasec_investigative,
            artistic=db_career.riasec_artistic,
            social=db_career.riasec_social,
            enterprising=db_career.riasec_enterprising,
            conventional=db_career.riasec_conventional,
        )

        return CareerRole(
            id=db_career.id,
            title=db_career.title,
            slug=db_career.slug,
            family=db_career.family,
            description=db_career.description,
            required_skills=req_skills,
            eligible_degrees=db_career.eligible_degrees or [],
            preferred_degrees=db_career.preferred_degrees or [],
            min_cgpa_normalized=db_career.min_cgpa_normalized or 0.60,
            riasec_profile=riasec_profile,
            learning_resources=resources,
            prerequisites=db_career.prerequisites or {},
            capstone_project_idea=db_career.capstone_project_idea,
            average_salary_range=db_career.average_salary_range,
        )

    def get_all_engine_careers(self) -> List[CareerRole]:
        """Fetch all careers converted to pure Python CareerRole objects."""
        db_careers = self.get_all()
        return [self.to_engine_career(c) for c in db_careers]
