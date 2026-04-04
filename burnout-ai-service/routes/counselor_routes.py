"""
Feature 3: Counselor AI Assistant Routes.

AI summaries for counselor dashboard alert reviews.
Supports follow-up Q&A about specific alerts.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, AsyncGenerator, Dict, List
import asyncio
import json
from datetime import datetime
import uuid

from agent.wellness_agent import create_counselor_agent, ConversationHistory
from prompts.counselor_assistant import get_summary_prompt, get_follow_up_prompt

router = APIRouter(prefix="/ai/counselor", tags=["Counselor Assistant"])

# ============================================================================
# In-Memory Cache (upgrade to Redis in production)
# ============================================================================

class CachedSummary(BaseModel):
    alert_id: str
    counselor_id: str
    summary: str
    created_at: datetime = datetime.utcnow()
    access_count: int = 0

# Summary cache
summary_cache: Dict[str, CachedSummary] = {}

# Counselor conversation histories (keyed by counselor_id + alert_id)
counselor_sessions: Dict[str, ConversationHistory] = {}

# Lock for thread-safe access
cache_lock = asyncio.Lock()


# ============================================================================
# Request/Response Models
# ============================================================================

class CounselorSummaryRequest(BaseModel):
    alert_id: str
    user_id: str  # Student's user ID


class CounselorChatRequest(BaseModel):
    message: str
    alert_id: str


class CounselorSummaryResponse(BaseModel):
    alert_id: str
    summary: str
    generated_at: datetime
    cached: bool


class CounselorChatResponse(BaseModel):
    alert_id: str
    response: str
    conversation_id: str


# ============================================================================
# Helper Functions
# ============================================================================

async def get_counselor_from_token(authorization: Optional[str]) -> tuple[str, str]:
    """
    Extract counselor ID and role from JWT token.
    Verify role = COUNSELOR.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization[7:]
    
    # TODO: Decode JWT properly and verify role
    # For now: extract counselor_id from token
    counselor_id = f"counselor_{token[:8]}" if len(token) > 8 else "counselor_mock"
    role = "COUNSELOR"  # Would verify from JWT claims
    
    if role != "COUNSELOR":
        raise HTTPException(status_code=403, detail="Counselor role required")
    
    return counselor_id, role


async def stream_counselor_summary(
    alert_id: str,
    alert_data: str,
    context: dict,
) -> AsyncGenerator[str, None]:
    """
    Stream clinical summary generation via SSE.
    """
    agent = create_counselor_agent()
    
    # Build prompt
    prompt = get_summary_prompt(alert_data)
    
    # Create temporary history for this generation
    history = ConversationHistory(session_id=f"summary_{alert_id}")
    
    try:
        # Run agent with streaming
        async for chunk in agent.run_with_streaming(
            user_message=prompt,
            history=history,
            context=context,
        ):
            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            await asyncio.sleep(0.01)
        
        # Get full summary from history
        full_summary = history.messages[-1].content if history.messages else ""
        
        # Cache the summary
        async with cache_lock:
            summary_cache[alert_id] = CachedSummary(
                alert_id=alert_id,
                counselor_id=context.get("counselor_id", ""),
                summary=full_summary,
            )
        
        yield f"data: {json.dumps({'type': 'done', 'content': '', 'alert_id': alert_id})}\n\n"
        
    except Exception as e:
        error_msg = "Unable to generate summary. Please try again or review the data manually."
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        yield f"data: {json.dumps({'type': 'chunk', 'content': error_msg})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'content': ''})}\n\n"


async def stream_counselor_chat(
    message: str,
    alert_id: str,
    history: ConversationHistory,
    context: dict,
) -> AsyncGenerator[str, None]:
    """
    Stream counselor chat response via SSE.
    """
    agent = create_counselor_agent()
    
    try:
        async for chunk in agent.run_with_streaming(
            user_message=message,
            history=history,
            context=context,
        ):
            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            await asyncio.sleep(0.01)
        
        yield f"data: {json.dumps({'type': 'done', 'content': ''})}\n\n"
        
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'content': ''})}\n\n"


def get_session_key(counselor_id: str, alert_id: str) -> str:
    """Generate unique session key for counselor + alert."""
    return f"{counselor_id}:{alert_id}"


# ============================================================================
# Routes
# ============================================================================

