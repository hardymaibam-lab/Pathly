# API Request & Response Examples
## AI-Powered Career Path Recommendation System

This reference contains concrete HTTP requests and sample JSON responses for all primary workflows.

---

## 1. User Registration & Authentication

### Request: Register
`POST /api/v1/auth/register`
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "ananya@example.com",
       "password": "Password123!",
       "full_name": "Ananya Sharma"
     }'
```

### Response: 201 Created
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in_minutes": 1440,
    "user_id": "90e2bdf2-f815-46aa-b2b9-6c589b275bfb",
    "email": "ananya@example.com",
    "full_name": "Ananya Sharma"
  },
  "message": "Registration successful.",
  "error": null
}
```

---

## 2. Update Student Profile (Ananya's Worked Example)

### Request: Update Profile
`PUT /api/v1/profile`
```bash
curl -X PUT "http://localhost:8000/api/v1/profile" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
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
         { "name": "statistics", "level": 2, "verified": false },
         { "name": "pandas", "level": 3, "verified": true },
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
       }
     }'
```

---

## 3. Generate Career Recommendations

### Request: Run Recommendation Engine
`POST /api/v1/recommendations?scoring_profile=default_v1.1`
```bash
curl -X POST "http://localhost:8000/api/v1/recommendations" \
     -H "Authorization: Bearer <TOKEN>"
```

### Response: 200 OK
```json
{
  "success": true,
  "data": {
    "run_id": "d0473926-25f0-43df-9730-a921d743a758",
    "run_timestamp": "2026-11-14T12:00:00Z",
    "scoring_profile_name": "default_v1.1",
    "recommendations": [
      {
        "career_id": "career-ds-01",
        "career_title": "Data Scientist",
        "career_slug": "data-scientist",
        "career_family": "Data & AI",
        "rank": 1,
        "composite_score": 83.12,
        "readiness_level": "HIGH_READINESS",
        "component_scores": {
          "skill_score": 71.46,
          "riasec_score": 93.42,
          "academic_score": 93.33,
          "goal_score": 100.0
        },
        "explanation": {
          "summary": "Data Scientist is ranked #1 with a composite score of 83.12%. Your current readiness is classified as HIGH_READINESS.",
          "strengths": [
            "Full proficiency match in key skills: python, sql, pandas.",
            "Foundational knowledge present in: statistics, machine learning.",
            "Academic degree and coursework strongly qualify for this role.",
            "High psychometric interest synergy with day-to-day role activities."
          ],
          "critical_gaps": [
            "Needs machine learning (Level 3) - currently at Level 2 (closing adds +2.7% to overall match).",
            "Needs statistics (Level 3) - currently at Level 2 (closing adds +2.43% to overall match).",
            "Needs deep learning (Level 2) - currently at Level 0 (closing adds +3.75% to overall match)."
          ],
          "riasec_alignment_notes": "Strong psychological fit: both emphasize Investigative (Analytical/Research) traits.",
          "academic_fit_notes": "Degree directly aligns with preferred qualification: Computer Science. CGPA fairness rating: 93.33/100."
        },
        "skill_gaps": [
          {
            "skill_name": "machine learning",
            "current_level": 2,
            "required_level": 3,
            "gap": 1,
            "importance": "core",
            "priority": "MEDIUM",
            "potential_score_gain": 2.7,
            "resources": [
              {
                "title": "Applied Machine Learning with Scikit-Learn and PyTorch",
                "provider": "Coursera",
                "url": "https://coursera.org/learn/applied-machine-learning",
                "estimated_hours": 35,
                "difficulty_level": "Intermediate",
                "skill_name": "machine learning"
              }
            ]
          },
          {
            "skill_name": "deep learning",
            "current_level": 0,
            "required_level": 2,
            "gap": 2,
            "importance": "elective",
            "priority": "MEDIUM",
            "potential_score_gain": 3.75,
            "resources": [
              {
                "title": "Deep Learning Specialization",
                "provider": "DeepLearning.AI",
                "url": "https://deeplearning.ai/deep-learning-specialization",
                "estimated_hours": 40,
                "difficulty_level": "Advanced",
                "skill_name": "deep learning"
              }
            ]
          }
        ],
        "total_potential_gain": 12.35
      }
    ]
  },
  "message": "Generated 7 ranked career recommendations.",
  "error": null
}
```

---

## 4. What-If Simulation

### Request: What-If
`POST /api/v1/recommendations/what-if`
```bash
curl -X POST "http://localhost:8000/api/v1/recommendations/what-if" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "simulated_skills": [
         { "name": "machine learning", "level": 4 },
         { "name": "deep learning", "level": 3 },
         { "name": "statistics", "level": 4 }
       ],
       "simulated_cgpa": 8.9
     }'
```

### Response: 200 OK
```json
{
  "success": true,
  "data": {
    "diffs": [
      {
        "career_id": "career-ds-01",
        "career_title": "Data Scientist",
        "previous_score": 83.12,
        "new_score": 94.25,
        "score_delta": 11.13,
        "previous_rank": 1,
        "new_rank": 1,
        "rank_delta": 0,
        "previous_readiness": "HIGH_READINESS",
        "new_readiness": "HIGH_READINESS"
      }
    ],
    "simulated_recommendations": [ ... ]
  },
  "message": "What-If simulation completed successfully.",
  "error": null
}
```

