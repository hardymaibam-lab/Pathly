# API Integration Contract & Specification
## AI-Powered Career Path Recommendation System (v1.1)

This document serves as the binding integration contract between the Backend service and the independently developed React Frontend.

---

## 1. General Principles & Standards

### 1.1 Base URL & Routing
* **Development Server:** `http://localhost:8000`
* **API Prefix:** `/api/v1`
* **Interactive Documentation (Swagger):** `http://localhost:8000/docs`
* **OpenAPI Specification (JSON):** `http://localhost:8000/openapi.json` or [openapi.json](file:///c:/Users/DELL/pathly/backend/docs/openapi.json)

### 1.2 Cross-Origin Resource Sharing (CORS)
The backend is pre-configured to accept requests from:
* `http://localhost:3000` (React default)
* `http://localhost:5173` (Vite default)
* `http://127.0.0.1:3000`
* `http://127.0.0.1:5173`

### 1.3 Uniform JSON Response Envelope
Every response from the backend follows a predictable JSON structure:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Description of action taken",
  "error": null
}
```

#### Error Response
```json
{
  "success": false,
  "data": null,
  "message": null,
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | UNAUTHORIZED | CONFLICT | INTERNAL_ERROR",
    "message": "Human-readable error explanation",
    "details": [ ... ]
  }
}
```

### 1.4 Authentication Mechanism
* **Standard:** Stateless JSON Web Token (JWT) Bearer Authentication.
* **Header:** `Authorization: Bearer <access_token>`
* **Expiry:** 24 hours (`1440` minutes).

---

## 2. API Endpoints Catalog

### 2.1 Authentication (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
* **Access:** Public
* **Purpose:** Create a new student account.
* **Request:**
  ```json
  {
    "email": "ananya@example.com",
    "password": "Password123!",
    "full_name": "Ananya Sharma"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOi...",
      "token_type": "bearer",
      "expires_in_minutes": 1440,
      "user_id": "c1f7a0b3-...",
      "email": "ananya@example.com",
      "full_name": "Ananya Sharma"
    },
    "message": "Registration successful.",
    "error": null
  }
  ```

#### `POST /api/v1/auth/login`
* **Access:** Public
* **Purpose:** Authenticate an existing user and obtain a JWT access token.
* **Request:**
  ```json
  {
    "email": "ananya@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK):** Same structure as Register response.

#### `GET /api/v1/auth/me`
* **Access:** Protected (Requires Bearer token)
* **Purpose:** Fetch identity and details of current authenticated user.

---

### 2.2 Student Profile (`/api/v1/profile`)

#### `GET /api/v1/profile`
* **Access:** Protected
* **Purpose:** Retrieve student's academic credentials, existing skills, RIASEC scores, career goals, certifications, and project history.

#### `PUT /api/v1/profile`
* **Access:** Protected
* **Purpose:** Full or partial update of student profile.
* **Request:**
  ```json
  {
    "academic": {
      "institution": "National Institute of Technology",
      "degree": "B.Tech",
      "field_of_study": "Computer Science & Engineering",
      "cgpa": 8.5,
      "grading_scale": 10.0,
      "graduation_year": 2026
    },
    "skills": [
      { "name": "python", "level": 4, "verified": true },
      { "name": "sql", "level": 3, "verified": false },
      { "name": "machine learning", "level": 2, "verified": false },
      { "name": "pandas", "level": 3, "verified": true },
      { "name": "statistics", "level": 2, "verified": false },
      { "name": "git", "level": 3, "verified": true }
    ],
    "riasec": {
      "realistic": 0.40,
      "investigative": 0.90,
      "artistic": 0.25,
      "social": 0.20,
      "enterprising": 0.45,
      "conventional": 0.65
    },
    "goals": {
      "target_roles": ["Data Scientist", "Machine Learning Engineer"],
      "target_domains": ["Data & AI"],
      "preferred_work_style": "Hybrid"
    },
    "certifications": [
      { "name": "Python for Data Science", "issuing_organization": "Coursera", "issue_year": 2025 }
    ],
    "projects": [
      {
        "title": "Customer Churn Prediction",
        "description": "ML pipeline for predicting telecom churn",
        "technologies": ["Python", "Pandas", "Scikit-Learn"]
      }
    ]
  }
  ```

#### `POST /api/v1/profile/skills`
* **Access:** Protected
* **Purpose:** Fast batch replacement/sync of user skills.

---

### 2.3 Career Knowledge Base (`/api/v1/careers`)

#### `GET /api/v1/careers`
* **Access:** Public
* **Query Parameters:** `family` (Optional filter, e.g. `?family=Data%20%26%20AI`)
* **Purpose:** Browse available career roles.

#### `GET /api/v1/careers/families`
* **Access:** Public
* **Purpose:** List unique career families (e.g. `Data & AI`, `Software Engineering`, `Cloud & Infrastructure`, `Security & Defense`).

#### `GET /api/v1/careers/{identifier}`
* **Access:** Public
* **Identifier:** Career ID (e.g. `career-ds-01`) or slug (e.g. `data-scientist`).
* **Purpose:** Fetch detailed career requirements, core/elective skills, RIASEC profile, and learning resources.

---

### 2.4 Recommendation Engine (`/api/v1/recommendations`)

#### `POST /api/v1/recommendations`
* **Access:** Protected
* **Query Parameters:** `scoring_profile` (default: `default_v1.1`)
* **Purpose:** Run deterministic recommendation engine against the authenticated student's profile.
* **Response Highlights:**
  - `composite_score`: 0 to 100
  - `rank`: 1, 2, 3...
  - `readiness_level`: `HIGH_READINESS` (>=80), `MODERATE_READINESS` (65-79), `DEVELOPING` (50-64), `EXPLORATORY` (<50)
  - `component_scores`:
    - `skill_score` (40% weight)
    - `riasec_score` (25% weight)
    - `academic_score` (20% weight, with CGPA fairness curve)
    - `goal_score` (15% weight)
  - `skill_gaps`: prioritized missing skills with `potential_score_gain`
  - `explanation`: strengths, critical gaps, RIASEC and academic reasoning

#### `POST /api/v1/recommendations/ad-hoc`
* **Access:** Public
* **Purpose:** Run recommendation engine with an in-flight payload (without requiring an account).

#### `GET /api/v1/recommendations/history`
* **Access:** Protected
* **Purpose:** Retrieve historical run summaries for progress tracking.

#### `GET /api/v1/recommendations/runs/{run_id}`
* **Access:** Protected
* **Purpose:** Retrieve exact input and output snapshot of a previous run (100% reproducible).

#### `POST /api/v1/recommendations/what-if`
* **Access:** Protected
* **Purpose:** Simulate the exact score and rank changes if the student learns new skills, improves CGPA, or updates interests.
* **Request:**
  ```json
  {
    "simulated_skills": [
      { "name": "deep learning", "level": 3 },
      { "name": "machine learning", "level": 4 }
    ],
    "simulated_cgpa": 8.8
  }
  ```
* **Response Highlights:**
  - `diffs`: list of careers with `score_delta`, `rank_delta`, `previous_readiness`, `new_readiness`.

---

### 2.5 Skill Gaps & Roadmaps (`/api/v1/skill-gaps` & `/api/v1/roadmaps`)

#### `GET /api/v1/skill-gaps/{career_id}`
* **Access:** Protected
* **Purpose:** Prioritized gap list for a specific career role.

#### `GET /api/v1/roadmaps/{career_id}`
* **Access:** Protected
* **Purpose:** Generates a 3-phase structured learning roadmap (Foundations $\rightarrow$ Core Competencies $\rightarrow$ Capstone Milestone) with weekly study schedules.

#### `GET /api/v1/roadmaps/{career_id}/progress`
* **Access:** Protected
* **Purpose:** Get completed skills, completed milestones, and student notes.

#### `PUT /api/v1/roadmaps/{career_id}/progress`
* **Access:** Protected
* **Purpose:** Mark skills and milestones as completed.

---

### 2.6 AI Career Mentor Guidance (`/api/v1/mentor`)

#### `POST /api/v1/mentor/guidance`
* **Access:** Protected
* **Purpose:** Generates personalized qualitative coaching, interview preparation strategy, and resume highlights.
* **Separation of Concerns:** Qualitative advice is kept strictly distinct from the deterministic engine's mathematical scoring.
