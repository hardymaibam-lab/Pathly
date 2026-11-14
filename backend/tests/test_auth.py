"""Tests for Authentication Endpoints and Password Security."""

from app.core.security import get_password_hash, verify_password


def test_password_hashing():
    raw = "SecurePassword123!"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_user_registration_api(client):
    payload = {
        "email": "newstudent@example.com",
        "password": "StrongPassword2026!",
        "full_name": "New Student",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "newstudent@example.com"
    assert "access_token" in data["data"]


def test_duplicate_registration_fails(client):
    payload = {
        "email": "dup@example.com",
        "password": "Password123!",
        "full_name": "Dup User",
    }
    resp1 = client.post("/api/v1/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 409
    assert resp2.json()["success"] is False


def test_login_api_success(client):
    reg_payload = {
        "email": "login_test@example.com",
        "password": "MyLoginPassword123!",
        "full_name": "Login Tester",
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "login_test@example.com",
        "password": "MyLoginPassword123!",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]


def test_login_api_invalid_credentials(client):
    payload = {
        "email": "unknown@example.com",
        "password": "WrongPassword!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["success"] is False
