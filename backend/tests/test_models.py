"""Tests for Database Models and Relationships."""

from app.models.entities import (
    Career,
    CareerSkillRequirement,
    StudentProfile,
    StudentSkill,
    User,
)
from app.core.security import get_password_hash


def test_user_and_profile_relationship(db_session):
    user = User(
        email="test_rel@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Rel User",
    )
    db_session.add(user)
    db_session.commit()

    profile = StudentProfile(
        user_id=user.id,
        degree="B.Tech",
        cgpa=8.0,
    )
    db_session.add(profile)
    db_session.commit()

    skill = StudentSkill(
        profile_id=profile.id,
        skill_name="python",
        level=4,
    )
    db_session.add(skill)
    db_session.commit()

    # Query back
    queried_user = db_session.query(User).filter(User.email == "test_rel@example.com").first()
    assert queried_user is not None
    assert queried_user.profile is not None
    assert queried_user.profile.degree == "B.Tech"
    assert len(queried_user.profile.skills) == 1
    assert queried_user.profile.skills[0].skill_name == "python"

    # Test Cascade Delete
    db_session.delete(queried_user)
    db_session.commit()

    assert db_session.query(StudentProfile).filter(StudentProfile.id == profile.id).first() is None
    assert db_session.query(StudentSkill).filter(StudentSkill.id == skill.id).first() is None
