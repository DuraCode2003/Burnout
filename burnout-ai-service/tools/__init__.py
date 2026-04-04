"""
Tool Registry Initialization.

Exports three pre-configured registries:
- student_registry: All tools for student AI companion
- counselor_registry: Tools for counselor AI assistant
- proactive_registry: Tools for background proactive agent
"""

from .registry import ToolRegistry
from . import student_context
from . import mood_history
from . import intervention
from . import counselor_summary


def create_student_registry() -> ToolRegistry:
    """
    Create registry with all tools for student-facing AI companion.
    
    Tools available:
    - get_student_context: Full wellbeing context
    - get_mood_history: Detailed mood patterns
    - suggest_intervention: Wellness suggestions
    """
    registry = ToolRegistry()
    
    registry.register(student_context.SCHEMA, student_context.handler)
    registry.register(mood_history.SCHEMA, mood_history.handler)
    registry.register(intervention.SCHEMA, intervention.handler)
    
    return registry


def create_counselor_registry() -> ToolRegistry:
    """
    Create registry for counselor AI assistant.
    
    Tools available:
    - generate_counselor_summary: Clinical alert analysis
    - get_mood_history: Student mood patterns
    - get_student_context: Student context
    """
    registry = ToolRegistry()
    
    registry.register(counselor_summary.SCHEMA, counselor_summary.handler)
    registry.register(mood_history.SCHEMA, mood_history.handler)
    registry.register(student_context.SCHEMA, student_context.handler)
    
    return registry


def create_proactive_registry() -> ToolRegistry:
    """
    Create registry for background proactive agent.
    
    Proactive agent doesn't use tools during message generation
    (it fetches data beforehand), but this registry is available
    if needed.
    """
    registry = ToolRegistry()
    
    # Proactive agent primarily uses pre-fetched context
    # Tools available if needed for follow-up actions
    registry.register(student_context.SCHEMA, student_context.handler)
    registry.register(intervention.SCHEMA, intervention.handler)
    
    return registry


# Default exports
student_registry = create_student_registry()
counselor_registry = create_counselor_registry()
proactive_registry = create_proactive_registry()

# Also export individual components for custom registries
__all__ = [
    "ToolRegistry",
    "student_registry",
    "counselor_registry",
    "proactive_registry",
    "create_student_registry",
    "create_counselor_registry",
    "create_proactive_registry",
    # Individual tools
    "student_context",
    "mood_history",
    "intervention",
    "counselor_summary",
]
