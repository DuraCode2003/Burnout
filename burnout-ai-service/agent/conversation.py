"""
Conversation History Manager - Python equivalent of sessionHistory.ts patterns.

Key patterns replicated:
- Message array with role/content structure
- Pagination with limit and cursors
- Chronological ordering
- Auth context for API calls
- Graceful error handling
"""

import uuid
import json
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class Message(BaseModel):
    """
    Single message in conversation.
    Same structure as SDKMessage in reference agent.
    """
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user", "assistant", "system", "tool"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tool_call_id: Optional[str] = None
    tool_calls: Optional[list[dict]] = None
    metadata: dict = Field(default_factory=dict)
    
    def to_dict(self) -> dict:
        """Convert to dict for LLM API (same format as reference)."""
        result = {"role": self.role, "content": self.content}
        
        if self.tool_calls:
            result["tool_calls"] = self.tool_calls
        
        if self.tool_call_id:
            result["tool_call_id"] = self.tool_call_id
        
        return result
    
    @classmethod
    def from_dict(cls, data: dict) -> "Message":
        """Restore from dict."""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            role=data["role"],
            content=data["content"],
            timestamp=(
                datetime.fromisoformat(data["timestamp"])
                if isinstance(data.get("timestamp"), str)
                else data.get("timestamp", datetime.utcnow())
            ),
            tool_call_id=data.get("tool_call_id"),
            tool_calls=data.get("tool_calls"),
            metadata=data.get("metadata", {}),
        )


