"""
Wellness Agent - Core agent loop adapted from CLI agent reference.

Replicates the exact pattern from the reference agent:
1. Takes user input
2. Calls LLM with tools
3. Checks if LLM wants to use a tool
4. Executes tool and feeds result back
5. Loops until LLM gives final response

Handles tool calling, history management, and streaming.
"""

import asyncio
from typing import AsyncGenerator, Optional, Any, Union
import json

from .ollama_client import OllamaClient
from .conversation import ConversationHistory
from .agent_config import (
    MAX_TOOL_ITERATIONS,
    STREAM_CHUNK_SIZE,
    STUDENT_COMPANION_CONFIG,
    PROACTIVE_AGENT_CONFIG,
    COUNSELOR_ASSISTANT_CONFIG,
)
from tools.registry import ToolRegistry


class WellnessAgent:
    """
    Core agent loop — adapted from CLI agent reference.
    Handles tool calling, history management, streaming.
    
    Usage:
        agent = WellnessAgent(llm, tools, system_prompt, config)
        response = await agent.run(user_message, history, context)
    """

    def __init__(
        self,
        ollama_client: OllamaClient,
        tool_registry: ToolRegistry,
        system_prompt: str,
        config: dict,
    ):
        """
        Initialize wellness agent.
        
        Args:
            ollama_client: Async LLM client
            tool_registry: Registry of available tools
            system_prompt: System prompt for this agent
            config: LLM config (temperature, max_tokens, etc)
        """
        self.llm = ollama_client
        self.tools = tool_registry
        self.system_prompt = system_prompt
        self.config = config
        self._running = False

    async def run(
        self,
        user_message: str,
        history: ConversationHistory,
        context: dict,
        stream: bool = False,
    ) -> Union[str, AsyncGenerator[str, None]]:
        """
        Main agent loop — replicates reference agent pattern.
        
        Flow:
        1. Add user message to history
        2. Get tool schemas
        3. Call LLM with history + tools
        4. If LLM calls a tool:
           a. Execute tool with context
           b. Add tool result to history
           c. Call LLM again (loop)
           d. Repeat up to MAX_TOOL_ITERATIONS
        5. When LLM gives text response: return it
        6. If stream=True: yield chunks instead of returning
        
        Args:
            user_message: User's input message
            history: Conversation history manager
            context: {token, userId, role, spring_boot_url}
            stream: Whether to stream the response
            
        Returns:
            Final response string OR AsyncGenerator for streaming
        """
        self._running = True
        
        # Step 1: Add user message to history
        history.add_user_message(user_message)
        
        # Step 2: Get tool schemas (passed to every LLM call)
        tool_schemas = self.tools.get_schemas()
        
        # Add system prompt if not already present
        if not any(m.role == "system" for m in history.messages):
            history.add_system_message(self.system_prompt)
        
        # Main agent loop
        for iteration in range(MAX_TOOL_ITERATIONS):
            if not self._running:
                break
            
            # Step 3: Get messages for LLM
            messages = history.get_messages()
            
            # Step 4: Call LLM
            try:
                response = await self.llm.chat(
                    messages=messages,
                    tools=tool_schemas if iteration == 0 else None,  # Only send tools on first iteration
                    stream=False,  # Use False during tool loop, stream at end
                    temperature=self.config.get("temperature", 0.7),
                    max_tokens=self.config.get("max_tokens", 1024),
                )
            except Exception as e:
                # LLM call failed
                error_msg = f"I encountered an error: {str(e)}"
                history.add_assistant_message(error_msg)
                
                if stream:
                    return self._stream_text(error_msg)
                return error_msg
            
            # Step 5: Check for tool calls
            tool_calls = self.llm.extract_tool_calls(response)
            
            if not tool_calls:
                # No tool calls — LLM gave final response
                final_text = response.get("message", {}).get("content", "")
                
                if not final_text:
                    final_text = "I'm having trouble generating a response. Please try again."
                
                history.add_assistant_message(final_text)
                
                # Step 6: Return or stream
                if stream:
                    return self._stream_text(final_text)
                else:
                    return final_text
            
            # Step 7: LLM wants to use tools — execute them
            for tool_call in tool_calls:
                tool_name = tool_call.get("name", "")
                tool_args = tool_call.get("arguments", {})
                
                # Ensure arguments is a dict
                if isinstance(tool_args, str):
                    try:
                        tool_args = json.loads(tool_args)
                    except json.JSONDecodeError:
                        tool_args = {}
                
                # Execute tool
                tool_result = await self.tools.execute(
                    tool_name, tool_args, context
                )
                
                # Add tool result to history (as tool role message)
                history.add_tool_result(tool_name, tool_result, tool_call.get("id"))
                
                # Also add assistant message noting tool use
                history.add_assistant_message(
                    "",
                    tool_calls=[tool_call],
                )
        
        else:
            # Hit max iterations without final response
            fallback = "I'm having trouble processing that right now. Please try again."
            history.add_assistant_message(fallback)
            
            if stream:
                return self._stream_text(fallback)
            return fallback
        
        self._running = False

    async def _stream_text(self, text: str) -> AsyncGenerator[str, None]:
        """
        Split text into chunks for simulated streaming.
        
        Args:
            text: Full response text
            
        Yields:
            Text chunks
        """
        chunk_size = self.config.get("stream_chunk_size", STREAM_CHUNK_SIZE)
        
        for i in range(0, len(text), chunk_size):
            chunk = text[i : i + chunk_size]
            yield chunk
        
        # Small delay at end to simulate completion
        # asyncio.sleep(0.01)

    async def run_single(
        self,
        prompt: str,
        context: dict,
    ) -> str:
        """
        Single-turn run — no history management.
        
        Used by proactive agent (generates one message, no back-and-forth)
        and counselor summaries.
        
        Args:
            prompt: User prompt
            context: Context dict
            
        Returns:
            Response string
        """
        history = ConversationHistory()
        history.add_system_message(self.system_prompt)
        history.add_user_message(prompt)
        
        return await self.run(
            user_message=prompt,
            history=history,
            context=context,
            stream=False,
        )

    async def run_with_streaming(
        self,
        user_message: str,
        history: ConversationHistory,
        context: dict,
    ) -> AsyncGenerator[str, None]:
        """
        Convenience method for streaming responses.
        
        Args:
            user_message: User input
            history: Conversation history
            context: Context dict
            
        Yields:
            Response chunks
        """
        result = await self.run(
            user_message=user_message,
            history=history,
            context=context,
            stream=True,
        )
        
        # result is an AsyncGenerator
        async for chunk in result:
            yield chunk

    def stop(self):
        """Stop the agent loop (for cleanup)."""
        self._running = False

    async def generate_summary(
        self,
        data: str,
        context: dict,
        prompt_template: str,
    ) -> str:
        """
        Generate a summary from structured data.
        
        Used for counselor summaries and proactive messages.
        
        Args:
            data: Data to summarize
            context: Context dict
            prompt_template: Prompt template string
            
        Returns:
            Generated summary
        """
        prompt = prompt_template.format(data=data)
        return await self.run_single(prompt, context)

    async def generate_daily_tip(
        self,
        student_name: str,
        burnout_score: float,
        risk_level: str,
        mood_trend: str,
    ) -> str:
        """
        Generate a personalized daily mindfulness tip.
        
        Args:
            student_name: Name of the student
            burnout_score: 0-100 score
            risk_level: LOW, MEDIUM, HIGH, CRITICAL
            mood_trend: String describing mood trends
            
        Returns:
            Personalized tip string
        """
        from prompts.daily_tip import get_tip_prompt
        
        prompt = get_tip_prompt(student_name, burnout_score, risk_level, mood_trend)
        
        context = {
            "user_id": "system",
            "student_name": student_name,
        }
        
        return await self.run_single(prompt, context)


