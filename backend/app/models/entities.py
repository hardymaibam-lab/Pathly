"""SQLAlchemy Database Models for AI-Powered Career Path Recommendation System.
Supports both PostgreSQL and SQLite.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recommendation_runs = relationship("RecommendationRun", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution = Column(String(255), nullable=True)
    degree = Column(String(100), nullable=True)
    field_of_study = Column(String(150), nullable=True)
    cgpa = Column(Float, nullable=True)
    grading_scale = Column(Float, default=10.0, nullable=False)
    graduation_year = Column(Integer, nullable=True)

    # RIASEC Profile Scores
    riasec_realistic = Column(Float, default=0.0, nullable=False)
    riasec_investigative = Column(Float, default=0.0, nullable=False)
    riasec_artistic = Column(Float, default=0.0, nullable=False)
    riasec_social = Column(Float, default=0.0, nullable=False)
    riasec_enterprising = Column(Float, default=0.0, nullable=False)
    riasec_conventional = Column(Float, default=0.0, nullable=False)

    # Career Goals
    target_roles = Column(JSON, default=list, nullable=False)
    target_domains = Column(JSON, default=list, nullable=False)
    preferred_work_style = Column(String(50), default="Hybrid", nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="profile")
    skills = relationship("StudentSkill", back_populates="profile", cascade="all, delete-orphan")
    certifications = relationship("StudentCertification", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("StudentProject", back_populates="profile", cascade="all, delete-orphan")
    recommendations = relationship("RecommendationRun", back_populates="profile", cascade="all, delete-orphan")


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    level = Column(Integer, default=1, nullable=False)  # 1 to 5
    verified = Column(Boolean, default=False, nullable=False)

    profile = relationship("StudentProfile", back_populates="skills")


class StudentCertification(Base):
    __tablename__ = "student_certifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    issuing_organization = Column(String(255), nullable=True)
    issue_year = Column(Integer, nullable=True)

    profile = relationship("StudentProfile", back_populates="certifications")


class StudentProject(Base):
    __tablename__ = "student_projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, default=list, nullable=False)
    url = Column(String(500), nullable=True)

    profile = relationship("StudentProfile", back_populates="projects")


class Career(Base):
    __tablename__ = "careers"

    id = Column(String(50), primary_key=True)
    title = Column(String(150), nullable=False, index=True)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    family = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    average_salary_range = Column(String(100), nullable=True)
    min_cgpa_normalized = Column(Float, default=0.60, nullable=False)
    eligible_degrees = Column(JSON, default=list, nullable=False)
    preferred_degrees = Column(JSON, default=list, nullable=False)

    riasec_realistic = Column(Float, default=0.0, nullable=False)
    riasec_investigative = Column(Float, default=0.0, nullable=False)
    riasec_artistic = Column(Float, default=0.0, nullable=False)
    riasec_social = Column(Float, default=0.0, nullable=False)
    riasec_enterprising = Column(Float, default=0.0, nullable=False)
    riasec_conventional = Column(Float, default=0.0, nullable=False)

    prerequisites = Column(JSON, default=dict, nullable=False)
    capstone_project_idea = Column(Text, nullable=True)

    required_skills = relationship("CareerSkillRequirement", back_populates="career", cascade="all, delete-orphan")
    learning_resources = relationship("LearningResource", back_populates="career", cascade="all, delete-orphan")


class CareerSkillRequirement(Base):
    __tablename__ = "career_skill_requirements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    career_id = Column(String(50), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    required_level = Column(Integer, default=3, nullable=False)  # 1 to 5
    importance = Column(String(20), default="core", nullable=False)  # "core" or "elective"
    weight = Column(Float, default=1.0, nullable=False)

    career = relationship("Career", back_populates="required_skills")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    career_id = Column(String(50), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    provider = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    estimated_hours = Column(Integer, default=20, nullable=False)
    difficulty_level = Column(String(50), default="Intermediate", nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)

    career = relationship("Career", back_populates="learning_resources")


class RecommendationRun(Base):
    __tablename__ = "recommendation_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    run_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    scoring_profile_name = Column(String(100), default="default_v1.1", nullable=False)

    # Full audit snapshots for reproducible runs
    input_snapshot = Column(JSON, nullable=False)
    results_snapshot = Column(JSON, nullable=False)

    # Quick indexed lookup attributes for top match
    top_career_id = Column(String(50), nullable=True)
    top_career_title = Column(String(150), nullable=True)
    top_score = Column(Float, nullable=True)
    top_readiness = Column(String(50), nullable=True)

    user = relationship("User", back_populates="recommendation_runs")
    profile = relationship("StudentProfile", back_populates="recommendations")


class RoadmapProgress(Base):
    __tablename__ = "roadmap_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(String(50), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False)
    completed_skills = Column(JSON, default=list, nullable=False)
    completed_milestones = Column(JSON, default=list, nullable=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
