# Pathly REST API Contract Specification
Version: 1.0.0
Backend Architecture: FastAPI + PostgreSQL + Pydantic v2
Base URL: `/api/v1`

---

## 1. Authentication & Session

### `POST /api/v1/auth/register`
Creates a new student account.
- **Request Body:**
```json
{
  "full_name": "Alex Mercer",
  "email": "alex.mercer@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (201 Created):**
```json
{
  "user": {
    "id": "usr_948194",
    "full_name": "Alex Mercer",
    "email": "alex.mercer@example.com",
    "avatar_url": null,
    "created_at": "2026-11-14T08:00:00Z",
    "onboarding_completed": false
  },
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### `POST /api/v1/auth/login`
Authenticates an existing student.
- **Request Body:**
```json
{
  "email": "alex.mercer@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "user": {
    "id": "usr_948194",
    "full_name": "Alex Mercer",
    "email": "alex.mercer@example.com",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    "created_at": "2026-11-14T08:00:00Z",
    "onboarding_completed": true
  },
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### `GET /api/v1/auth/me`
Retrieves currently authenticated user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User object.

---

## 2. Student Onboarding & RIASEC Assessment

### `GET /api/v1/assessment/riasec-questions`
Returns the standardized 36 RIASEC vocational assessment questions (6 items per dimension).
- **Response (200 OK):**
```json
{
  "questions": [
    {
      "id": "q1",
      "category": "Realistic",
      "code": "R",
      "text": "I enjoy assembling or repairing hardware, mechanical devices, or physical computing equipment."
    }
  ]
}
```

### `POST /api/v1/assessment/submit`
Submits completed 7-step student onboarding information and triggers recommendation computation.
- **Request Body:**
```json
{
  "personal_info": {
    "full_name": "Alex Mercer",
    "email": "alex.mercer@example.com",
    "phone": "+1 (555) 349-9210",
    "location": "San Francisco, CA",
    "bio": "CS junior passionate about distributed systems and AI infra."
  },
  "academic_info": {
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "institution": "University of California, Berkeley",
    "graduation_year": 2027,
    "gpa": "3.85",
    "coursework": ["Data Structures", "Algorithms", "Operating Systems", "Machine Learning"]
  },
  "technical_skills": [
    { "name": "Python", "proficiency": "Advanced" },
    { "name": "TypeScript", "proficiency": "Intermediate" },
    { "name": "React", "proficiency": "Intermediate" },
    { "name": "Docker", "proficiency": "Beginner" }
  ],
  "soft_skills": ["Problem Solving", "Systematic Thinking", "Team Collaboration"],
  "riasec_responses": {
    "q1": 5,
    "q2": 4,
    "q36": 2
  },
  "career_preferences": {
    "target_roles": ["Machine Learning Engineer", "Cloud Solutions Architect"],
    "work_preference": "Hybrid",
    "expected_salary_min": 110000,
    "company_sizes": ["Startup", "Mid-size", "Enterprise"]
  },
  "availability": {
    "weekly_study_hours": 15,
    "preferred_days": ["Monday", "Wednesday", "Saturday", "Sunday"],
    "target_timeline_months": 6
  }
}
```

### `GET /api/v1/assessment/status`
Returns user's onboarding progress and saved draft state.
- **Response (200 OK):**
```json
{
  "is_completed": true,
  "completed_step": 7,
  "last_updated": "2026-11-14T09:15:00Z"
}
```

### `PUT /api/v1/assessment/save-draft`
Saves partial onboarding state for save-and-resume experience.
- **Request Body:** `{ "current_step": 3, "draft_data": { ... } }`

---

## 3. Dashboard

### `GET /api/v1/dashboard/summary`
Aggregates high-level metrics for student dashboard.
- **Response (200 OK):**
```json
{
  "career_readiness_score": 78,
  "profile_completion_pct": 92,
  "top_career_match": {
    "id": "car_ml_01",
    "title": "Machine Learning Engineer",
    "compatibility_score": 94,
    "readiness_label": "Ready Now"
  },
  "skill_strengths_count": 8,
  "skill_gaps_count": 4,
  "roadmap_progress_pct": 35,
  "recent_activities": [
    {
      "id": "act_1",
      "type": "assessment_completed",
      "title": "RIASEC Assessment Completed",
      "timestamp": "2 hours ago"
    }
  ],
  "riasec_scores": {
    "Realistic": 72,
    "Investigative": 94,
    "Artistic": 60,
    "Social": 54,
    "Enterprising": 68,
    "Conventional": 80
  }
}
```

---

## 4. Career Recommendations

### `GET /api/v1/careers`
Returns prioritized list of career recommendations.
- **Query Params:** `?readiness=all&sort=compatibility`
- **Response (200 OK):** Array of `Career` objects.

### `GET /api/v1/careers/{id}`
Returns granular breakdown for a single career.
- **Response (200 OK):**
```json
{
  "id": "car_ml_01",
  "title": "Machine Learning Engineer",
  "category": "Artificial Intelligence & Data",
  "compatibility_score": 94,
  "readiness_label": "Ready Now",
  "overview": "Designs, builds, and deploys scalable machine learning models into production systems.",
  "median_salary": "$145,000 - $185,000",
  "job_growth_rate": "+24% (Much faster than average)",
  "score_breakdown": {
    "skill_compatibility": 92,
    "interest_compatibility": 96,
    "academic_relevance": 95,
    "market_demand": 93
  },
  "strengths": [
    "Strong Python foundational coding",
    "High investigative curiosity score (94%)",
    "Relevant Computer Science coursework in Algorithms"
  ],
  "gaps": [
    "Production model serving with Docker & Triton/TorchServe",
    "Distributed GPU training (DeepSpeed / PyTorch FSDP)"
  ],
  "required_skills": [
    { "name": "Python", "category": "Languages", "required_level": "Advanced", "current_level": "Advanced", "status": "Matched" },
    { "name": "PyTorch", "category": "Frameworks", "required_level": "Advanced", "current_level": "Intermediate", "status": "Minor Gap" },
    { "name": "Docker", "category": "DevOps", "required_level": "Intermediate", "current_level": "Beginner", "status": "Moderate Gap" }
  ]
}
```

---

## 5. Skill Gap Analysis

### `GET /api/v1/skills/gap-analysis`
Returns detailed analysis of current vs required proficiencies.
- **Response (200 OK):**
```json
{
  "overall_readiness_score": 78,
  "potential_max_score": 96,
  "skills": [
    {
      "id": "sk_torch",
      "name": "PyTorch / Deep Learning",
      "category": "Frameworks",
      "current_level": "Intermediate",
      "required_level": "Advanced",
      "current_numeric": 3,
      "required_numeric": 4,
      "priority": "Critical",
      "potential_score_improvement": 6,
      "estimated_weeks_to_bridge": 4
    }
  ]
}
```

---

## 6. Personalized Learning Roadmap

### `GET /api/v1/roadmap`
Returns sequenced stages, milestones, weekly schedule, and tasks.
- **Response (200 OK):**
```json
{
  "career_id": "car_ml_01",
  "career_title": "Machine Learning Engineer",
  "total_weeks": 16,
  "completed_tasks_count": 7,
  "total_tasks_count": 20,
  "progress_pct": 35,
  "stages": [
    {
      "id": "stg_1",
      "stage_number": 1,
      "title": "Foundational ML & Deep Learning Core",
      "duration": "Weeks 1-4",
      "status": "In Progress",
      "milestones": [
        {
          "id": "ms_1",
          "title": "PyTorch Neural Architecture Mastery",
          "description": "Implement transformer attention layers from scratch.",
          "is_completed": true
        }
      ],
      "tasks": [
        {
          "id": "tsk_1",
          "title": "Build a Custom Vision Transformer (ViT) in PyTorch",
          "estimated_hours": 6,
          "is_completed": true,
          "category": "Project"
        }
      ]
    }
  ],
  "weekly_schedule": {
    "total_weekly_hours": 15,
    "schedule_slots": [
      { "day": "Monday", "focus": "Theoretical Foundations & Paper Reading", "hours": 3 },
      { "day": "Wednesday", "focus": "Hands-on PyTorch Implementation", "hours": 4 },
      { "day": "Saturday", "focus": "End-to-End Model Pipelines & Docker", "hours": 5 },
      { "day": "Sunday", "focus": "Code Review, Testing & Open Source", "hours": 3 }
    ]
  },
  "resources": [
    {
      "id": "res_1",
      "title": "PyTorch Deep Learning Zero-to-Mastery",
      "type": "Course",
      "provider": "PyTorch Official",
      "url": "https://pytorch.org/tutorials/",
      "is_free": true
    }
  ]
}
```

### `PATCH /api/v1/roadmap/tasks/{task_id}`
Toggles or updates task completion state.
- **Request Body:** `{ "is_completed": true }`
- **Response (200 OK):** Updated task and new overall roadmap progress percentage.

---

## 7. Profile & Settings

### `GET /api/v1/profile`
Retrieves student profile information.

### `PUT /api/v1/profile`
Updates student profile fields, academic info, skills, preferences, and study hours.