# ============================================================================
# Factory Functions
# ============================================================================

def create_student_agent(student_name: Optional[str] = None) -> WellnessAgent:
    """
    Create agent configured for student AI companion.
    
    Args:
        student_name: Optional student name for personalization
        
    Returns:
        Configured WellnessAgent
    """
    from prompts.student_companion import get_prompt_with_context
    from tools import student_registry
    
    system_prompt = get_prompt_with_context(student_name)
    
    return WellnessAgent(
        ollama_client=OllamaClient(),
        tool_registry=student_registry,
        system_prompt=system_prompt,
        config=STUDENT_COMPANION_CONFIG,
    )


def create_proactive_agent() -> WellnessAgent:
    """
    Create agent configured for proactive wellness messages.
    
    Returns:
        Configured WellnessAgent
    """
    from prompts.proactive_agent import SYSTEM_PROMPT
    from tools import proactive_registry
    
    return WellnessAgent(
        ollama_client=OllamaClient(),
        tool_registry=proactive_registry,
        system_prompt=SYSTEM_PROMPT,
        config=PROACTIVE_AGENT_CONFIG,
    )


def create_counselor_agent() -> WellnessAgent:
    """
    Create agent configured for counselor AI assistant.
    
    Returns:
        Configured WellnessAgent
    """
    from prompts.counselor_assistant import SYSTEM_PROMPT
    from tools import counselor_registry
    
    return WellnessAgent(
        ollama_client=OllamaClient(),
        tool_registry=counselor_registry,
        system_prompt=SYSTEM_PROMPT,
        config=COUNSELOR_ASSISTANT_CONFIG,
    )


