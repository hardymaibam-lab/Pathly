"""LLM Guidance Schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field


class MentorGuidanceRequest(BaseModel):
    career_id: Optional[str] = None  # If omitted, generates advice for top-ranked career
    specific_question: Optional[str] = None


class ActionItemSchema(BaseModel):
    priority: str
    action: str
    rationale: str


class MentorGuidanceResponse(BaseModel):
    career_title: str
    mentor_summary: str
    strengths_spotlight: List[str]
    high_priority_action_items: List[ActionItemSchema]
    resume_keywords_to_highlight: List[str]
    interview_preparation_focus: List[str]
    disclaimer: str = (
        "Note: AI guidance provides qualitative coaching advice. "
        "Career scores and eligibility rankings are computed via the deterministic recommendation engine."
    )
