"""
Counselor Summary Tool - Generate clinical alert summary.

Replicates reference agent's tool schema format exactly.
Used by counselor AI assistant to analyze student alerts.
"""

import httpx
from typing import Optional
from datetime import datetime

from .registry import create_tool_schema


SCHEMA = create_tool_schema(
    name="generate_counselor_summary",
    description="Generate a clinical summary of a student alert for the counselor. Analyzes patterns, identifies risk factors, and suggests approach.",
    parameters={
        "alert_id": {
            "type": "string",
            "description": "The alert UUID to summarize",
        },
    },
    required=["alert_id"],
)


async def handler(arguments: dict, context: dict) -> str:
    """
    Generate clinical summary data for counselor review.
    
    Args:
        arguments: Contains 'alert_id'
        context: Contains 'token' (JWT), 'spring_boot_url'
        
    Returns:
        Structured data string for LLM to analyze
    """
    alert_id = arguments.get("alert_id", "")

    token = context.get("token", "")
    base_url = context.get("spring_boot_url", "http://localhost:8080")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        # Get alert details
        alert_data = None
        user_id = None
        try:
            resp = await client.get(
                f"{base_url}/api/counselor/alerts/{alert_id}",
                headers=headers,
                timeout=5.0,
            )
            if resp.status_code == 200:
                alert_data = resp.json()
                user_id = alert_data.get("userId")
        except Exception:
            pass

        # Get mood history (30 days for pattern analysis)
        mood_data = []
        if user_id:
            try:
                resp = await client.get(
                    f"{base_url}/api/mood/history?days=30",
                    headers=headers,
                    timeout=5.0,
                )
                if resp.status_code == 200:
                    mood_data = resp.json()
            except Exception:
                pass

        # Get burnout history
        burnout_data = []
        if user_id:
            try:
                resp = await client.get(
                    f"{base_url}/api/burnout/history?days=30",
                    headers=headers,
                    timeout=5.0,
                )
                if resp.status_code == 200:
                    burnout_data = resp.json()
            except Exception:
                pass

        # Get student info (for department, etc)
        student_info = None
        if user_id:
            try:
                resp = await client.get(
                    f"{base_url}/api/users/{user_id}",
                    headers=headers,
                    timeout=5.0,
                )
                if resp.status_code == 200:
                    student_info = resp.json()
            except Exception:
                pass

        # Get previous alerts
        previous_alerts = []
        if user_id:
            try:
                resp = await client.get(
                    f"{base_url}/api/alerts/user/{user_id}?limit=5",
                    headers=headers,
                    timeout=5.0,
                )
                if resp.status_code == 200:
                    all_alerts = resp.json()
                    # Filter out current alert
                    previous_alerts = [a for a in all_alerts if a.get("id") != alert_id][:5]
            except Exception:
                pass

    # Build formatted output
    lines = ["ALERT DATA FOR COUNSELOR SUMMARY:", ""]

    # Alert details
    if alert_data:
        alert_type = alert_data.get("alertType", "UNKNOWN")
        risk_level = alert_data.get("riskLevel", "UNKNOWN")
        trigger = alert_data.get("triggerReason", "Unknown trigger")
        score = alert_data.get("burnoutScore", "N/A")
        created = alert_data.get("createdAt", "Unknown time")
        status = alert_data.get("status", "UNKNOWN")

        lines.append(f"Alert type: {alert_type}")

        if student_info:
            dept = student_info.get("department", "Unknown dept")
            lines.append(f"Student: {student_info.get('name', 'Student')} ({dept})")
        else:
            lines.append(f"Student ID: {user_id or 'N/A'}")

        lines.append(f"Triggered: {created}")
        lines.append(f"Trigger reason: {trigger}")
        lines.append(f"Burnout score: {score}")
        lines.append(f"Risk level: {risk_level}")
        lines.append(f"Status: {status}")
    else:
        lines.append("Alert details: UNAVAILABLE")

    lines.append("")

    # Pattern analysis
    lines.append("Pattern analysis (30 days):")

    if burnout_data and len(burnout_data) >= 2:
        # Calculate burnout trend
        first = burnout_data[0].get("score", 0)
        last = burnout_data[-1].get("score", 0)
        change = last - first
        trend = "↑" if change > 0 else "↓" if change < 0 else "→"

        scores = [b.get("score", 0) for b in burnout_data]
        lines.append(f"- Burnout score: {first:.0f} → {last:.0f} ({trend} {abs(change):.0f})")
    else:
        lines.append("- Burnout trend: INSUFFICIENT DATA")

    if mood_data and len(mood_data) >= 2:
        # Mood trend
        moods = [m.get("moodScore", 0) for m in mood_data]
        first_half = moods[: len(moods) // 2]
        second_half = moods[len(moods) // 2 :]

        first_avg = sum(first_half) / len(first_half) if first_half else 0
        second_avg = sum(second_half) / len(second_half) if second_half else 0

        lines.append(f"- Mood scores: avg {first_avg:.1f} → avg {second_avg:.1f}")

        # Sleep trend
        sleeps = [float(m.get("sleepHours", 0)) for m in mood_data]
        avg_sleep = sum(sleeps) / len(sleeps) if sleeps else 0
        lines.append(f"- Sleep: avg {avg_sleep:.1f} hours")

        # Stress distribution
        stress_counts = {}
        for m in mood_data:
            stress = m.get("stressLevel", "UNKNOWN")
            stress_counts[stress] = stress_counts.get(stress, 0) + 1

        stress_str = ", ".join(f"{k}: {v}" for k, v in sorted(stress_counts.items()))
        lines.append(f"- Stress: {stress_str}")

        # Note sentiment (if available)
        notes_with_sentiment = [m for m in mood_data if m.get("sentimentScore")]
        if notes_with_sentiment:
            avg_sentiment = sum(m.get("sentimentScore", 0) for m in notes_with_sentiment) / len(notes_with_sentiment)
            sentiment_label = "positive" if avg_sentiment > 0.3 else "negative" if avg_sentiment < -0.3 else "neutral"
            lines.append(f"- Notes sentiment: {sentiment_label} (avg: {avg_sentiment:.2f})")
    else:
        lines.append("- Mood patterns: INSUFFICIENT DATA")

    lines.append("")

    # Previous alerts
    if previous_alerts:
        lines.append(f"Previous alerts: {len(previous_alerts)}")
        for prev in previous_alerts[:3]:
            prev_type = prev.get("alertType", "UNKNOWN")
            prev_date = prev.get("createdAt", "Unknown")[:10]
            prev_status = prev.get("status", "UNKNOWN")
            lines.append(f"  - {prev_date}: {prev_type} ({prev_status})")
    else:
        lines.append("Previous alerts: None")

    lines.append("")

    # Engagement indicators
    lines.append("Engagement indicators:")

    if mood_data:
        total_checkins = len(mood_data)
        lines.append(f"- Total check-ins (30 days): {total_checkins}")

        # Calculate streak
        streak = 0
        today = datetime.now().date()
        for i, m in enumerate(reversed(mood_data)):
            try:
                entry_date = datetime.fromisoformat(m.get("createdAt", "")[:10]).date()
                days_ago = (today - entry_date).days
                if days_ago <= i + 1:
                    streak += 1
                else:
                    break
            except Exception:
                pass

        lines.append(f"- Current streak: {streak} days")

        # Consistency
        if total_checkins >= 14:
            lines.append("- Engagement: HIGH (consistent tracking)")
        elif total_checkins >= 7:
            lines.append("- Engagement: MODERATE")
        else:
            lines.append("- Engagement: LOW (sporadic tracking)")
    else:
        lines.append("- Engagement: NO DATA")

    lines.append("")

    # Risk factors (derived from data)
    lines.append("Potential risk factors:")

    risk_factors = []

    if alert_data and alert_data.get("alertType") == "RED":
        risk_factors.append("RED alert (highest severity)")

    if burnout_data and len(burnout_data) >= 2:
        if burnout_data[-1].get("score", 0) > burnout_data[0].get("score", 0) + 10:
            risk_factors.append("Rapidly increasing burnout (+10+ points)")

    if mood_data:
        recent_moods = [m.get("moodScore", 5) for m in mood_data[-7:]]
        if recent_moods and sum(recent_moods) / len(recent_moods) < 3:
            risk_factors.append("Very low recent mood scores (<3/10)")

        low_sleep = sum(1 for m in mood_data if float(m.get("sleepHours", 0)) < 5)
        if low_sleep >= 3:
            risk_factors.append("Multiple nights of very poor sleep (<5hrs)")

    if not risk_factors:
        risk_factors.append("No acute risk factors identified")

    for factor in risk_factors:
        lines.append(f"  - {factor}")

    lines.append("")

    # Protective factors
    lines.append("Protective factors:")

    protective = []

    if mood_data and len(mood_data) >= 14:
        protective.append("Consistent check-in habit")

    if mood_data:
        notes_count = sum(1 for m in mood_data if m.get("note"))
        if notes_count >= 5:
            protective.append("Reflective journaling")

    if previous_alerts and all(a.get("status") == "RESOLVED" for a in previous_alerts):
        protective.append("Previous alerts successfully resolved")

    if not protective:
        protective.append("Engaged with tracking system")

    for factor in protective:
        lines.append(f"  - {factor}")

    return "\n".join(lines)
