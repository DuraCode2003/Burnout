"""
Intervention Tool - Suggest and log wellness interventions.

Replicates reference agent's tool schema format exactly.
Used to suggest breathing exercises, tips, reminders, or rest.
"""

import httpx
import random
from datetime import datetime
from typing import Optional

from .registry import create_tool_schema


SCHEMA = create_tool_schema(
    name="suggest_intervention",
    description="Suggest and log a specific wellness intervention for the student: breathing exercise, wellness tip, check-in reminder, or rest suggestion.",
    parameters={
        "type": {
            "type": "string",
            "enum": ["breathing", "tip", "reminder", "rest"],
            "description": "Type of intervention to suggest",
        },
        "reason": {
            "type": "string",
            "description": "Why this intervention is being suggested",
        },
    },
    required=["type", "reason"],
)

# Intervention templates
BREATHING_EXERCISES = [
    {
        "title": "Box Breathing",
        "description": "4 counts in, 4 hold, 4 out, 4 hold. Repeat 4 times.",
        "duration": "5 minutes",
        "link": "/breathing",
    },
    {
        "title": "4-7-8 Breathing",
        "description": "Inhale for 4, hold for 7, exhale for 8. Repeat 4 times.",
        "duration": "4 minutes",
        "link": "/breathing",
    },
    {
        "title": "Deep Belly Breathing",
        "description": "Place hand on belly, breathe deeply so hand rises. Slow and steady.",
        "duration": "3 minutes",
        "link": "/breathing",
    },
]

WELLNESS_TIPS = [
    "Take a 5-minute walk outside — sunlight and movement boost mood.",
    "Write down 3 things you're grateful for today.",
    "Drink a glass of water — dehydration can worsen stress.",
    "Step away from screens for 10 minutes. Your eyes and mind will thank you.",
    "Listen to your favorite calming song.",
    "Do a quick body scan: notice tension and consciously relax each muscle.",
    "Text a friend — social connection is powerful for wellbeing.",
    "Stretch for 2 minutes. Roll your shoulders, neck, and wrists.",
    "Practice the 5-4-3-2-1 grounding technique for anxiety.",
    "Set one small, achievable goal for today.",
]

CHECKIN_REMINDERS = [
    "Regular check-ins help you spot patterns early. You're doing great!",
    "Tracking your mood is a sign of self-awareness. Keep it up!",
    "Every check-in is a step towards better wellbeing.",
    "Consistency matters more than perfection. Just show up.",
]

REST_SUGGESTIONS = [
    "Take a 20-minute power nap if you can. Set an alarm!",
    "Put your phone away and rest your eyes for 10 minutes.",
    "Consider an early night tonight — your body needs recovery.",
    "Take a break from studying. Your brain consolidates learning during rest.",
    "Do something purely for enjoyment today, no productivity pressure.",
]


def get_daily_tip() -> dict:
    """Get a wellness tip (rotates based on day of year)."""
    day_of_year = datetime.now().timetuple().tm_yday
    index = day_of_year % len(WELLNESS_TIPS)
    return {"title": "Wellness Tip", "description": WELLNESS_TIPS[index]}


def get_checkin_reminder() -> dict:
    """Get a check-in reminder."""
    return {
        "title": "Check-in Reminder",
        "description": random.choice(CHECKIN_REMINDERS),
    }


def get_rest_suggestion() -> dict:
    """Get a rest suggestion."""
    return {"title": "Rest Suggestion", "description": random.choice(REST_SUGGESTIONS)}


async def handler(arguments: dict, context: dict) -> str:
    """
    Suggest and log a wellness intervention.
    
    Args:
        arguments: Contains 'type' and 'reason'
        context: Contains 'token' (JWT), 'user_id', 'spring_boot_url'
        
    Returns:
        Formatted intervention suggestion
    """
    intervention_type = arguments.get("type", "tip")
    reason = arguments.get("reason", "General wellness support")

    user_id = context.get("user_id", "")
    token = context.get("token", "")
    base_url = context.get("spring_boot_url", "http://localhost:8080")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # Get intervention content
    interventions = {
        "breathing": random.choice(BREATHING_EXERCISES),
        "tip": get_daily_tip(),
        "reminder": get_checkin_reminder(),
        "rest": get_rest_suggestion(),
    }

    intervention = interventions.get(intervention_type, get_daily_tip())

    # Try to log intervention to backend
    logged = False
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{base_url}/api/interventions/log",
                headers=headers,
                json={
                    "userId": user_id,
                    "type": intervention_type.upper(),
                    "reason": reason,
                    "details": intervention.get("description", ""),
                },
                timeout=5.0,
            )
            logged = resp.status_code in (200, 201)
    except Exception:
        pass  # Logging is optional, don't fail the intervention

    # Build formatted output
    lines = [
        "INTERVENTION SUGGESTION:",
        "",
        f"Type: {intervention_type.upper()}",
        f"Reason: {reason}",
        "",
        f"## {intervention.get('title', 'Wellness Activity')}",
        "",
        f"{intervention.get('description', 'Take a moment for yourself.')}",
    ]

    if intervention.get("duration"):
        lines.append(f"\nDuration: {intervention['duration']}")

    if intervention.get("link"):
        lines.append(f"\nAccess: {intervention['link']}")

    lines.append("")
    lines.append(f"Logged: {'Yes' if logged else 'No (offline mode)'}")

    # Add personalized encouragement based on type
    encouragements = {
        "breathing": "Remember: breathing is something you can do anywhere, anytime. It's always available to help you reset.",
        "tip": "Small actions add up. Pick one tip and try it today.",
        "reminder": "You're building a healthy habit. Every check-in counts!",
        "rest": "Rest is productive. Your brain and body need recovery time to function at your best.",
    }

    lines.append("")
    lines.append(encouragements.get(intervention_type, "You've got this!"))

    return "\n".join(lines)
