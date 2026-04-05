"""
Feature 2: Proactive Wellness Agent Routes.

Background agent triggered by RabbitMQ alerts.
Generates personalized messages posted to student notification feed.
"""

from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import httpx
import json

from agent.wellness_agent import create_proactive_agent, create_daily_tip_agent, create_counselor_agent, ConversationHistory
from prompts.proactive_agent import get_prompt_for_alert, validate_message
from prompts.daily_tip import get_tip_prompt
from prompts.counselor_assistant import get_summary_prompt

router = APIRouter(prefix="/ai/agent", tags=["Proactive Agent"])

# ============================================================================
# Configuration
# ============================================================================

INTERNAL_API_KEY = "burnout-internal-secure-key-2026"
SPRING_BOOT_URL = "http://localhost:8080"
RABBITMQ_URL = "amqp://guest:guest@localhost:5672/"
ALERT_QUEUE = "burnout.alerts.new"

# ============================================================================
# Request/Response Models
# ============================================================================

class StudentData(BaseModel):
    anonymous_id: str
    department: str
    burnout_score: float
    recent_mood_avg: float
    recent_sleep_avg: float
    dominant_stress: str
    trigger_reason: str


class GenerateMessageRequest(BaseModel):
    alert_id: str
    alert_type: str  # "YELLOW", "ORANGE", "RED"
    student_data: StudentData


class GenerateMessageResponse(BaseModel):
    success: bool
    message_generated: str
    alert_id: str
    posted_to_feed: bool


class RabbitMQAlert(BaseModel):
    alert_id: str
    user_id: str
    alert_type: str
    trigger_reason: str
    burnout_score: float
    risk_level: str


class GenerateTipRequest(BaseModel):
    user_id: str
    student_name: str
    burnout_score: float
    risk_level: str
    mood_trend: str


class GenerateTipResponse(BaseModel):
    success: bool
    tip: str
    category: str


class GenerateCounselorSummaryRequest(BaseModel):
    alert_id: str
    student_id: str
    alert_type: str
    trigger_reason: str
    burnout_score: float
    recent_mood_avg: float


class GenerateCounselorSummaryResponse(BaseModel):
    success: bool
    summary: str


class GenerateEscalationRequest(BaseModel):
    alert_id: str
    student_id: str
    alert_type: str
    trigger_reason: str
    burnout_score: float
    recent_mood_avg: float
    escalation_reason: str


# ============================================================================
# Helper Functions
# ============================================================================

