"""
Ollama LLM Client - Python equivalent of upstreamproxy.ts patterns.

Key patterns replicated:
- Async HTTP client with timeout handling
- Streaming response via Server-Sent Events
- Tool call extraction from LLM response
- Graceful degradation when service unavailable
- Environment-based configuration
"""

import os
import json
import asyncio
from typing import AsyncGenerator, Optional, Any, Union
import httpx

from .agent_config import OLLAMA_BASE_URL, OLLAMA_MODEL, STREAM_CHUNK_SIZE


class OllamaClient:
    """
    Async client for Ollama LLM API.
    Replicates patterns from upstreamproxy.ts for Python/FastAPI.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ):
        """
        Initialize Ollama client.
        
        Args:
            base_url: Ollama API base URL (env: OLLAMA_BASE_URL)
            model: Model name to use (env: OLLAMA_MODEL)
        """
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", OLLAMA_BASE_URL)
        self.model = model or os.getenv("OLLAMA_MODEL", OLLAMA_MODEL)
        self._client: Optional[httpx.AsyncClient] = None
        self._timeout = httpx.Timeout(60.0, read=120.0)

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client (singleton pattern)."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self._timeout,
                headers={"Content-Type": "application/json"},
            )
        return self._client

    async def close(self):
        """Close HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def chat(
        self,
        messages: list[dict],
        tools: Optional[list[dict]] = None,
        stream: bool = False,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> Union[dict, AsyncGenerator[str, None]]:
        """
        Send chat request to Ollama.
        
        Replicates upstreamproxy.ts pattern:
        - POST to LLM endpoint with messages array
        - Optional tools for function calling
        - Streaming or non-streaming response
        
        Args:
            messages: List of {role, content} dicts (same as reference agent)
            tools: Optional list of tool schemas
            stream: Whether to stream response
            temperature: Sampling temperature
            max_tokens: Max tokens to generate
            
        Returns:
            dict with full response OR AsyncGenerator for streaming
        """
        client = await self._get_client()

        # Build request body (same structure as reference agent)
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature,
                "num_ctx": 8192,  # Context window size
            },
        }

        # Add tools if provided (same format as reference)
        if tools:
            payload["tools"] = tools

        # Add max_tokens if specified
        if max_tokens:
            payload["options"]["num_predict"] = max_tokens

        if stream:
            return self._chat_stream(client, payload)
        else:
            return await self._chat_non_stream(client, payload)

    async def _chat_non_stream(self, client: httpx.AsyncClient, payload: dict) -> dict:
        """Non-streaming chat - returns full response."""
        max_retries = 3
        last_error = None

        for attempt in range(max_retries):
            try:
                response = await client.post("/api/chat", json=payload)
                response.raise_for_status()
                return response.json()
            except (httpx.HTTPStatusError, httpx.ConnectError) as e:
                last_error = e
                if attempt < max_retries - 1:
                    # Exponential backoff (similar to reference agent retry logic)
                    await asyncio.sleep(1.0 * (attempt + 1))

        raise last_error or Exception("Chat request failed")

    async def _chat_stream(
        self,
        client: httpx.AsyncClient,
        payload: dict,
    ) -> AsyncGenerator[str, None]:
        """
        Streaming chat - yields text chunks as they arrive.
        
        Replicates how upstreamproxy.ts streams:
        - Opens connection
        - Reads line-by-line (SSE format)
        - Parses JSON chunks
        - Yields content incrementally
        - Handles connection errors gracefully
        """
        max_retries = 3
        last_error = None

        for attempt in range(max_retries):
            try:
                async with client.stream("POST", "/api/chat", json=payload) as response:
                    response.raise_for_status()
                    
                    # Stream line-by-line (SSE format)
                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        
                        try:
                            # Parse JSON chunk (same as reference agent)
                            chunk = json.loads(line)
                            
                            # Extract content from chunk
                            if "message" in chunk:
                                content = chunk["message"].get("content", "")
                                if content:
                                    yield content
                            
                            # Check for done signal
                            if chunk.get("done", False):
                                break
                                
                        except json.JSONDecodeError:
                            # Skip malformed chunks (graceful degradation)
                            continue
                    return
                    
            except (httpx.HTTPStatusError, httpx.ConnectError) as e:
                last_error = e
                if attempt < max_retries - 1:
                    await asyncio.sleep(1.0 * (attempt + 1))

        # If all retries failed, raise error
        if last_error:
            raise last_error

    async def chat_stream(
        self,
        messages: list[dict],
        tools: Optional[list[dict]] = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        """
        Convenience method for streaming chat.
        Same pattern as reference agent's streaming.
        """
        stream = await self.chat(
            messages=messages,
            tools=tools,
            stream=True,
            temperature=temperature,
        )
        async for chunk in stream:
            yield chunk

    async def is_available(self) -> bool:
        """
        Check if Ollama is running and model is available.
        GET /api/tags (same health check pattern as reference).
        """
        try:
            client = await self._get_client()
            response = await client.get("/api/tags", timeout=5.0)
            
            if response.status_code != 200:
                return False
            
            data = response.json()
            models = data.get("models", [])
            
            # Check if our model is available
            return any(m.get("name", "").startswith(self.model) for m in models)
            
        except Exception:
            return False

    def extract_tool_calls(self, response: dict) -> list[dict]:
        """
        Extract tool calls from Ollama response.
        
        Replicates how reference agent extracts tool_use:
        - Looks for tool_calls in response message
        - Parses function name and arguments
        - Returns normalized list of {name, arguments, id}
        
        Args:
            response: Full LLM response dict
            
        Returns:
            List of tool call dicts
        """
        tool_calls = []
        
        message = response.get("message", {})
        raw_tool_calls = message.get("tool_calls", [])
        
        if not raw_tool_calls:
            return tool_calls
        
        for tc in raw_tool_calls:
            function = tc.get("function", {})
            tool_calls.append({
                "id": tc.get("id", f"call_{len(tool_calls)}"),
                "name": function.get("name", ""),
                "arguments": function.get("arguments", {}),
            })
        
        return tool_calls

    def get_fallback_response(self, context: str = "") -> str:
        """
        Return graceful fallback when Ollama unavailable.
        Same concept as reference agent's error handling.
        """
        return (
            "I'm having trouble connecting right now. "
            "Please know that your wellbeing is important. "
            "Consider reaching out to a counselor if you're struggling. "
            "You can try again in a few moments."
        )

    @staticmethod
    def build_tool_definition(
        name: str,
        description: str,
        parameters: dict,
    ) -> dict:
        """
        Build tool definition in Ollama format.
        Same schema format as reference agent.
        """
        return {
            "type": "function",
            "function": {
                "name": name,
                "description": description,
                "parameters": {
                    "type": "object",
                    "properties": parameters.get("properties", {}),
                    "required": parameters.get("required", []),
                },
            },
        }