@router.post("/summary/{alert_id}")
async def generate_summary(
    alert_id: str,
    request: CounselorSummaryRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Generate AI clinical summary for an alert.
    
    Streams summary generation via SSE.
    Caches result for future access.
    """
    counselor_id, role = await get_counselor_from_token(authorization)
    
    # Check if already cached
    async with cache_lock:
        if alert_id in summary_cache:
            cached = summary_cache[alert_id]
            cached.access_count += 1
            # Return cached immediately (don't regenerate)
            return StreamingResponse(
                iter([
                    f"data: {json.dumps({'type': 'cached', 'content': cached.summary})}\n\n",
                    f"data: {json.dumps({'type': 'done', 'content': ''})}\n\n",
                ]),
                media_type="text/event-stream",
            )
    
    # Fetch alert data using tool
    # In production: fetch from Spring Boot via tool
    alert_data = f"""
ALERT INFORMATION:
- Alert ID: {alert_id}
- Student ID: {request.user_id}
- Alert Type: PENDING (fetch from backend)
- Trigger Reason: PENDING (fetch from backend)

MOOD HISTORY (30 days):
PENDING (fetch from backend)

BURNOUT HISTORY:
PENDING (fetch from backend)
"""
    
    context = {
        "token": authorization[7:] if authorization else "",
        "counselor_id": counselor_id,
        "spring_boot_url": "http://localhost:8080",
        "alert_id": alert_id,
    }
    
    # Stream summary generation
    return StreamingResponse(
        stream_counselor_summary(
            alert_id=alert_id,
            alert_data=alert_data,
            context=context,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/summary/{alert_id}/cached")
async def get_cached_summary(
    alert_id: str,
    authorization: Optional[str] = Header(None),
):
    """
    Get cached summary if exists.
    
    Frontend should call this first to avoid re-generating.
    Returns 404 if not yet generated.
    """
    await get_counselor_from_token(authorization)  # Verify auth
    
    async with cache_lock:
        if alert_id not in summary_cache:
            raise HTTPException(status_code=404, detail="Summary not yet generated")
        
        cached = summary_cache[alert_id]
        cached.access_count += 1
    
    return CounselorSummaryResponse(
        alert_id=alert_id,
        summary=cached.summary,
        generated_at=cached.created_at,
        cached=True,
    )


@router.post("/chat")
async def counselor_chat(
    request: CounselorChatRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Continue conversation about a specific alert.
    
    Counselor can ask follow-up questions about patterns,
    risk factors, or suggested approaches.
    """
    counselor_id, role = await get_counselor_from_token(authorization)
    
    # Get or create session for this counselor + alert
    session_key = get_session_key(counselor_id, request.alert_id)
    
    async with cache_lock:
        if session_key not in counselor_sessions:
            # Create new session with system prompt
            history = ConversationHistory(session_id=session_key)
            history.add_system_message(
                "You are an AI clinical assistant for university wellbeing counselors. "
                "Provide concise, evidence-based answers. Reference specific data when relevant."
            )
            counselor_sessions[session_key] = history
        else:
            history = counselor_sessions[session_key]
    
    context = {
        "token": authorization[7:] if authorization else "",
        "counselor_id": counselor_id,
        "spring_boot_url": "http://localhost:8080",
        "alert_id": request.alert_id,
    }
    
    # Stream response
    return StreamingResponse(
        stream_counselor_chat(
            message=request.message,
            alert_id=request.alert_id,
            history=history,
            context=context,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat/{alert_id}/response")
async def counselor_chat_sync(
    alert_id: str,
    request: CounselorChatRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Synchronous counselor chat (non-streaming).
    
    For clients that don't support SSE.
    """
    counselor_id, role = await get_counselor_from_token(authorization)
    
    session_key = get_session_key(counselor_id, alert_id)
    
    async with cache_lock:
        if session_key not in counselor_sessions:
            history = ConversationHistory(session_id=session_key)
            history.add_system_message(
                "You are an AI clinical assistant for university wellbeing counselors."
            )
            counselor_sessions[session_key] = history
        else:
            history = counselor_sessions[session_key]
    
    context = {
        "token": authorization[7:] if authorization else "",
        "counselor_id": counselor_id,
        "spring_boot_url": "http://localhost:8080",
        "alert_id": alert_id,
    }
    
    agent = create_counselor_agent()
    
    try:
        response = await agent.run(
            user_message=request.message,
            history=history,
            context=context,
            stream=False,
        )
    except Exception as e:
        response = f"Error generating response: {str(e)}"
    
    return CounselorChatResponse(
        alert_id=alert_id,
        response=response,
        conversation_id=session_key,
    )


@router.delete("/session/{alert_id}")
async def clear_counselor_session(
    alert_id: str,
    authorization: Optional[str] = Header(None),
):
    """
    Clear conversation history for an alert.
    """
    counselor_id, _ = await get_counselor_from_token(authorization)
    
    session_key = get_session_key(counselor_id, alert_id)
    
    async with cache_lock:
        if session_key in counselor_sessions:
            del counselor_sessions[session_key]
    
    return {"status": "cleared", "alert_id": alert_id}


@router.delete("/cache/{alert_id}")
async def clear_summary_cache(
    alert_id: str,
    authorization: Optional[str] = Header(None),
):
    """
    Clear cached summary for an alert.
    """
    await get_counselor_from_token(authorization)  # Verify auth
    
    async with cache_lock:
        if alert_id in summary_cache:
            del summary_cache[alert_id]
    
    return {"status": "cleared", "alert_id": alert_id}


@router.get("/cache/stats")
async def get_cache_stats(
    authorization: Optional[str] = Header(None),
):
    """
    Get summary cache statistics.
    """
    await get_counselor_from_token(authorization)
    
    async with cache_lock:
        total = len(summary_cache)
        total_accesses = sum(s.access_count for s in summary_cache.values())
    
    return {
        "total_summaries": total,
        "total_accesses": total_accesses,
        "cache_keys": list(summary_cache.keys()),
    }
