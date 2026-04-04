# AI Service File Structure

```
burnout-ai-service/
├── main.py                      # FastAPI app entry point
├── requirements.txt             # Python dependencies
├── README.md                    # Documentation
├── start.sh                     # Startup script
├── rabbitmq_consumer.py         # RabbitMQ alert consumer
│
├── agent/                       # Core agent module
│   ├── __init__.py
│   ├── agent_config.py          # Config, SystemPrompt, ToolDefinition models
│   ├── ollama_client.py         # Async Ollama LLM client (from upstreamproxy.ts pattern)
│   ├── conversation.py          # ConversationHistory, Message (from sessionHistory.ts pattern)
│   └── wellness_agent.py        # Core agent loop: input → think → tool → observe → respond
│
├── tools/                       # Tool definitions and executors
│   ├── __init__.py
│   ├── registry.py              # ToolRegistry and @tool decorator
│   ├── student_context.py       # Get comprehensive student context
│   ├── mood_history.py          # Fetch mood entries from Spring Boot
│   ├── burnout_score.py         # Fetch burnout score from Spring Boot
│   ├── intervention.py          # Trigger breathing exercise, get wellness tips
│   └── counselor_summary.py     # Generate counselor alert summary data
│
├── routes/                      # API route handlers
│   ├── __init__.py
│   ├── chat_routes.py           # Feature 1: Student AI Companion (WebSocket)
│   ├── agent_routes.py          # Feature 2: Proactive Wellness Agent
│   └── counselor_routes.py      # Feature 3: Counselor AI Assistant
│
└── prompts/                     # System prompts for each feature
    ├── __init__.py
    ├── student_companion.py     # Empathetic student chat prompt
    ├── proactive_agent.py       # Background alert message prompt
    └── counselor_assistant.py   # Professional counselor summary prompt
```

## Key Patterns from Reference Architecture

### From `upstreamproxy.ts`:
- **OllamaClient** (`agent/ollama_client.py`): Async HTTP client with streaming support
- **Tool calling**: Same schema format (name, description, parameters)
- **Error recovery**: Retry logic with exponential backoff
- **Graceful degradation**: Fallback responses when LLM unavailable

### From `sessionHistory.ts`:
- **ConversationHistory** (`agent/conversation.py`): Message storage with pagination
- **Context window management**: Token-limited history retrieval
- **Serialization**: to_dict/from_dict for storage

### From `package.json`:
- **Dependencies** (`requirements.txt`): Python equivalents
  - `httpx` → async HTTP (like axios)
  - `websockets` → WebSocket support
  - `aio-pika` → async RabbitMQ
  - `pydantic` → data validation (like zod)
  - `sse-starlette` → Server-Sent Events

## Three Features Implementation

### Feature 1: Student AI Companion
**File**: `routes/chat_routes.py`
- WebSocket endpoint: `/api/chat/ws/{user_id}`
- Streams responses chunk-by-chunk
- Tools: get_mood_history, get_burnout_score, trigger_breathing_exercise, get_wellness_tips
- Context: burnout score, mood history, sleep patterns, stress levels

### Feature 2: Proactive Wellness Agent
**File**: `routes/agent_routes.py` + `rabbitmq_consumer.py`
- Triggered by RabbitMQ `burnout_alerts` queue
- Generates personalized message per student
- Posts to notification feed via Spring Boot
- Fully autonomous (no human input)

### Feature 3: Counselor AI Assistant
**File**: `routes/counselor_routes.py`
- Pre-generates summaries for RED/ORANGE alerts
- Pattern analysis, risk factors, suggested topics
- Follow-up Q&A capability
- Streaming summary generation option

## Data Flow

```
Student Chat:
  Frontend → WebSocket → WellnessAgent → [Tools] → Spring Boot → Response

Proactive Agent:
  Spring Boot → RabbitMQ → Consumer → WellnessAgent → Spring Boot Notifications

Counselor Assistant:
  Counselor Dashboard → REST → WellnessAgent → Spring Boot → Summary
```

## Integration Points

1. **Spring Boot** (`http://localhost:8080`): All student data access
2. **Ollama** (`http://localhost:11434`): LLM inference with Qwen3
3. **RabbitMQ** (`amqp://localhost:5672`): Alert event queue
4. **JWT Auth**: Passed from frontend, validated by Spring Boot
