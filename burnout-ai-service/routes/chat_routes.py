"""
Feature 1: Student AI Companion Chat Routes.

WebSocket and HTTP endpoints for student-facing chat widget.
Streams responses via Server-Sent Events (SSE).
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, AsyncGenerator
import asyncio
import json
import uuid
from datetime import datetime

from agent.wellness_agent import create_student_agent, ConversationHistory
from agent.agent_config import MAX_HISTORY_MESSAGES
from prompts.student_companion import contains_crisis_keywords, CRISIS_RESPONSE

router = APIRouter(prefix="/ai/chat", tags=["Student Chat"])

# ============================================================================
# In-Memory Session Store (upgrade to Redis in production)
# ============================================================================

class SessionData(BaseModel):
    """Session metadata"""
    session_id: str
    user_id: str
    student_name: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    message_count: int = 0

# Session stores
sessions: dict[str, ConversationHistory] = {}
session_data: dict[str, SessionData] = {}

# Lock for thread-safe access
session_lock = asyncio.Lock()


# ============================================================================
# Request/Response Models
# ============================================================================

class ChatStartRequest(BaseModel):
    message: str
    student_name: Optional[str] = None


class ChatMessageRequest(BaseModel):
    message: str
    session_id: str


class ChatResponse(BaseModel):
    session_id: str
    message: str


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[dict]
    created_at: datetime
    updated_at: datetime


# ============================================================================
# Helper Functions
# ============================================================================

async def get_user_from_token(authorization: Optional[str]) -> tuple[str, str]:
    """
    Extract user ID and name from JWT token.
    In production: decode JWT and validate signature.
    For now: extract from token format or use mock.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization[7:]
    
    # TODO: Decode JWT properly
    # For now, extract user_id from token or use mock
    user_id = f"user_{token[:8]}" if len(token) > 8 else "user_mock"
    student_name = None  # Would extract from JWT claims
    
    return user_id, student_name


async def stream_agent_response(
    user_message: str,
    history: ConversationHistory,
    context: dict,
    student_name: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    """
    Stream agent response via SSE.
    
    Yields:
        SSE-formatted chunks
    """
    # Check for crisis keywords first
    if contains_crisis_keywords(user_message):
        # Stream crisis response immediately
        for line in CRISIS_RESPONSE.split("\n"):
            yield f"data: {json.dumps({'type': 'chunk', 'content': line + chr(10)})}\n\n"
            await asyncio.sleep(0.02)
        yield f"data: {json.dumps({'type': 'done', 'content': '', 'session_id': history.session_id})}\n\n"
        return
    
    # Create agent
    agent = create_student_agent(student_name)
    
    try:
        # Run agent with streaming
        async for chunk in agent.run_with_streaming(
            user_message=user_message,
            history=history,
            context=context,
        ):
            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            await asyncio.sleep(0.01)  # Small delay for readability
        
        yield f"data: {json.dumps({'type': 'done', 'content': '', 'session_id': history.session_id})}\n\n"
        
    except Exception as e:
        import traceback
        print(f"ERROR: {e}")
        print(traceback.format_exc())
        error_msg = "I'm having trouble connecting right now. Please try again in a moment."
        yield f"data: {json.dumps({'type': 'chunk', 'content': error_msg})}\n\n"
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'content': '', 'session_id': history.session_id})}\n\n"


# ============================================================================
# Routes
# ============================================================================

@router.post("/start")
async def start_chat(
    request: ChatStartRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Start a new chat session.
    
    Streams agent response via SSE.
    Creates new ConversationHistory for this user.
    """
    user_id, student_name = await get_user_from_token(authorization)
    
    # Use provided name or default
    student_name = request.student_name or student_name
    
    # Create new session
    session_id = str(uuid.uuid4())
    history = ConversationHistory(
        session_id=session_id,
        max_messages=MAX_HISTORY_MESSAGES,
    )
    
    # Store session
    async with session_lock:
        sessions[session_id] = history
        session_data[session_id] = SessionData(
            session_id=session_id,
            user_id=user_id,
            student_name=student_name,
        )
    
    # Context for tool execution
    context = {
        "token": authorization[7:] if authorization else "",
        "user_id": user_id,
        "spring_boot_url": "http://localhost:8080",
    }
    
    # Stream response
    return StreamingResponse(
        stream_agent_response(
            user_message=request.message,
            history=history,
            context=context,
            student_name=student_name,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.post("/message")
async def send_message(
    request: ChatMessageRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Send a message in existing chat session.
    
    Continues conversation with full history.
    Streams response via SSE.
    """
    user_id, student_name = await get_user_from_token(authorization)
    
    # Get existing session
    async with session_lock:
        if request.session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        history = sessions[request.session_id]
        data = session_data[request.session_id]
        
        # Verify ownership
        if data.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your session")
        
        # Update metadata
        data.updated_at = datetime.utcnow()
        data.message_count += 1
    
    # Context for tool execution
    context = {
        "token": authorization[7:] if authorization else "",
        "user_id": user_id,
        "spring_boot_url": "http://localhost:8080",
    }
    
    # Stream response
    return StreamingResponse(
        stream_agent_response(
            user_message=request.message,
            history=history,
            context=context,
            student_name=data.student_name,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/session/{session_id}")
async def clear_session(
    session_id: str,
    authorization: Optional[str] = Header(None),
):
    """
    Clear conversation history for a session.
    
    Fresh start for the user.
    """
    user_id, _ = await get_user_from_token(authorization)
    
    async with session_lock:
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        data = session_data[session_id]
        if data.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your session")
        
        # Clear history but keep session
        sessions[session_id].clear()
        session_data[session_id].updated_at = datetime.utcnow()
        session_data[session_id].message_count = 0
    
    return {"status": "cleared", "session_id": session_id}


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_history(
    session_id: str,
    authorization: Optional[str] = Header(None),
):
    """
    Get conversation history for a session.
    
    Useful for restoring chat on page refresh.
    """
    user_id, _ = await get_user_from_token(authorization)
    
    async with session_lock:
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        history = sessions[session_id]
        data = session_data[session_id]
        
        if data.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your session")
    
    return ChatHistoryResponse(
        session_id=session_id,
        messages=[m.to_dict() for m in history.messages],
        created_at=data.created_at,
        updated_at=data.updated_at,
    )


@router.get("/sessions")
async def list_sessions(
    authorization: Optional[str] = Header(None),
):
    """
    List all sessions for current user.
    """
    user_id, _ = await get_user_from_token(authorization)
    
    async with session_lock:
        user_sessions = [
            {
                "session_id": data.session_id,
                "created_at": data.created_at.isoformat(),
                "updated_at": data.updated_at.isoformat(),
                "message_count": data.message_count,
            }
            for data in session_data.values()
            if data.user_id == user_id
        ]
    
    return {"sessions": user_sessions}


@router.post("/session/{session_id}/rename")
async def rename_session(
    session_id: str,
    request: dict,
    authorization: Optional[str] = Header(None),
):
    """
    Rename a session (for user organization).
    """
    user_id, _ = await get_user_from_token(authorization)
    
    async with session_lock:
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        data = session_data[session_id]
        if data.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your session")
        
        # Store custom name (would need to add field to SessionData)
        data.student_name = request.get("name", data.student_name)
    
    return {"status": "updated"}
