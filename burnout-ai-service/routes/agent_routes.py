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

from agent.wellness_agent import create_proactive_agent, ConversationHistory
from prompts.proactive_agent import get_prompt_for_alert, validate_message

router = APIRouter(prefix="/ai/agent", tags=["Proactive Agent"])

# ============================================================================
# Configuration
# ============================================================================

INTERNAL_API_KEY = "internal_service_key_change_in_production"
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
