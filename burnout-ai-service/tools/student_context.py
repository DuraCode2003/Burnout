"""
Student Context Tool - Get complete wellbeing context.

Replicates reference agent's tool schema format exactly.
Used at START of every conversation to give LLM full context.
"""

import httpx
from typing import Optional

from .registry import create_tool_schema


SCHEMA = create_tool_schema(
    name="get_student_context",
    description="Get the current student's complete wellbeing context including burnout score, risk level, recent mood trend, and personalized baseline. Use this at the START of every conversation.",
    parameters={},
    required=[],
)


async def handler(arguments: dict, context: dict) -> str:
    """
    Get student's complete wellbeing context from Spring Boot.
    
    Args:
        arguments: Tool arguments (empty for this tool)
        context: Contains 'token' (JWT) and 'spring_boot_url'
        
    Returns:
        Formatted context string for LLM
    """
    token = context.get("token", "")
    base_url = context.get("spring_boot_url", "http://localhost:8080")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        # Get burnout score
        burnout_data = None
        try:
            resp = await client.get(
                f"{base_url}/api/burnout/score",
                headers=headers,
                timeout=5.0,
            )
            if resp.status_code == 200:
                burnout_data = resp.json()
        except Exception:
            pass

        # Get mood history (7 days)
        mood_data = None
        try:
            resp = await client.get(
                f"{base_url}/api/mood/history?days=7",
                headers=headers,
                timeout=5.0,
            )
            if resp.status_code == 200:
                mood_data = resp.json()
        except Exception:
            pass

        # Get insights overview
        insights_data = None
        try:
            resp = await client.get(
                f"{base_url}/api/insights/overview?period=7",
                headers=headers,
                timeout=5.0,
            )
            if resp.status_code == 200:
                insights_data = resp.json()
        except Exception:
            pass

        # Get active alerts
        alerts_data = None
        try:
            resp = await client.get(
                f"{base_url}/api/alerts/active",
                headers=headers,
                timeout=5.0,
            )
            if resp.status_code == 200:
                alerts_data = resp.json()
        except Exception:
            pass

    # Build formatted context string
    lines = ["STUDENT CONTEXT:"]

    # Burnout score
    if burnout_data:
        score = burnout_data.get("score", "N/A")
        risk = burnout_data.get("riskLevel", "N/A")
        method = burnout_data.get("calculationMethod", "")
        created = burnout_data.get("createdAt", "")

        lines.append(f"Current burnout score: {score}/100 ({risk} risk)")

        if method:
            lines.append(f"Calculation method: {method}")
        if created:
            lines.append(f"Last calculated: {created}")
    else:
        lines.append("Current burnout score: UNAVAILABLE")

    lines.append("")

    # Mood trends
    if mood_data and len(mood_data) > 0:
        avg_mood = sum(m.get("moodScore", 0) for m in mood_data) / len(mood_data)
        avg_sleep = sum(float(m.get("sleepHours", 0)) for m in mood_data) / len(mood_data)

        # Count stress levels
        stress_counts = {}
        for m in mood_data:
            stress = m.get("stressLevel", "UNKNOWN")
            stress_counts[stress] = stress_counts.get(stress, 0) + 1

        dominant_stress = max(stress_counts, key=stress_counts.get) if stress_counts else "UNKNOWN"

        lines.append(f"Last 7 days mood average: {avg_mood:.1f}/10")
        lines.append(f"Last 7 days sleep average: {avg_sleep:.1f} hours")
        lines.append(f"Dominant stress level: {dominant_stress} ({stress_counts.get(dominant_stress, 0)} of 7 days)")
    else:
        lines.append("Last 7 days mood average: NO DATA")
        lines.append("Last 7 days sleep average: NO DATA")

    lines.append("")

    # Baseline comparison (from insights)
    if insights_data:
        mood_trend = insights_data.get("moodTrend", [])
        if mood_trend and len(mood_trend) >= 2:
            recent = mood_trend[-1].get("avgMood", 0)
            previous = mood_trend[-2].get("avgMood", 0)
            change = recent - previous
            direction = "ABOVE" if change > 0 else "BELOW"
            lines.append(f"Mood is {abs(change):.1f} points {direction} previous period")

        sleep_data = insights_data.get("sleepData", {})
        if sleep_data:
            current = sleep_data.get("avgSleepHours", 0)
            baseline = sleep_data.get("baselineSleepHours", current)
            diff = current - baseline
            direction = "ABOVE" if diff > 0 else "BELOW"
            lines.append(f"Sleep is {abs(diff):.1f} hours {direction} personal baseline")
    else:
        lines.append("Baseline comparison: UNAVAILABLE")

    lines.append("")

    # Active alerts
    if alerts_data and len(alerts_data) > 0:
        latest_alert = alerts_data[0]
        alert_type = latest_alert.get("alertType", "UNKNOWN")
        trigger = latest_alert.get("triggerReason", "Unknown trigger")
        created = latest_alert.get("createdAt", "Unknown time")

        lines.append(f"Active alert: {alert_type} ({trigger})")
        lines.append(f"Alert triggered: {created}")
    else:
        lines.append("Active alert: NONE")

    lines.append("")

    # Check-in streak
    if insights_data:
        streak = insights_data.get("checkInStreak", 0)
        lines.append(f"Last check-in streak: {streak} days")
    else:
        lines.append("Last check-in streak: UNAVAILABLE")

    return "\n".join(lines)
