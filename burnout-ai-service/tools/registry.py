"""
Tool Registry - Python equivalent of reference agent's tool registration.

Replicates the exact schema format from the CLI agent:
- name/description/parameters/inputSchema pattern
- Tool registration with schema + handler
- Execution by name with context passing
- Graceful error handling
"""

from typing import Callable, Any, Optional
import asyncio


class ToolRegistry:
    """
    Registry for agent tools.
    Same concept as tool registration in reference agent.
    """

    def __init__(self):
        self.tools: dict[str, Callable] = {}
        self.schemas: list[dict] = []
        self._lock = asyncio.Lock()

    def register(self, schema: dict, handler: Callable):
        """
        Register a tool with its schema + handler function.
        
        Schema format matches what Ollama expects for tool calling:
        {
            "type": "function",
            "function": {
                "name": "tool_name",
                "description": "...",
                "parameters": {...}
            }
        }
        
        Args:
            schema: Tool schema in Ollama format
            handler: Async function to execute the tool
        """
        tool_name = schema.get("function", {}).get("name")
        if not tool_name:
            raise ValueError("Schema must include function.name")

        self.tools[tool_name] = handler
        self.schemas.append(schema)

    def get_schemas(self) -> list[dict]:
        """
        Return all tool schemas.
        Passed to Ollama in every request for tool calling.
        """
        return self.schemas.copy()

    def get_schema(self, name: str) -> Optional[dict]:
        """Get schema for a specific tool."""
        for schema in self.schemas:
            if schema.get("function", {}).get("name") == name:
                return schema
        return None

    def get_handler(self, name: str) -> Optional[Callable]:
        """Get handler function for a specific tool."""
        return self.tools.get(name)

    async def execute(
        self,
        tool_name: str,
        arguments: dict,
        context: Optional[dict] = None,
    ) -> str:
        """
        Execute tool by name, pass context (JWT token etc).
        
        Replicates reference agent's tool execution:
        - Look up handler by name
        - Pass arguments and context
        - Return result as string (fed back to LLM)
        - Handle errors gracefully
        
        Args:
            tool_name: Name of tool to execute
            arguments: Tool arguments from LLM
            context: Additional context (JWT, user_id, etc)
            
        Returns:
            Result as string for LLM consumption
        """
        if tool_name not in self.tools:
            return f"Error: Tool '{tool_name}' not found. Available tools: {list(self.tools.keys())}"

        handler = self.tools[tool_name]

        try:
            # Check if handler is async
            if asyncio.iscoroutinefunction(handler):
                # Pass context if handler accepts it
                result = await handler(arguments, context or {})
            else:
                result = handler(arguments, context or {})

            # Convert result to string for LLM
            if isinstance(result, (dict, list)):
                import json
                return json.dumps(result, indent=2)
            return str(result)

        except TypeError as e:
            # Wrong arguments passed
            return f"Error: Invalid arguments for '{tool_name}': {str(e)}"
        except Exception as e:
            # General execution error
            return f"Error executing '{tool_name}': {str(e)}"

    def clear(self):
        """Clear all registered tools."""
        self.tools.clear()
        self.schemas.clear()

    def __len__(self) -> int:
        """Number of registered tools."""
        return len(self.tools)

    def __contains__(self, name: str) -> bool:
        """Check if tool is registered."""
        return name in self.tools


def create_tool_schema(
    name: str,
    description: str,
    parameters: dict,
    required: Optional[list[str]] = None,
) -> dict:
    """
    Helper to create tool schema in Ollama format.
    Same format as reference agent's tool schemas.
    """
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": parameters,
                "required": required or [],
            },
        },
    }