---

## 5. Learning Roadmap

### Request: Get Roadmap
`GET /api/v1/roadmaps/career-ds-01`
```bash
curl -X GET "http://localhost:8000/api/v1/roadmaps/career-ds-01" \
     -H "Authorization: Bearer <TOKEN>"
```

### Response: 200 OK
```json
{
  "success": true,
  "data": {
    "career_id": "career-ds-01",
    "career_title": "Data Scientist",
    "total_duration_weeks": 14,
    "readiness_level": "HIGH_READINESS",
    "current_score": 83.12,
    "projected_score_after_roadmap": 95.47,
    "stages": [
      {
        "stage_number": 1,
        "stage_name": "Phase 1: Foundations & Prerequisites",
        "focus_skills": ["statistics"],
        "estimated_duration_weeks": 4,
        "weekly_hours_recommended": 10,
        "resources": [
          {
            "title": "Practical Statistics for Data Scientists",
            "provider": "O'Reilly",
            "url": "https://oreilly.com/library/view/practical-statistics-for-data-scientists",
            "estimated_hours": 25,
            "difficulty_level": "Intermediate",
            "skill_name": "statistics"
          }
        ],
        "milestone": {
          "title": "Foundational Knowledge Check",
          "description": "Build basic lab/code snippets demonstrating syntax and core concepts in statistics.",
          "estimated_week": 4,
          "associated_skills": ["statistics"]
        }
      },
      {
        "stage_number": 2,
        "stage_name": "Phase 2: Core Competencies & Practical Application",
        "focus_skills": ["machine learning"],
        "estimated_duration_weeks": 6,
        "weekly_hours_recommended": 12,
        "resources": [
          {
            "title": "Applied Machine Learning with Scikit-Learn and PyTorch",
            "provider": "Coursera",
            "url": "https://coursera.org/learn/applied-machine-learning",
            "estimated_hours": 35,
            "difficulty_level": "Intermediate",
            "skill_name": "machine learning"
          }
        ],
        "milestone": {
          "title": "Integration Mini-Project",
          "description": "Implement an applied mini-project integrating machine learning.",
          "estimated_week": 10,
          "associated_skills": ["machine learning"]
        }
      },
      {
        "stage_number": 3,
        "stage_name": "Phase 3: Advanced Specialization & Capstone",
        "focus_skills": ["deep learning", "data visualization"],
        "estimated_duration_weeks": 4,
        "weekly_hours_recommended": 10,
        "resources": [
          {
            "title": "Deep Learning Specialization",
            "provider": "DeepLearning.AI",
            "url": "https://deeplearning.ai/deep-learning-specialization",
            "estimated_hours": 40,
            "difficulty_level": "Advanced",
            "skill_name": "deep learning"
          }
        ],
        "milestone": {
          "title": "Capstone Portfolio Milestone",
          "description": "Build an end-to-end customer churn prediction pipeline with FastAPI inference API and interactive dashboard.",
          "estimated_week": 14,
          "associated_skills": ["deep learning", "data visualization"]
        }
      }
    ],
    "capstone_project": "Build an end-to-end customer churn prediction pipeline with FastAPI inference API and interactive dashboard."
  },
  "message": "Roadmap generated for 'Data Scientist'.",
  "error": null
}
```

---

## 6. AI Career Mentor Guidance (LLM)

### Request: Mentor Advice
`POST /api/v1/mentor/guidance`
```bash
curl -X POST "http://localhost:8000/api/v1/mentor/guidance" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "career_id": "career-ds-01",
       "specific_question": "How should I structure my GitHub projects to catch the eye of AI recruiters?"
     }'
```

### Response: 200 OK
```json
{
  "success": true,
  "data": {
    "career_title": "Data Scientist",
    "mentor_summary": "Hello Ananya Sharma, based on your background in B.Tech, you have achieved a 83.12% compatibility fit for the Data Scientist trajectory (HIGH_READINESS)...",
    "strengths_spotlight": [
      "Full proficiency match in key skills: python, sql, pandas.",
      "Academic degree and coursework strongly qualify for this role."
    ],
    "high_priority_action_items": [
      {
        "priority": "High",
        "action": "Upskill in 'deep learning' to reach target Level 2",
        "rationale": "Closing this gap addresses a core role requirement and yields a projected +3.75% score improvement."
      }
    ],
    "resume_keywords_to_highlight": [
      "Data Scientist competencies",
      "Production API integration",
      "Relational data modeling",
      "python",
      "sql"
    ],
    "interview_preparation_focus": [
      "Prepare to explain the trade-offs and architecture of key Data Scientist projects.",
      "Practice live coding problems focused on data structures and API error handling."
    ],
    "disclaimer": "Note: AI guidance provides qualitative coaching advice. Career scores and eligibility rankings are computed via the deterministic recommendation engine."
  },
  "message": "AI career mentor guidance generated.",
  "error": null
}
```
