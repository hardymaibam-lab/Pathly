"""Seed Data Ingestion Script.
Populates careers, required skills, and learning resources from careers_dataset.json.
"""

import json
import os
import sys

# Ensure backend root is on sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BASE_DIR)

from app.core.database import Base, SessionLocal, engine
from app.models.entities import Career, CareerSkillRequirement, LearningResource


def seed_careers():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    dataset_path = os.path.join(BASE_DIR, "data", "careers", "careers_dataset.json")
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset file not found at {dataset_path}")
        return

    with open(dataset_path, "r", encoding="utf-8") as f:
        careers_data = json.load(f)

    print(f"Loaded {len(careers_data)} careers from dataset. Ingesting into database...")

    for c in careers_data:
        existing_career = db.query(Career).filter(Career.id == c["id"]).first()
        if existing_career:
            print(f"Updating career: {c['title']} ({c['id']})")
            career = existing_career
            career.title = c["title"]
            career.slug = c["slug"]
            career.family = c["family"]
            career.description = c["description"]
            career.average_salary_range = c.get("average_salary_range")
            career.min_cgpa_normalized = float(c.get("min_cgpa_normalized", 0.60))
            career.eligible_degrees = c.get("eligible_degrees", [])
            career.preferred_degrees = c.get("preferred_degrees", [])
            career.riasec_realistic = float(c.get("riasec_profile", {}).get("realistic", 0.0))
            career.riasec_investigative = float(c.get("riasec_profile", {}).get("investigative", 0.0))
            career.riasec_artistic = float(c.get("riasec_profile", {}).get("artistic", 0.0))
            career.riasec_social = float(c.get("riasec_profile", {}).get("social", 0.0))
            career.riasec_enterprising = float(c.get("riasec_profile", {}).get("enterprising", 0.0))
            career.riasec_conventional = float(c.get("riasec_profile", {}).get("conventional", 0.0))
            career.prerequisites = c.get("prerequisites", {})
            career.capstone_project_idea = c.get("capstone_project_idea")
            # Clear existing children to repopulate cleanly
            db.query(CareerSkillRequirement).filter(CareerSkillRequirement.career_id == c["id"]).delete()
            db.query(LearningResource).filter(LearningResource.career_id == c["id"]).delete()
        else:
            print(f"Creating career: {c['title']} ({c['id']})")
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
            db.add(career)

        db.flush()

        # Add skill requirements
        for s in c.get("required_skills", []):
            skill_req = CareerSkillRequirement(
                career_id=career.id,
                skill_name=s["skill_name"].strip().lower(),
                required_level=int(s.get("required_level", 3)),
                importance=s.get("importance", "core"),
                weight=float(s.get("weight", 1.0)),
            )
            db.add(skill_req)

        # Add learning resources
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
            db.add(res)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")


if __name__ == "__main__":
    seed_careers()
