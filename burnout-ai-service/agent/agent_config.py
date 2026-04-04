"""
Agent Configuration - Environment-based settings.

Replicates reference agent's configuration patterns:
- Environment variables for all settings
- Separate configs for different use cases
- Constants for common values
"""

import os

# ============================================================================
# Core Configuration (from environment)
# ============================================================================

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:0.5b")

BACKEND_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

# ============================================================================
# Agent Loop Limits (same concept as reference agent)
# ============================================================================

MAX_TOOL_ITERATIONS = 5  # Max tool call iterations per turn
MAX_HISTORY_MESSAGES = 50  # Same as HISTORY_PAGE_SIZE in sessionHistory.ts
STREAM_CHUNK_SIZE = 50  # Characters per SSE chunk

# Retry configuration (same pattern as reference)
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 1.0
REQUEST_TIMEOUT_SECONDS = 60

# ============================================================================
# Feature-Specific LLM Configs
# ============================================================================

STUDENT_COMPANION_CONFIG = {
    "temperature": 0.7,  # Balanced creativity/coherence
    "max_tokens": 1024,
    "stream": True,  # Real-time streaming for chat
    "top_p": 0.9,
}

PROACTIVE_AGENT_CONFIG = {
    "temperature": 0.6,  # Slightly less creative for consistency
    "max_tokens": 512,
    "stream": False,  # Background agent doesn't need streaming
    "top_p": 0.85,
}

COUNSELOR_ASSISTANT_CONFIG = {
    "temperature": 0.4,  # More factual/analytical
    "max_tokens": 2048,
    "stream": True,  # Stream for better UX
    "top_p": 0.8,
}

# ============================================================================
# System Prompts (structured format)
# ============================================================================

from pydantic import BaseModel


class SystemPrompt(BaseModel):
    """
    Structured system prompt.
    Same concept as reference agent's system message handling.
    """
    
    role: str
    context: str
    instructions: list[str]
    constraints: list[str]
    tone: str
    
    def format(self) -> str:
        """Format as single prompt string."""
        parts = [
            f"You are {self.role}.",
            f"\n## Context\n{self.context}",
            f"\n## Instructions\n" + "\n".join(f"- {i}" for i in self.instructions),
            f"\n## Constraints\n" + "\n".join(f"- {c}" for c in self.constraints),
            f"\n## Tone\n{self.tone}",
        ]
        return "\n".join(parts)


# ============================================================================
# Tool Definition Schema
# ============================================================================

from typing import Optional


class ToolDefinition(BaseModel):
    """
    Tool definition in Ollama format.
    Same schema format as reference agent's tool calling.
    """
    
    name: str
    description: str
    parameters: dict
    
    def to_ollama_format(self) -> dict:
        """Convert to Ollama tool format."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": self.parameters.get("properties", {}),
                    "required": self.parameters.get("required", []),
                },
            },
        }


# ============================================================================
# Health Check Configuration
# ============================================================================

HEALTH_CHECK_TIMEOUT = 5.0  # Seconds
HEALTH_CHECK_INTERVAL = 30.0  # Seconds between checks

# ============================================================================
# CORS Configuration
# ============================================================================

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
]

# ============================================================================
# Logging Configuration
# ============================================================================

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
