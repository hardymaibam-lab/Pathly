"""Tests for Centralized Error Handling."""


def test_404_for_non_existent_career(client):
    response = client.get("/api/v1/careers/non-existent-career-id-999")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert "not found" in data["error"]["message"].lower()


def test_422_validation_error_envelope(client):
    # Malformed payload (missing required email and password)
    response = client.post("/api/v1/auth/register", json={"wrong_key": 123})
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert data["error"]["details"] is not None


def test_ad_hoc_recommendation_api(client):
    payload = {
        "academic": {
            "degree": "B.Tech",
            "field_of_study": "Computer Science",
            "cgpa": 8.5,
            "grading_scale": 10.0,
        },
        "skills": [
            {"name": "python", "level": 4},
            {"name": "sql", "level": 3},
        ],
        "goals": {
            "target_roles": ["Data Scientist"],
        },
    }
    response = client.post("/api/v1/recommendations/ad-hoc", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["recommendations"]) > 0
