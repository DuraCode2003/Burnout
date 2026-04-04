"""
Burnout Tracker AI Service
FastAPI service providing AI features for the Burnout Tracker system.

Features:
1. Student AI Companion - Real-time chat widget with wellness support
2. Proactive Wellness Agent - Background agent triggered by RabbitMQ alerts
3. Counselor AI Assistant - AI summaries for counselor dashboard

Architecture:
- LLM: Ollama (Qwen3) at http://localhost:11434
- Backend: Spring Boot at http://localhost:8080
- Message Queue: RabbitMQ at amqp://localhost:5672
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import json
from typing import Optional

from routes import chat_router, agent_router, counselor_router
from routes.agent_routes import start_rabbitmq_consumer, stop_rabbitmq_consumer
from agent.ollama_client import OllamaClient
from agent.agent_config import OLLAMA_MODEL


# Global state
_ollama_client: Optional[OllamaClient] = None
_ollama_available: bool = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global _ollama_client, _ollama_available
    
    # Startup
    print("[AI Service] Starting up...")
    
    # Check Ollama availability
    _ollama_client = OllamaClient()
    _ollama_available = await _ollama_client.is_available()
    
    if _ollama_available:
        print(f"[AI Service] ✓ Ollama connected: {OLLAMA_MODEL}")
    else:
        print("[AI Service] ⚠ WARNING: Ollama not available — AI features will use fallbacks")
    
    # Start RabbitMQ consumer in background
    print("[AI Service] Starting RabbitMQ alert consumer...")
    asyncio.create_task(start_rabbitmq_consumer())
    print("[AI Service] ✓ RabbitMQ alert consumer started")
    
    print("[AI Service] Ready to accept requests")
    
    yield
    
    # Shutdown
    print("[AI Service] Shutting down...")
    stop_rabbitmq_consumer()
    if _ollama_client:
        await _ollama_client.close()
    print("[AI Service] Shutdown complete")


app = FastAPI(
    title="Burnout Tracker AI Service",
    description="""
## AI Features for Burnout Tracker

### Feature 1: Student AI Companion
Real-time chat widget providing empathetic wellness support to students.
- WebSocket streaming responses
- Context-aware (burnout score, mood history, sleep patterns)
- Actionable suggestions and breathing exercises

### Feature 2: Proactive Wellness Agent
Background agent triggered by RabbitMQ alerts.
- Generates personalized messages for student notification feed
- Runs autonomously when alerts fire
- Posts via Spring Boot API

### Feature 3: Counselor AI Assistant
AI summaries for counselor dashboard.
- Pattern analysis and risk factors
- Suggested discussion topics
- Follow-up Q&A capability
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Fallback Middleware
# Returns graceful fallback when Ollama is offline
# ============================================================================

FALLBACK_RESPONSE = {
    "type": "fallback",
    "content": "Our AI companion is taking a short break. Please check back in a few minutes.",
    "fallback": True,
}


@app.middleware("http")
async def ollama_fallback_middleware(request: Request, call_next):
    """
    If Ollama is offline, return fallback response for AI routes.
    Never crash — always return something useful.
    """
    # Skip non-AI routes
    if not request.url.path.startswith("/ai/"):
        return await call_next(request)
    
    # Skip if Ollama is available
    if _ollama_available:
        return await call_next(request)
    
    # Return fallback for streaming endpoints
    if "chat" in request.url.path or "summary" in request.url.path:
        from fastapi.responses import StreamingResponse
        
        async def fallback_stream():
            yield f"data: {json.dumps(FALLBACK_RESPONSE)}\n\n"
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            fallback_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache"},
        )
    
    # Return fallback for non-streaming endpoints
    return JSONResponse(content=FALLBACK_RESPONSE, status_code=200)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Burnout Tracker AI Service",
        "status": "running",
        "ollama": "available" if _ollama_available else "unavailable",
        "features": [
            "Student AI Companion (/ai/chat)",
            "Proactive Wellness Agent (/ai/agent)",
            "Counselor AI Assistant (/ai/counselor)",
        ],
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy" if _ollama_available else "degraded",
        "ollama": "connected" if _ollama_available else "disconnected",
        "rabbitmq": "connected",  # Would need actual check
        "spring_boot": "unknown",  # Would need to check separately
    }


# Include routers
app.include_router(chat_router)
app.include_router(agent_router)
app.include_router(counselor_router)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info",
    )
