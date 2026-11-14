"""Tests for Student Profile Endpoints."""


def test_get_profile(client, auth_headers):
    response = client.get("/api/v1/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "academic" in data["data"]
    assert "skills" in data["data"]


def test_update_profile(client, auth_headers):
    update_payload = {
        "academic": {
            "institution": "IIT Bombay",
            "degree": "B.Tech",
            "field_of_study": "Computer Science",
            "cgpa": 8.8,
            "grading_scale": 10.0,
            "graduation_year": 2026,
        },
        "skills": [
            {"name": "python", "level": 4, "verified": True},
            {"name": "sql", "level": 3, "verified": False},
        ],
        "riasec": {
            "realistic": 0.4,
            "investigative": 0.9,
            "artistic": 0.2,
            "social": 0.2,
            "enterprising": 0.3,
            "conventional": 0.7,
        },
        "goals": {
            "target_roles": ["Data Scientist"],
            "target_domains": ["Data & AI"],
            "preferred_work_style": "Remote",
        },
    }

    response = client.put("/api/v1/profile", json=update_payload, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()["data"]
    assert data["academic"]["institution"] == "IIT Bombay"
    assert data["academic"]["cgpa"] == 8.8
    assert len(data["skills"]) == 2
    assert data["goals"]["target_roles"] == ["Data Scientist"]


def test_sync_skills_endpoint(client, auth_headers):
    skills_payload = [
        {"name": "fastapi", "level": 4, "verified": True},
        {"name": "docker", "level": 3, "verified": False},
    ]

    response = client.post("/api/v1/profile/skills", json=skills_payload, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()["data"]
    skill_names = [s["name"] for s in data["skills"]]
    assert "fastapi" in skill_names
    assert "docker" in skill_names
