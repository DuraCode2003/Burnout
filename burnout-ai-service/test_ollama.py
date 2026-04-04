#!/usr/bin/env python3
"""Test Ollama connection"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from burnout_ai_service.agent.ollama_client import OllamaClient


async def test():
    print("Testing Ollama connection...")
    print(f"Base URL: http://localhost:11434")
    print(f"Model: qwen3")
    print()
    
    client = OllamaClient()
    
    # Test availability
    print("Checking if Ollama is available...")
    available = await client.is_available()
    print(f"Ollama available: {available}")
    print()
    
    if not available:
        print("ERROR: Ollama is not running or qwen3 model not found")
        print("Run: ollama serve")
        print("Then: ollama pull qwen3")
        return
    
    # Test basic chat
    print("Testing basic chat...")
    messages = [
        {"role": "user", "content": "Say hello in one word"}
    ]
    
    try:
        response = await client.chat(messages, stream=False)
        content = response.get("message", {}).get("content", "")
        print(f"Response: {content}")
        print()
    except Exception as e:
        print(f"Chat error: {e}")
        return
    
    # Test streaming
    print("Testing streaming chat...")
    messages = [
        {"role": "user", "content": "Count from 1 to 3"}
    ]
    
    try:
        print("Stream: ", end="", flush=True)
        async for chunk in client.chat(messages, stream=True):
            print(chunk, end="", flush=True)
        print()
        print()
    except Exception as e:
        print(f"Stream error: {e}")
        return
    
    # Test tool calling
    print("Testing tool definition...")
    tool = OllamaClient.build_tool_definition(
        name="get_weather",
        description="Get current weather",
        parameters={
            "properties": {
                "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"],
        },
    )
    print(f"Tool: {tool['function']['name']}")
    print()
    
    print("All tests passed!")
    
    await client.close()


if __name__ == "__main__":
    asyncio.run(test())
