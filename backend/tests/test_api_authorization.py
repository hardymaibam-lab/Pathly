"""Tests for API Authorization and Security Gates."""


def test_profile_requires_auth(client):
    response = client.get("/api/v1/profile")
    assert response.status_code == 401
    assert response.json()["success"] is False


def test_recommendations_requires_auth(client):
    response = client.post("/api/v1/recommendations")
    assert response.status_code == 401
    assert response.json()["success"] is False


def test_invalid_token_rejected(client):
    headers = {"Authorization": "Bearer invalid.fake.token"}
    response = client.get("/api/v1/profile", headers=headers)
    assert response.status_code == 401
    assert response.json()["success"] is False


def test_public_endpoints_accessible_without_auth(client):
    # Careers listing is public
    res_careers = client.get("/api/v1/careers")
    assert res_careers.status_code == 200

    # Career detail is public
    res_detail = client.get("/api/v1/careers/career-ds-01")
    assert res_detail.status_code == 200

    # Health check is public
    res_health = client.get("/health")
    assert res_health.status_code == 200
