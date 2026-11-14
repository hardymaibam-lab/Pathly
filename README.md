# Pathly — AI-Powered Career Path Recommendation Platform

Pathly is an enterprise-grade, client-side SaaS platform designed to guide tech students and emerging software engineers from vocational interest evaluation to industry placement.

The frontend is architected independently with a decoupled API service layer, isolated mock adapters, and strict TypeScript interfaces ready for immediate connection to a FastAPI and PostgreSQL backend.

---

## 1. Technology Stack

- **Framework:** React 18 with TypeScript 5
- **Bundler & Tooling:** Vite 5 (with Rollup WASM optimization for enterprise security policies)
- **Styling & UI:** Tailwind CSS 3 (Linear / Vercel dark aesthetic, custom glass panels, subtle glowing gradients)
- **Routing:** React Router v6
- **Server State & Caching:** TanStack Query v5 (`@tanstack/react-query`)
- **Forms & Validation:** React Hook Form + Zod (`@hookform/resolvers/zod`)
- **Data Visualizations:** Recharts (Psychometric Radar charts, Category Bar charts, Horizontal Proficiency Benchmarks)
- **Iconography:** Lucide Icons (`lucide-react`)

---

## 2. System Architecture & Backend Decoupling

The platform follows a centralized API service pattern with zero hardcoded mock values in UI components:

```
src/
├── types/                 # Shared TypeScript models adhering to API_CONTRACT.md
│   ├── api.ts            # Response envelopes, error models, pagination
│   ├── auth.ts           # User, session tokens, login/register payloads
│   ├── assessment.ts     # 36 RIASEC question definitions, 7-step onboarding state
│   ├── career.ts         # Career recommendations, score breakdown, required skills
│   ├── skills.ts         # Skill gap items, priority rankings, score uplifts
│   ├── roadmap.ts        # Stages, milestones, project tasks, weekly availability
│   └── user.ts           # Student profile, academic credentials, settings
├── services/              # Centralized REST client with switchable mock adapter
│   ├── api.ts            # Configurable fetch client with Bearer auth headers
│   ├── authService.ts
│   ├── assessmentService.ts
│   ├── dashboardService.ts
│   ├── careerService.ts
│   ├── skillService.ts
│   ├── roadmapService.ts
│   └── profileService.ts
├── mocks/                 # Fully isolated mock adapters with localStorage persistence
│   ├── riasecQuestions.ts# 36 complete Holland RIASEC questions (6 per dimension)
│   ├── mockData.ts       # Cohesive, realistic SaaS datasets
│   └── mockAdapter.ts    # Latency-simulated async adapter implementing API contract
└── features/ & pages/     # Reusable UI components & application views
```

### 1-Step Backend Integration
To switch from development mock adapters to your teammate's live FastAPI backend:

