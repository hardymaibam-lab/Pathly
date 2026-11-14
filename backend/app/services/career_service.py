"""Career Knowledge Base Service."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException
from app.models.entities import Career
from app.repositories.career_repository import CareerRepository
from app.schemas.career import (
    CareerDetailSchema,
    CareerListItemSchema,
    LearningResourceSchema,
    RequiredSkillSchema,
)
from app.schemas.profile import RIASECSchema
from app.engine.types import CareerRole


class CareerService:
    def __init__(self, db: Session):
        self.db = db
        self.career_repo = CareerRepository(db)

    def list_careers(self, family: Optional[str] = None) -> List[CareerListItemSchema]:
        careers = self.career_repo.get_all(family=family)
        return [
            CareerListItemSchema(
                id=c.id,
                title=c.title,
                slug=c.slug,
                family=c.family,
                description=c.description,
                average_salary_range=c.average_salary_range,
                min_cgpa_normalized=c.min_cgpa_normalized,
            )
            for c in careers
        ]

    def get_career_by_id_or_slug(self, identifier: str) -> CareerDetailSchema:
        career = self.career_repo.get_by_id(identifier)
        if not career:
            career = self.career_repo.get_by_slug(identifier)
        if not career:
            raise NotFoundException(f"Career '{identifier}' not found in knowledge base.")

        return self._to_detail_schema(career)

    def get_career_families(self) -> List[str]:
        return self.career_repo.get_distinct_families()

    def get_all_engine_careers(self) -> List[CareerRole]:
        return self.career_repo.get_all_engine_careers()

    def _to_detail_schema(self, career: Career) -> CareerDetailSchema:
        return CareerDetailSchema(
            id=career.id,
            title=career.title,
            slug=career.slug,
            family=career.family,
            description=career.description,
            average_salary_range=career.average_salary_range,
            min_cgpa_normalized=career.min_cgpa_normalized,
            eligible_degrees=career.eligible_degrees or [],
            preferred_degrees=career.preferred_degrees or [],
            riasec_profile=RIASECSchema(
                realistic=career.riasec_realistic,
                investigative=career.riasec_investigative,
                artistic=career.riasec_artistic,
                social=career.riasec_social,
                enterprising=career.riasec_enterprising,
                conventional=career.riasec_conventional,
            ),
            required_skills=[
                RequiredSkillSchema(
                    skill_name=s.skill_name,
                    required_level=s.required_level,
                    importance=s.importance,
                    weight=s.weight,
                )
                for s in career.required_skills
            ],
            learning_resources=[
                LearningResourceSchema(
                    title=r.title,
                    provider=r.provider,
                    url=r.url,
                    estimated_hours=r.estimated_hours,
                    difficulty_level=r.difficulty_level,
                    skill_name=r.skill_name,
                )
                for r in career.learning_resources
            ],
            prerequisites=career.prerequisites or {},
            capstone_project_idea=career.capstone_project_idea,
        )
