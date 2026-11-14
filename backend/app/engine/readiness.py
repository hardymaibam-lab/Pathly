"""Readiness Classifier.
Pure Python, zero framework dependencies.
"""

from app.engine.types import ReadinessLevel


def classify_readiness(composite_score: float) -> ReadinessLevel:
    """Classify readiness level based on deterministic score thresholds."""
    if composite_score >= 80.0:
        return ReadinessLevel.HIGH_READINESS
    elif composite_score >= 65.0:
        return ReadinessLevel.MODERATE_READINESS
    elif composite_score >= 50.0:
        return ReadinessLevel.DEVELOPING
    else:
        return ReadinessLevel.EXPLORATORY


def get_readiness_label(level: ReadinessLevel) -> str:
    """Return user-friendly description of readiness state."""
    descriptions = {
        ReadinessLevel.HIGH_READINESS: "High Readiness: Ready for job applications and internship placements.",
        ReadinessLevel.MODERATE_READINESS: "Moderate Readiness: Solid foundation, targeted upskilling recommended.",
        ReadinessLevel.DEVELOPING: "Developing: Foundational match, core skill development required.",
        ReadinessLevel.EXPLORATORY: "Exploratory: Significant learning pathway needed before role entry.",
    }
    return descriptions.get(level, "Unknown readiness")