1. In `.env`, set:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_USE_MOCKS=false
   ```
2. No UI components or hooks require changes. The service layer (`src/services/api.ts`) transparently dispatches HTTP requests conforming to `API_CONTRACT.md`.

---

## 3. Application Pages & Capabilities

### A. Public Website (`/`)
- **Interactive Hero Section:** Dynamic preview card demonstrating real-time compatibility score synthesis for Machine Learning, Full-Stack, and Cloud tracks.
- **4-Step Methodology ("How It Works"):** Clear visual progression from RIASEC psychometrics to compatibility synthesis, skill gap radar, and roadmap execution.
- **Platform Features Grid:** Clean Linear-styled cards highlighting multi-factor scoring, what-if simulators, and weekly study schedulers.
- **Career Preview:** High-growth career cards with median salaries and live match scores.
- **Accessible Footer:** Quick navigation, technology stack details, and API versioning information.

### B. Authentication (`/login`, `/register`)
- **Validation:** React Hook Form + Zod schema validation with clear inline error messaging.
- **Security UX:** Password visibility toggle (Eye/EyeOff), password confirmation, and terms acceptance check.
- **1-Click Demo Account:** Integrated test button for instant examiner and evaluator access without manual typing.
- **Loading & Error Banners:** Visual feedback on submission and authentication failures.

### C. Multi-Step Student Onboarding (`/onboarding`)
A 7-step onboarding funnel equipped with real-time progress bar, previous/next controls, and save-and-resume draft capabilities:
1. **Personal Information:** Name, email, phone, location, and professional headline.
2. **Academic Background:** Degree program, major, institution, graduation year, GPA, and coursework tags.
3. **Technical Skills:** Self-assessed proficiencies (Beginner, Intermediate, Advanced, Expert) with quick-add chips for popular stacks (Python, PyTorch, React, Docker, FastAPI, PostgreSQL).
4. **Soft Skills:** Collaborative, architectural, and communication strengths.
5. **RIASEC Assessment (36 Questions):** Holland's 6 dimensions (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) featuring exactly 6 questions each (36 total) on a 5-point Likert scale (1 to 5), with dimension progress indicators and a one-click auto-fill helper for test evaluations.
6. **Career Preferences:** Target roles, work style preferences (Remote, Hybrid, On-site, Flexible), minimum salary slider, and company size preferences.
7. **Weekly Availability:** Study hours slider (5 to 35 hrs/wk), preferred weekdays/weekends schedule selector, and target timeline (3, 6, 12 months).

### D. Student Dashboard (`/dashboard`)
- **Key Metrics Grid:** Career Readiness Score, Profile Completion percentage, Skills Portfolio (Proficient vs Gaps), and Roadmap Velocity.
- **Holland RIASEC Radar Chart:** Recharts radar displaying psychometric affinity across all 6 dimensions.
- **Domain Balance Bar Chart:** Visualizes current strengths versus identified learning gaps by domain.
- **Top Career Recommendations:** Ranked cards with radial compatibility gauges and readiness badges.
- **Active Milestone Banner & Recent Activity Feed:** Live tracking of completed tasks and unlocked credentials.

### E. Career Recommendations (`/careers`, `/careers/:id`)
- **Filterable Catalog:** Filter by readiness level (`Ready Now`, `Minor Upskilling`, `Moderate Upskilling`), search by title or skill, and sort by compatibility score.
- **Detailed Career Dossier (`/careers/:id`):**
  - High-level overview & industry outlook.
  - Multi-factor score breakdown (Skill fit, Interest affinity, Academic relevance, Market demand).
  - Holland RIASEC code alignment analysis.
  - Verified strengths vs priority skill gaps.
  - Required Technical Competency Matrix table with current student level vs required level.

### F. Skill Gap Radar & Analysis (`/skills`)
- **Current vs Required Proficiency Benchmark:** Comparative bar chart contrasting current level against industry target.
- **Interactive Score Simulator:** Check off specific skills in your sprint to watch your readiness index jump in real time (+6%, +12%, etc.).
- **Detailed Gap Breakdown Table:** Priority badges (`Critical`, `High`, `Medium`, `Low`), estimated weeks to bridge, and direct sprint selection.

### G. Personalized Learning Roadmap (`/roadmap`)
- **Multi-Stage Curriculum:**
  - Stage 1: Foundational Systems & Deep Learning Core (Weeks 1-4)
  - Stage 2: High-Throughput Model Serving & Inference Optimization (Weeks 5-8)
  - Stage 3: Retrieval Augmented Generation (RAG) & Vector Pipelines (Weeks 9-12)
  - Stage 4: Production Capstone, Distributed Training & Portfolio (Weeks 13-16)
- **Interactive Task Checklist:** Clickable checkboxes that update completion state, trigger cache invalidation, and dynamically calculate roadmap progress.
- **Weekly Learning Schedule Widget:** Breakdown by day and study hours matching the student's onboarding preferences.
- **Curated Learning Resources:** High-signal courses, official documentation, books, and GitHub repositories with difficulty ratings and direct links.

### H. Profile & Settings (`/profile`)
- **Tabbed Management:** Academic credentials, technical skills with proficiency editors, career preferences, weekly study hours, and notification preferences.
- **Integration Status:** Live indicator showing whether the platform is currently operating on the isolated mock adapter or connected to FastAPI.

---

## 4. Local Setup & Execution Instructions

### Prerequisites
- Node.js (v18.0.0 or later, v20+ recommended)
- npm or pnpm

### Installation

1. Clone or extract the repository:
   ```bash
   cd pathly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Build for production:
   ```bash
   npm run build
   ```

6. Preview production build locally:
   ```bash
   npm run preview
   ```

---

## 5. Verification & Test Credentials

- **Demo Account:**
  - **Email:** `alex.chen@pathly.ai`
  - **Password:** `Password123!`
  - Or click the **Auto-fill** button directly on the `/login` screen.
- **Quick Evaluation:**
  - On Step 5 of the Onboarding screen (`/onboarding`), click **Auto-Fill Responses** to instantaneously answer all 36 RIASEC questions with realistic engineering student values and test the synthesis transition.
  - On the Learning Roadmap screen (`/roadmap`), click task checkboxes to observe instantaneous progress recalculation.
  - On the Skill Gap Radar screen (`/skills`), toggle skills in the simulator to see live score uplift.

---

## 6. Handover Verification Summary

| Deliverable | Status | Details |
|---|---|---|
| Complete React Source Code | Complete | Structured under `src/` with feature-based modularity |
| Reusable UI Components | Complete | Button, Input, Card, Badge, ProgressBar, ScoreGauge, Modal, Skeleton, EmptyState, ErrorState |
| TypeScript API Interfaces | Complete | `src/types/` covering all data models and envelopes |
| Centralized API Service Layer | Complete | `src/services/` with decoupled client and Bearer token handling |
| Isolated Mock Adapters | Complete | `src/mocks/` with localStorage state persistence |
| 36-Question RIASEC Assessment | Complete | Holland 6 dimensions, 6 questions each, 5-point Likert scale |
| Production Build Verification | Complete | `tsc && vite build` builds with 0 errors and optimized chunking |
| API Contract Reference | Complete | Documented in `API_CONTRACT.md` |