class ConversationHistory(BaseModel):
    """
    Manages conversation history for a chat session.
    
    Replicates sessionHistory.ts patterns:
    - Chronological message storage
    - Pagination with limit (fetchLatestEvents pattern)
    - Cursor-based navigation (before_id pattern)
    - Auth context preparation
    - Graceful error handling
    
    Usage:
        history = ConversationHistory()
        history.add_user_message("Hello")
        history.add_assistant_message("Hi there!")
        messages = history.get_messages()  # For LLM API
    """
    
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    messages: list[Message] = Field(default_factory=list)
    max_messages: int = Field(default=50)  # Same as HISTORY_PAGE_SIZE concept
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # System message (always first, like reference agent)
    _system_message: Optional[Message] = None
    
    def add_system_message(self, content: str) -> Message:
        """
        Add/set system message (always at position 0).
        Same pattern as reference agent's system prompt handling.
        """
        message = Message(role="system", content=content)
        self._system_message = message
        self.updated_at = datetime.utcnow()
        return message
    
    def add_user_message(self, content: str, metadata: Optional[dict] = None) -> Message:
        """
        Append user message.
        Same pattern as reference agent: {role: "user", content: ...}
        """
        message = Message(
            role="user",
            content=content,
            metadata=metadata or {},
        )
        self.messages.append(message)
        self.updated_at = datetime.utcnow()
        
        # Trim if exceeding max (keep most recent)
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
        
        return message
    
    def add_assistant_message(
        self,
        content: str,
        tool_calls: Optional[list[dict]] = None,
        metadata: Optional[dict] = None,
    ) -> Message:
        """
        Append assistant message.
        Same pattern as reference agent: {role: "assistant", content: ...}
        """
        message = Message(
            role="assistant",
            content=content,
            tool_calls=tool_calls,
            metadata=metadata or {},
        )
        self.messages.append(message)
        self.updated_at = datetime.utcnow()
        
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
        
        return message
    
    def add_tool_result(
        self,
        tool_name: str,
        result: Any,
        tool_call_id: Optional[str] = None,
    ) -> Message:
        """
        Append tool result.
        Same format as reference agent's tool response handling.
        """
        # Serialize result to string
        if isinstance(result, (dict, list)):
            content = json.dumps(result)
        else:
            content = str(result)
        
        message = Message(
            role="tool",
            content=content,
            tool_call_id=tool_call_id,
            metadata={"tool_name": tool_name},
        )
        self.messages.append(message)
        self.updated_at = datetime.utcnow()
        
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
        
        return message
    
    def get_messages(self, limit: Optional[int] = None) -> list[dict]:
        """
        Get messages for LLM API.
        
        Replicates fetchLatestEvents pattern:
        - Returns chronological order
        - Applies limit to get recent messages
        - Always includes system message first
        
        Args:
            limit: Max messages to return (like HISTORY_PAGE_SIZE)
            
        Returns:
            List of message dicts for LLM API
        """
        result = []
        
        # System message always first (if exists)
        if self._system_message:
            result.append(self._system_message.to_dict())
        
        # Get messages to include
        messages_to_use = self.messages
        if limit:
            messages_to_use = self.messages[-limit:]
        
        # Add in chronological order
        for msg in messages_to_use:
            result.append(msg.to_dict())
        
        return result
    
    def get_messages_before(self, before_id: str, limit: int = 50) -> list[dict]:
        """
        Get messages before a specific message ID.
        
        Replicates fetchOlderEvents pattern:
        - Uses before_id cursor
        - Returns older messages
        - Applies limit
        
        Args:
            before_id: Message ID to get messages before
            limit: Max messages to return
            
        Returns:
            List of older message dicts
        """
        # Find index of before_id message
        target_index = None
        for i, msg in enumerate(self.messages):
            if msg.id == before_id:
                target_index = i
                break
        
        if target_index is None:
            return []
        
        # Get messages before target
        older_messages = self.messages[:target_index]
        
        # Apply limit (keep most recent of the older ones)
        if limit:
            older_messages = older_messages[-limit:]
        
        return [msg.to_dict() for msg in older_messages]
    
    def has_more_before(self, message_id: str) -> bool:
        """
        Check if there are older messages before given ID.
        Same concept as hasMore in reference.
        """
        for i, msg in enumerate(self.messages):
            if msg.id == message_id:
                return i > 0
        return False
    
    def get_context_window(self, max_tokens: int = 4000) -> list[dict]:
        """
        Get messages within token limit.
        Starts from most recent and works backwards.
        
        Args:
            max_tokens: Approximate max tokens
            
        Returns:
            List of message dicts within limit
        """
        result = []
        current_tokens = 0
        
        # Work backwards from most recent
        for msg in reversed(self.messages):
            # Rough token estimate (4 chars ≈ 1 token)
            msg_tokens = len(msg.content) // 4
            if current_tokens + msg_tokens > max_tokens:
                break
            result.insert(0, msg.to_dict())
            current_tokens += msg_tokens
        
        # Add system message if exists
        if self._system_message:
            result.insert(0, self._system_message.to_dict())
        
        return result
    
    def clear(self):
        """
        Clear conversation history.
        Keeps system message if exists (same as reference).
        """
        self.messages = []
        self.updated_at = datetime.utcnow()
        # Keep _system_message
    
    def to_dict(self) -> dict:
        """
        Serialize for storage (Redis/memory).
        Same pattern as reference agent's serialization.
        """
        return {
            "session_id": self.session_id,
            "messages": [m.model_dump() for m in self.messages],
            "system_message": (
                self._system_message.model_dump() if self._system_message else None
            ),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "max_messages": self.max_messages,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "ConversationHistory":
        """
        Restore from serialized form.
        Same pattern as reference agent's deserialization.
        """
        messages = [
            Message.from_dict(m)
            for m in data.get("messages", [])
        ]
        
        system_msg_data = data.get("system_message")
        system_message = None
        if system_msg_data:
            system_message = Message.from_dict(system_msg_data)
        
        history = cls(
            session_id=data.get("session_id", str(uuid.uuid4())),
            messages=messages,
            max_messages=data.get("max_messages", 50),
            created_at=(
                datetime.fromisoformat(data["created_at"])
                if data.get("created_at")
                else datetime.utcnow()
            ),
            updated_at=(
                datetime.fromisoformat(data["updated_at"])
                if data.get("updated_at")
                else datetime.utcnow()
            ),
        )
        
        history._system_message = system_message
        return history
    
    def get_first_id(self) -> Optional[str]:
        """
        Get ID of oldest message (for pagination cursor).
        Same concept as firstId in reference.
        """
        if self.messages:
            return self.messages[0].id
        return None
    
    def get_last_id(self) -> Optional[str]:
        """
        Get ID of newest message (for pagination cursor).
        Same concept as lastId in reference.
        """
        if self.messages:
            return self.messages[-1].id
        return None
