"""
Mood History Tool - Get detailed mood entries.

Replicates reference agent's tool schema format exactly.
Used when student asks about patterns or needs more detail.
"""

import httpx
from typing import Optional

from .registry import create_tool_schema


SCHEMA = create_tool_schema(
    name="get_mood_history",
    description="Get detailed mood, sleep and stress entries for the past N days. Use when student asks about their patterns or when you need more detail.",
    parameters={
        "days": {
            "type": "integer",
            "description": "Number of days to fetch (1-30)",
            "default": 7,
        },
    },
    required=[],
)


async def handler(arguments: dict, context: dict) -> str:
    """
    Get detailed mood history from Spring Boot.
    
    Args:
        arguments: Contains 'days' (default 7)
        context: Contains 'token' (JWT) and 'spring_boot_url'
        
    Returns:
        Formatted mood history string for LLM
    """
    days = arguments.get("days", 7)
    # Clamp to valid range
    days = max(1, min(30, days))

    token = context.get("token", "")
    base_url = context.get("spring_boot_url", "http://localhost:8080")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{base_url}/api/mood/history?days={days}",
                headers=headers,
                timeout=5.0,
            )

            if resp.status_code != 200:
                return f"Error: Failed to fetch mood history (HTTP {resp.status_code})"

            mood_data = resp.json()

        except httpx.ConnectError:
            return "Error: Cannot connect to backend service"
        except Exception as e:
            return f"Error: {str(e)}"

    if not mood_data or len(mood_data) == 0:
        return "MOOD HISTORY:\nNo mood entries found for this period."

    # Build formatted output
    lines = [f"MOOD HISTORY (Last {days} days):", ""]

    # Calculate statistics
    total_entries = len(mood_data)
    avg_mood = sum(m.get("moodScore", 0) for m in mood_data) / total_entries
    avg_sleep = sum(float(m.get("sleepHours", 0)) for m in mood_data) / total_entries

    # Count stress levels
    stress_counts = {}
    for m in mood_data:
        stress = m.get("stressLevel", "UNKNOWN")
        stress_counts[stress] = stress_counts.get(stress, 0) + 1

    # Find trends
    if len(mood_data) >= 2:
        first_half = mood_data[: len(mood_data) // 2]
        second_half = mood_data[len(mood_data) // 2 :]

        first_avg = sum(m.get("moodScore", 0) for m in first_half) / len(first_half)
        second_avg = sum(m.get("moodScore", 0) for m in second_half) / len(second_half)

        trend = "IMPROVING" if second_avg > first_avg else "DECLINING" if second_avg < first_avg else "STABLE"
    else:
        trend = "INSUFFICIENT_DATA"

    lines.append(f"Total entries: {total_entries}")
    lines.append(f"Average mood score: {avg_mood:.1f}/10")
    lines.append(f"Average sleep: {avg_sleep:.1f} hours")
    lines.append(f"Mood trend: {trend}")
    lines.append("")

    lines.append("Stress level distribution:")
    for stress, count in sorted(stress_counts.items()):
        pct = (count / total_entries) * 100
        lines.append(f"  - {stress}: {count} days ({pct:.0f}%)")

    lines.append("")
    lines.append("Recent entries:")

    # Show last 5 entries in detail
    recent = mood_data[-5:] if len(mood_data) > 5 else mood_data
    for entry in reversed(recent):
        date = entry.get("createdAt", "Unknown date")[:10]  # Just date part
        mood = entry.get("moodScore", "N/A")
        sleep = entry.get("sleepHours", "N/A")
        stress = entry.get("stressLevel", "N/A")
        note = entry.get("note", "")

        line = f"  {date}: Mood {mood}/10, Sleep {sleep}h, Stress {stress}"
        if note:
            # Truncate long notes
            note_preview = note[:50] + "..." if len(note) > 50 else note
            line += f"\n    Note: {note_preview}"

        lines.append(line)

    # Add sleep pattern analysis
    lines.append("")
    lines.append("Sleep pattern:")

    if len(mood_data) >= 7:
        good_sleep = sum(1 for m in mood_data if float(m.get("sleepHours", 0)) >= 7)
        poor_sleep = sum(1 for m in mood_data if float(m.get("sleepHours", 0)) < 6)
        lines.append(f"  - Good sleep (7+ hrs): {good_sleep} nights")
        lines.append(f"  - Poor sleep (<6 hrs): {poor_sleep} nights")
    else:
        lines.append("  Insufficient data for sleep pattern analysis")

    return "\n".join(lines)
