"""Pytest Configuration and Shared Fixtures."""

import json
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.entities import Career, CareerSkillRequirement, LearningResource, User
from app.core.security import create_access_token, get_password_hash
from app.engine.types import (
    CareerRole,
    LearningResourceRef,
    RequiredSkill,
    SkillImportance,
    StudentAcademicInput,
    StudentGoalInput,
    StudentProfileData,
    StudentRIASECInput,
    StudentSkillInput,
)

# Test Database Engine (in-memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Create fresh database tables for each test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Load seed careers into test DB
    seed_path = os.path.join(os.path.dirname(__file__), "..", "data", "careers", "careers_dataset.json")
    if os.path.exists(seed_path):
        with open(seed_path, "r", encoding="utf-8") as f:
            careers_data = json.load(f)

        for c in careers_data:
            career = Career(
                id=c["id"],
                title=c["title"],
                slug=c["slug"],
                family=c["family"],
                description=c["description"],
                average_salary_range=c.get("average_salary_range"),
                min_cgpa_normalized=float(c.get("min_cgpa_normalized", 0.60)),
                eligible_degrees=c.get("eligible_degrees", []),
                preferred_degrees=c.get("preferred_degrees", []),
                riasec_realistic=float(c.get("riasec_profile", {}).get("realistic", 0.0)),
                riasec_investigative=float(c.get("riasec_profile", {}).get("investigative", 0.0)),
                riasec_artistic=float(c.get("riasec_profile", {}).get("artistic", 0.0)),
                riasec_social=float(c.get("riasec_profile", {}).get("social", 0.0)),
                riasec_enterprising=float(c.get("riasec_profile", {}).get("enterprising", 0.0)),
                riasec_conventional=float(c.get("riasec_profile", {}).get("conventional", 0.0)),
                prerequisites=c.get("prerequisites", {}),
                capstone_project_idea=c.get("capstone_project_idea"),
            )
            session.add(career)
            session.flush()

            for s in c.get("required_skills", []):
                req = CareerSkillRequirement(
                    career_id=career.id,
                    skill_name=s["skill_name"].strip().lower(),
                    required_level=int(s.get("required_level", 3)),
                    importance=s.get("importance", "core"),
                    weight=float(s.get("weight", 1.0)),
                )
                session.add(req)

            for r in c.get("learning_resources", []):
                res = LearningResource(
                    career_id=career.id,
                    title=r["title"].strip(),
                    provider=r["provider"].strip(),
                    url=r["url"].strip(),
                    estimated_hours=int(r.get("estimated_hours", 20)),
                    difficulty_level=r.get("difficulty_level", "Intermediate"),
                    skill_name=r["skill_name"].strip().lower(),
                )
                session.add(res)

        session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db_session):
    """Creates and returns a registered test user."""
    user = User(
        email="student@example.com",
        hashed_password=get_password_hash("Password123!"),
        full_name="Test Student",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(test_user):
    """Returns Bearer authorization headers for the test user."""
    token = create_access_token(subject=test_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def ananya_profile():
    """Worked example student profile: Ananya (Technical Specification v1.1)."""
    return StudentProfileData(
        id="student-ananya-001",
        name="Ananya",
        academic=StudentAcademicInput(
            degree="B.Tech",
            field_of_study="Computer Science & Engineering",
            cgpa=8.5,
            grading_scale=10.0,
            institution="National Institute of Technology",
            graduation_year=2026,
        ),
        skills=[
            StudentSkillInput(name="python", level=4),
            StudentSkillInput(name="sql", level=3),
            StudentSkillInput(name="machine learning", level=2),
            StudentSkillInput(name="statistics", level=2),
            StudentSkillInput(name="pandas", level=3),
            StudentSkillInput(name="git", level=3),
        ],
        riasec=StudentRIASECInput(
            realistic=0.40,
            investigative=0.90,
            artistic=0.25,
            social=0.20,
            enterprising=0.45,
            conventional=0.65,
        ),
        goals=StudentGoalInput(
            target_roles=["Data Scientist", "Machine Learning Engineer"],
            target_domains=["Data & AI"],
            preferred_work_style="Hybrid",
        ),
        certifications=["Python for Data Science"],
        projects=["Predictive Analytics on Student Performance"],
    )