async def post_to_notification_feed(
    user_id: str,
    message: str,
    alert_id: str,
    jwt_token: str,
) -> bool:
    """
    Post generated message to student's notification feed via Spring Boot.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SPRING_BOOT_URL}/api/notifications/create",
                headers={
                    "Authorization": f"Bearer {jwt_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "userId": user_id,
                    "message": message,
                    "alertId": alert_id,
                    "type": "WELLNESS_CHECK",
                    "priority": "NORMAL",
                },
                timeout=10.0,
            )
            return response.status_code in (200, 201)
    except Exception as e:
        print(f"Failed to post notification: {e}")
        return False


async def generate_wellness_message(
    alert_type: str,
    student_data: dict,
    context: dict,
) -> str:
    """
    Generate personalized wellness message using proactive agent.
    """
    agent = create_proactive_agent()
    
    # Build prompt
    prompt = get_prompt_for_alert(alert_type, student_data)
    
    # Run agent (single turn, no history)
    message = await agent.run_single(prompt, context)
    
    # Validate message
    is_valid, issues = validate_message(message, alert_type)
    
    if not is_valid:
        print(f"Message validation issues: {issues}")
        # Try to regenerate once
        prompt += "\n\nPlease revise to address: " + ", ".join(issues)
        message = await agent.run_single(prompt, context)
    
    return message


# ============================================================================
# Routes
# ============================================================================

@router.post("/generate-message", response_model=GenerateMessageResponse)
async def generate_message(
    request: GenerateMessageRequest,
    background_tasks: BackgroundTasks,
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    """
    Generate proactive wellness message for an alert.
    
    Called by Spring Boot when alerts fire.
    Posts message to student's notification feed.
    """
    # Verify internal API key
    if x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid internal key")
    
    # Validate alert type
    if request.alert_type not in ["YELLOW", "ORANGE", "RED"]:
        raise HTTPException(status_code=400, detail="Invalid alert type")
    
    # Generate message
    context = {
        "spring_boot_url": SPRING_BOOT_URL,
        "alert_type": request.alert_type,
    }
    
    try:
        message = await generate_wellness_message(
            alert_type=request.alert_type,
            student_data=request.student_data.model_dump(),
            context=context,
        )
    except Exception as e:
        # Fallback message
        message = (
            "We noticed you might be going through a tough time. "
            "Consider taking a moment for yourself today. You're doing great."
        )
    
    # Post to notification feed in background
    posted = False
    # Would need JWT for Spring Boot - in production, use service account
    # background_tasks.add_task(
    #     post_to_notification_feed,
    #     user_id=request.student_data.anonymous_id,
    #     message=message,
    #     alert_id=request.alert_id,
    #     jwt_token="",  # Service account token
    # )
    
    return GenerateMessageResponse(
        success=True,
        message_generated=message,
        alert_id=request.alert_id,
        posted_to_feed=posted,
    )


@router.post("/generate-tip", response_model=GenerateTipResponse)
async def generate_tip(
    request: GenerateTipRequest,
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    """
    Generate a personalized daily mindfulness tip.
    """
    if x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid internal key")
    
    # Use the centralized factory to create the tip-specific agent
    agent = create_daily_tip_agent()
    
    prompt = get_tip_prompt(
        request.student_name,
        request.burnout_score,
        request.risk_level,
        request.mood_trend
    )
    
    try:
        # Generate the tip
        tip = await agent.run_single(prompt, context={})
        
        # Determine category based on content (simple keyword matching)
        category = "Mindfulness"
        content_lower = tip.lower()
        if any(w in content_lower for w in ["breath", "inhale", "exhale"]):
            category = "Breathing"
        elif any(w in content_lower for w in ["sleep", "rest", "nap", "bed"]):
            category = "Sleep"
        elif any(w in content_lower for w in ["walk", "exercise", "move", "stretch"]):
            category = "Physical"
        elif any(w in content_lower for w in ["talk", "friend", "social", "call"]):
            category = "Social"
        
        return GenerateTipResponse(
            success=True,
            tip=tip.strip('"'),
            category=category
        )
    except Exception as e:
        print(f"Error generating daily tip: {e}")
        return GenerateTipResponse(
            success=False,
            tip="Our AI is taking a peaceful break. Please check back soon.",
            category="System"
        )


@router.post("/generate-summary", response_model=GenerateCounselorSummaryResponse)
async def generate_counselor_summary_endpoint(
    request: GenerateCounselorSummaryRequest,
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    """
    Generate a clinical summary for a counselor for a specific alert.
    """
    if x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid internal key")
    
    # Format data for the prompt
    alert_info = f"""
    Alert ID: {request.alert_id}
    Severity: {request.alert_type}
    Reason: {request.trigger_reason}
    Burnout Score: {request.burnout_score}
    Mood Average: {request.recent_mood_avg}
    """
    
    try:
        agent = create_counselor_agent()
        summary = await agent.run_single(
            get_summary_prompt(alert_info), 
            context={"alert_id": request.alert_id}
        )
        
        return GenerateCounselorSummaryResponse(
            success=True,
            summary=summary
        )
    except Exception as e:
        print(f"Error generating counselor summary: {e}")
        return GenerateCounselorSummaryResponse(
            success=False,
            summary="Unable to generate AI summary at this time. Please proceed with manual triage."
        )


@router.post("/draft-resolution", response_model=GenerateCounselorSummaryResponse)
async def draft_resolution_endpoint(
    request: GenerateCounselorSummaryRequest,
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    """
    Draft a resolution summary for case closure.
    """
    if x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid internal key")
    
    alert_info = f"Alert ID: {request.alert_id}\nSeverity: {request.alert_type}\nReason: {request.trigger_reason}\nScore: {request.burnout_score}\nMood: {request.recent_mood_avg}"
    
    try:
        from prompts.counselor_assistant import get_resolution_draft_prompt
        agent = create_counselor_agent()
        summary = await agent.run_single(
            get_resolution_draft_prompt(alert_info), 
            context={"alert_id": request.alert_id, "action": "resolution"}
        )
        return GenerateCounselorSummaryResponse(success=True, summary=summary)
    except Exception as e:
        return GenerateCounselorSummaryResponse(success=False, summary="Unable to draft resolution summary.")


@router.post("/draft-escalation", response_model=GenerateCounselorSummaryResponse)
async def draft_escalation_endpoint(
    request: GenerateEscalationRequest,
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    """
    Draft a formal escalation report for senior staff.
    """
    if x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid internal key")
    
    alert_info = f"Alert ID: {request.alert_id}\nSeverity: {request.alert_type}\nReason: {request.trigger_reason}\nScore: {request.burnout_score}\nMood: {request.recent_mood_avg}"
    
    try:
        from prompts.counselor_assistant import get_escalation_report_prompt
        agent = create_counselor_agent()
        summary = await agent.run_single(
            get_escalation_report_prompt(alert_info, request.escalation_reason), 
            context={"alert_id": request.alert_id, "action": "escalation"}
        )
        return GenerateCounselorSummaryResponse(success=True, summary=summary)
    except Exception as e:
        return GenerateCounselorSummaryResponse(success=False, summary="Unable to draft escalation report.")


@router.post("/rabbitmq/consume")
async def consume_rabbitmq_alert(
    alert: RabbitMQAlert,
    background_tasks: BackgroundTasks,
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    """
    Endpoint called by RabbitMQ consumer service.
    
    Processes alert and posts to notification feed.
    """
    # Verify internal API key
    if x_internal_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid internal key")
    
    # Process in background
    async def process_and_post():
        student_data = {
            "anonymous_id": alert.user_id,
            "department": "Unknown",  # Would fetch from backend
            "burnout_score": alert.burnout_score,
            "recent_mood_avg": 0.0,  # Would fetch from backend
            "recent_sleep_avg": 0.0,
            "dominant_stress": "UNKNOWN",
            "trigger_reason": alert.trigger_reason,
        }
        
        context = {
            "spring_boot_url": SPRING_BOOT_URL,
            "alert_type": alert.alert_type,
        }
        
        try:
            message = await generate_wellness_message(
                alert_type=alert.alert_type,
                student_data=student_data,
                context=context,
            )
            
            # Post to feed (would use service account JWT)
            # await post_to_notification_feed(
            #     user_id=alert.user_id,
            #     message=message,
            #     alert_id=alert.alert_id,
            #     jwt_token="",
            # )
            
            print(f"Generated message for alert {alert.alert_id}: {message[:50]}...")
            
        except Exception as e:
            print(f"Error processing alert {alert.alert_id}: {e}")
    
    background_tasks.add_task(process_and_post)
    
    return {"status": "processing", "alert_id": alert.alert_id}


@router.get("/health")
async def health_check():
    """
    Health check for proactive agent service.
    """
    return {
        "status": "healthy",
        "service": "proactive-wellness-agent",
    }


# ============================================================================
# RabbitMQ Consumer (run as background task)
# ============================================================================

class RabbitMQConsumer:
    """
    Async RabbitMQ consumer for burnout alerts.
    """
    
    def __init__(self):
        self._connection = None
        self._channel = None
        self._queue = None
        self._running = False
    
    async def connect(self):
        """Connect to RabbitMQ."""
        try:
            import aio_pika
            
            self._connection = await aio_pika.connect_robust(RABBITMQ_URL)
            self._channel = await self._connection.channel()
            
            # Declare queue
            self._queue = await self._channel.declare_queue(
                ALERT_QUEUE,
                durable=True,
            )
            
            print(f"[RabbitMQ] Connected, queue: {ALERT_QUEUE}")
            return True
            
        except Exception as e:
            print(f"[RabbitMQ] Connection failed: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from RabbitMQ."""
        self._running = False
        if self._connection:
            await self._connection.close()
        print("[RabbitMQ] Disconnected")
    
    async def _on_message(self, message):
        """Handle incoming alert message."""
        async with message.process():
            try:
                body = json.loads(message.body.decode())
                
                # Process alert
                student_data = {
                    "anonymous_id": body.get("user_id", ""),
                    "department": body.get("department", "Unknown"),
                    "burnout_score": body.get("burnout_score", 0),
                    "recent_mood_avg": body.get("mood_avg", 0),
                    "recent_sleep_avg": body.get("sleep_avg", 0),
                    "dominant_stress": body.get("stress_level", "UNKNOWN"),
                    "trigger_reason": body.get("trigger_reason", ""),
                }
                
                context = {
                    "spring_boot_url": SPRING_BOOT_URL,
                    "alert_type": body.get("alert_type", "YELLOW"),
                }
                
                # Generate message
                message_text = await generate_wellness_message(
                    alert_type=body.get("alert_type", "YELLOW"),
                    student_data=student_data,
                    context=context,
                )
                
                print(f"[RabbitMQ] Generated message: {message_text[:50]}...")
                
                # TODO: Post to notification feed
                
            except Exception as e:
                print(f"[RabbitMQ] Error processing message: {e}")
    
    async def start_consuming(self):
        """Start consuming messages."""
        if not self._queue:
            print("[RabbitMQ] Not connected")
            return
        
        self._running = True
        print(f"[RabbitMQ] Consuming from {ALERT_QUEUE}")
        
        await self._queue.consume(self._on_message)
        
        while self._running:
            await asyncio.sleep(1)
    
    async def run(self):
        """Main run loop with reconnection."""
        while True:
            if await self.connect():
                try:
                    await self.start_consuming()
                except Exception as e:
                    print(f"[RabbitMQ] Consumer error: {e}")
            
            if not self._running:
                break
            
            print("[RabbitMQ] Reconnecting in 5 seconds...")
            await asyncio.sleep(5)


# Global consumer instance
_consumer: Optional[RabbitMQConsumer] = None


async def start_rabbitmq_consumer():
    """Start RabbitMQ consumer as background task."""
    global _consumer
    _consumer = RabbitMQConsumer()
    await _consumer.run()


def stop_rabbitmq_consumer():
    """Stop RabbitMQ consumer."""
    if _consumer:
        asyncio.create_task(_consumer.disconnect())
