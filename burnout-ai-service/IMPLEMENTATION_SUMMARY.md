# AI Service Implementation Summary

## Completed Files

### Core Agent Infrastructure
- `agent/ollama_client.py` - Async Ollama LLM client with streaming
- `agent/conversation.py` - Conversation history management (sessionHistory.ts pattern)
- `agent/agent_config.py` - Configuration constants and environment variables
- `agent/wellness_agent.py` - Core agent loop (input → think → tool → observe → respond)

### Tool System
- `tools/registry.py` - Tool registration and execution
- `tools/student_context.py` - Get student's complete wellbeing context
- `tools/mood_history.py` - Fetch mood entries from Spring Boot
- `tools/burnout_score.py` - Fetch burnout score
- `tools/intervention.py` - Trigger breathing exercises and wellness tips
- `tools/counselor_summary.py` - Generate clinical alert summaries

### System Prompts
- `prompts/student_companion.py` - "Willow" personality, crisis detection
- `prompts/proactive_agent.py` - Background message generation (60 words max)
- `prompts/counselor_assistant.py` - Clinical summaries for counselors

### API Routes
- `routes/chat_routes.py` - Student AI Companion (WebSocket/SSE streaming)
- `routes/agent_routes.py` - Proactive Wellness Agent (RabbitMQ consumer)
- `routes/counselor_routes.py` - Counselor AI Assistant (cached summaries)

### Main Application
- `main.py` - Updated with startup events and fallback middleware
- `requirements.txt` - Updated with new dependencies
- `rabbitmq_consumer.py` - Async RabbitMQ consumer for alerts

---

## Spring Boot Integration

### Updated Files

#### `AlertTriggerService.java`
Added RabbitMQ publishing after alert creation:

```java
private final RabbitTemplate rabbitTemplate;

private void createAlert(...) {
    // ... save alert
    publishAlertEvent(alert);
}

private void publishAlertEvent(Alert alert) {
    Map<String, Object> event = new HashMap<>();
    event.put("alertId", alert.getId().toString());
    event.put("alertType", alert.getAlertType().toString());
    event.put("userId", alert.getUserId().toString());
    event.put("burnoutScore", alert.getBurnoutScore().doubleValue());
    event.put("triggerReason", alert.getTriggerReason());
    event.put("riskLevel", alert.getRiskLevel());
    
    rabbitTemplate.convertAndSend(
        "burnout.alerts.exchange",
        "burnout.alerts.new",
        event
    );
}
```

#### `RabbitMQConfig.java` (NEW)
RabbitMQ exchange and queue configuration:

```java
@Configuration
public class RabbitMQConfig {
    public static final String ALERT_EXCHANGE = "burnout.alerts.exchange";
    public static final String ALERT_QUEUE = "burnout.alerts.new";
    
    @Bean
    public TopicExchange alertExchange() { ... }
    
    @Bean
    public Queue alertQueue() { ... }
    
    @Bean
    public Binding alertBinding(...) { ... }
}
```

#### `application.yml`
Already configured:
```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME:guest}
    password: ${RABBITMQ_PASSWORD:guest}
```

---

## API Endpoints

### Feature 1: Student AI Companion
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat/start` | Start new chat session (SSE stream) |
| POST | `/ai/chat/message` | Continue existing session (SSE stream) |
| DELETE | `/ai/chat/session/{id}` | Clear conversation |
| GET | `/ai/chat/history/{id}` | Get chat history |

### Feature 2: Proactive Wellness Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/agent/generate-message` | Generate message for alert |
| POST | `/ai/agent/rabbitmq/consume` | RabbitMQ webhook |
| GET | `/ai/agent/health` | Health check |

### Feature 3: Counselor AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/counselor/summary/{id}` | Generate clinical summary (SSE) |
| GET | `/ai/counselor/summary/{id}/cached` | Get cached summary |
| POST | `/ai/counselor/chat` | Follow-up Q&A (SSE) |
| DELETE | `/ai/counselor/cache/{id}` | Clear cache |

---

## Data Flow

### Student Chat Flow
```
Student → Frontend → POST /ai/chat/start → WellnessAgent
                                           ↓
                                    get_student_context
                                           ↓
                                    Spring Boot API
                                           ↓
                                    Ollama (Qwen3)
                                           ↓
                                    SSE Stream → Frontend
```

### Proactive Agent Flow
```
Spring Boot AlertTriggerService
           ↓
    RabbitMQ (burnout.alerts.new)
           ↓
    RabbitMQConsumer
           ↓
    POST /ai/agent/generate-message
           ↓
    ProactiveAgent → Ollama
           ↓
    POST /api/notifications/create → Spring Boot
```

### Counselor Summary Flow
```
Counselor Dashboard → POST /ai/counselor/summary/{id}
                                      ↓
                              Check cache
                                      ↓ (if miss)
                              CounselorAgent
                                      ↓
                              generate_counselor_summary tool
                                      ↓
                              Spring Boot API
                                      ↓
                              Ollama
                                      ↓
                              Cache + SSE Stream
```

---

## Error Handling

### Ollama Offline
Fallback middleware returns graceful message:
```json
{
  "type": "fallback",
  "content": "Our AI companion is taking a short break. Please check back in a few minutes.",
  "fallback": true
}
```

### Spring Boot Unavailable
Tools return cached context or error message:
```
Error: Backend unavailable (using cached data)
```

### RabbitMQ Disconnected
Consumer auto-reconnects with 5-second backoff.

---

## Security

- **JWT Authentication**: All endpoints require Bearer token
- **Role Verification**: Counselor routes verify COUNSELOR role
- **Internal API Key**: Agent routes require `X-Internal-Key` header
- **CORS**: Restricted to frontend/backend origins
- **No Direct DB Access**: All data via Spring Boot APIs

---

## Running the Service

### 1. Start Dependencies
```bash
# Ollama
ollama serve
ollama pull qwen3

# RabbitMQ (via Docker Compose)
docker-compose up -d rabbitmq

# Spring Boot (port 8080)
cd burnout-backend && mvn spring-boot:run
```

### 2. Start AI Service
```bash
cd burnout-ai-service
pip install -r requirements.txt
uvicorn burnout-ai-service.main:app --reload --port 8001
```

### 3. Verify
```bash
curl http://localhost:8001/health
# {"status":"healthy","ollama":"connected","rabbitmq":"connected"}
```

---

## Next Steps (Production)

1. **Redis**: Replace in-memory session/cache stores
2. **JWT Validation**: Implement proper JWT decoding in routes
3. **Service Account JWT**: For AI → Spring Boot calls
4. **Monitoring**: Add Prometheus metrics for LLM calls
5. **Rate Limiting**: Prevent abuse of AI endpoints
6. **Logging**: Structured logging with correlation IDs
7. **Tests**: Unit tests for agents, integration tests for routes
