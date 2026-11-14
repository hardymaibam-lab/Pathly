"""LLM Guidance Integration Module.
Provides AI Career Mentor advice while strictly isolating qualitative suggestions
from deterministic engine scores and rankings.
"""

from typing import List, Optional
from app.core.config import settings
from app.core.logging import logger
from app.schemas.llm import ActionItemSchema, MentorGuidanceResponse
from app.schemas.recommendation import CareerRecommendationItemSchema


class LLMMentorClient:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    def generate_mentor_guidance(
        self,
        candidate_name: str,
        recommendation: CareerRecommendationItemSchema,
        academic_degree: Optional[str] = None,
        user_question: Optional[str] = None,
    ) -> MentorGuidanceResponse:
        """Generate structured personalized career mentorship."""
        # Check if external API should be invoked or fallback mock
        if self.provider == "mock" or (not self.openai_key and not self.gemini_key):
            return self._generate_structured_fallback(
                candidate_name=candidate_name,
                rec=recommendation,
                degree=academic_degree,
                user_question=user_question,
            )

        # External LLM call (e.g. Gemini / OpenAI)
        try:
            return self._call_external_llm(candidate_name, recommendation, academic_degree, user_question)
        except Exception as e:
            logger.warning(f"External LLM generation failed: {e}. Falling back to rule-based mentor generator.")
            return self._generate_structured_fallback(
                candidate_name=candidate_name,
                rec=recommendation,
                degree=academic_degree,
                user_question=user_question,
            )

    def _generate_structured_fallback(
        self,
        candidate_name: str,
        rec: CareerRecommendationItemSchema,
        degree: Optional[str],
        user_question: Optional[str],
    ) -> MentorGuidanceResponse:
        """High-fidelity deterministic template ensuring zero-dependency reliability."""
        title = rec.career_title
        score = rec.composite_score
        readiness = rec.readiness_level

        # Synthesize overview
        summary = (
            f"Hello {candidate_name or 'Candidate'}, based on your background in {degree or 'your degree programme'}, "
            f"you have achieved a {score}% compatibility fit for the {title} trajectory ({readiness}). "
            f"Your technical profile exhibits solid foundational capability, and targeted development in core areas "
            f"will rapidly position you for top entry-level and internship roles."
        )
        if user_question:
            summary += f" Regarding your question ('{user_question}'): focus first on building verifiable code repositories."

        # Action items from skill gaps
        action_items: List[ActionItemSchema] = []
        high_gaps = [g for g in rec.skill_gaps if g.priority == "HIGH"]
        for g in high_gaps[:3]:
            action_items.append(
                ActionItemSchema(
                    priority="High",
                    action=f"Upskill in '{g.skill_name}' to reach target Level {g.required_level}",
                    rationale=f"Closing this gap addresses a core role requirement and yields a projected +{g.potential_score_gain}% score improvement.",
                )
            )

        if not action_items:
            action_items.append(
                ActionItemSchema(
                    priority="Medium",
                    action="Publish an end-to-end portfolio project with clean GitHub documentation",
                    rationale="Demonstrates practical engineering execution to hiring managers.",
                )
            )

        # Resume keywords
        resume_keywords = [
            f"{title} competencies",
            "Production API integration",
            "Unit testing and CI/CD",
            "Relational data modeling",
        ]
        if rec.explanation.strengths:
            resume_keywords.extend([s.split(":")[1].strip().split(".")[0] for s in rec.explanation.strengths if ":" in s])

        # Interview prep
        interview_prep = [
            f"Prepare to explain the trade-offs and architecture of key {title} projects.",
            "Practice live coding problems focused on data structures and API error handling.",
            "Review system architecture fundamentals relevant to scalable backend and cloud deployments.",
        ]

        return MentorGuidanceResponse(
            career_title=title,
            mentor_summary=summary,
            strengths_spotlight=rec.explanation.strengths,
            high_priority_action_items=action_items,
            resume_keywords_to_highlight=resume_keywords[:5],
            interview_preparation_focus=interview_prep,
        )

    def _call_external_llm(
        self,
        candidate_name: str,
        rec: CareerRecommendationItemSchema,
        degree: Optional[str],
        user_question: Optional[str],
    ) -> MentorGuidanceResponse:
        # Fallback to mock for zero dependencies
        return self._generate_structured_fallback(candidate_name, rec, degree, user_question)


llm_client = LLMMentorClient()
