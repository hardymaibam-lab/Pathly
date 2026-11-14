"""Initial database schema migration

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-14 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_superuser', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    op.create_table(
        'student_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('institution', sa.String(length=255), nullable=True),
        sa.Column('degree', sa.String(length=100), nullable=True),
        sa.Column('field_of_study', sa.String(length=150), nullable=True),
        sa.Column('cgpa', sa.Float(), nullable=True),
        sa.Column('grading_scale', sa.Float(), nullable=False),
        sa.Column('graduation_year', sa.Integer(), nullable=True),
        sa.Column('riasec_realistic', sa.Float(), nullable=False),
        sa.Column('riasec_investigative', sa.Float(), nullable=False),
        sa.Column('riasec_artistic', sa.Float(), nullable=False),
        sa.Column('riasec_social', sa.Float(), nullable=False),
        sa.Column('riasec_enterprising', sa.Float(), nullable=False),
        sa.Column('riasec_conventional', sa.Float(), nullable=False),
        sa.Column('target_roles', sa.JSON(), nullable=False),
        sa.Column('target_domains', sa.JSON(), nullable=False),
        sa.Column('preferred_work_style', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

    op.create_table(
        'student_skills',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('profile_id', sa.String(length=36), nullable=False),
        sa.Column('skill_name', sa.String(length=100), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('verified', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_student_skills_skill_name'), 'student_skills', ['skill_name'], unique=False)

    op.create_table(
        'student_certifications',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('profile_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('issuing_organization', sa.String(length=255), nullable=True),
        sa.Column('issue_year', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'student_projects',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('profile_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('technologies', sa.JSON(), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'careers',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('slug', sa.String(length=150), nullable=False),
        sa.Column('family', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('average_salary_range', sa.String(length=100), nullable=True),
        sa.Column('min_cgpa_normalized', sa.Float(), nullable=False),
        sa.Column('eligible_degrees', sa.JSON(), nullable=False),
        sa.Column('preferred_degrees', sa.JSON(), nullable=False),
        sa.Column('riasec_realistic', sa.Float(), nullable=False),
        sa.Column('riasec_investigative', sa.Float(), nullable=False),
        sa.Column('riasec_artistic', sa.Float(), nullable=False),
        sa.Column('riasec_social', sa.Float(), nullable=False),
        sa.Column('riasec_enterprising', sa.Float(), nullable=False),
        sa.Column('riasec_conventional', sa.Float(), nullable=False),
        sa.Column('prerequisites', sa.JSON(), nullable=False),
        sa.Column('capstone_project_idea', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_careers_family'), 'careers', ['family'], unique=False)
    op.create_index(op.f('ix_careers_slug'), 'careers', ['slug'], unique=True)
    op.create_index(op.f('ix_careers_title'), 'careers', ['title'], unique=False)

    op.create_table(
        'career_skill_requirements',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('career_id', sa.String(length=50), nullable=False),
        sa.Column('skill_name', sa.String(length=100), nullable=False),
        sa.Column('required_level', sa.Integer(), nullable=False),
        sa.Column('importance', sa.String(length=20), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['career_id'], ['careers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_career_skill_requirements_skill_name'), 'career_skill_requirements', ['skill_name'], unique=False)

    op.create_table(
        'learning_resources',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('career_id', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('provider', sa.String(length=100), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('estimated_hours', sa.Integer(), nullable=False),
        sa.Column('difficulty_level', sa.String(length=50), nullable=False),
        sa.Column('skill_name', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['career_id'], ['careers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learning_resources_skill_name'), 'learning_resources', ['skill_name'], unique=False)

    op.create_table(
        'recommendation_runs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('profile_id', sa.String(length=36), nullable=False),
        sa.Column('run_timestamp', sa.DateTime(), nullable=False),
        sa.Column('scoring_profile_name', sa.String(length=100), nullable=False),
        sa.Column('input_snapshot', sa.JSON(), nullable=False),
        sa.Column('results_snapshot', sa.JSON(), nullable=False),
        sa.Column('top_career_id', sa.String(length=50), nullable=True),
        sa.Column('top_career_title', sa.String(length=150), nullable=True),
        sa.Column('top_score', sa.Float(), nullable=True),
        sa.Column('top_readiness', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'roadmap_progress',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('career_id', sa.String(length=50), nullable=False),
        sa.Column('completed_skills', sa.JSON(), nullable=False),
        sa.Column('completed_milestones', sa.JSON(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['career_id'], ['careers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('roadmap_progress')
    op.drop_table('recommendation_runs')
    op.drop_table('learning_resources')
    op.drop_table('career_skill_requirements')
    op.drop_table('careers')
    op.drop_table('student_projects')
    op.drop_table('student_certifications')
    op.drop_table('student_skills')
    op.drop_table('student_profiles')
    op.drop_table('users')