def create_daily_tip_agent() -> WellnessAgent:
    """
    Create agent configured for daily mindfulness tips.
    
    Returns:
        Configured WellnessAgent
    """
    from prompts.daily_tip import SYSTEM_PROMPT
    from tools import student_registry  # Use student registry for any tool-based tips if needed
    
    return WellnessAgent(
        ollama_client=OllamaClient(),
        tool_registry=student_registry,
        system_prompt=SYSTEM_PROMPT,
        config=STUDENT_COMPANION_CONFIG,  # Same config (fast, empathetic)
    )


# ============================================================================
# Convenience Functions
# ============================================================================

async def chat_with_student(
    user_message: str,
    session_id: str,
    jwt_token: str,
    user_id: str,
    student_name: Optional[str] = None,
) -> str:
    """
    Quick function for student chat — handles setup automatically.
    
    Args:
        user_message: Student's message
        session_id: Chat session ID
        jwt_token: Student's JWT token
        user_id: Student's user ID
        student_name: Optional name
        
    Returns:
        Agent response
    """
    agent = create_student_agent(student_name)
    
    history = ConversationHistory(session_id=session_id)
    
    context = {
        "token": jwt_token,
        "user_id": user_id,
        "spring_boot_url": "http://localhost:8080",
    }
    
    return await agent.run(
        user_message=user_message,
        history=history,
        context=context,
        stream=False,
    )


async def generate_proactive_message(
    alert_type: str,
    student_data: dict,
    jwt_token: str,
    user_id: str,
) -> str:
    """
    Generate proactive wellness message for an alert.
    
    Args:
        alert_type: "YELLOW", "ORANGE", or "RED"
        student_data: Student's context data
        jwt_token: System JWT token
        user_id: Student's user ID
        
    Returns:
        Generated message
    """
    from prompts.proactive_agent import get_prompt_for_alert
    
    agent = create_proactive_agent()
    
    prompt = get_prompt_for_alert(alert_type, student_data)
    
    context = {
        "token": jwt_token,
        "user_id": user_id,
        "spring_boot_url": "http://localhost:8080",
        "alert_type": alert_type,
    }
    
    return await agent.run_single(prompt, context)


async def generate_counselor_summary(
    alert_data: str,
    jwt_token: str,
) -> str:
    """
    Generate clinical summary for counselor.
    
    Args:
        alert_data: Formatted alert data string
        jwt_token: Counselor's JWT token
        
    Returns:
        Clinical summary
    """
    from prompts.counselor_assistant import get_summary_prompt
    
    agent = create_counselor_agent()
    
    prompt = get_summary_prompt(alert_data)
    
    context = {
        "token": jwt_token,
        "spring_boot_url": "http://localhost:8080",
    }
    
    return await agent.run_single(prompt, context)
