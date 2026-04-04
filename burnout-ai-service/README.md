# Burnout Tracker AI Service

FastAPI-based AI service providing three wellness features for the Burnout Tracker system.

## Features

### 1. Student AI Companion (`/api/chat`)
Real-time chat widget embedded in the student web app.
- **WebSocket streaming** at `/api/chat/ws/{user_id}`
- Context-aware responses using burnout score, mood history, sleep patterns
- Empathetic support with actionable suggestions
- Breathing exercise triggers and wellness tips

### 2. Proactive Wellness Agent (`/api/agent`)
Background agent triggered automatically by RabbitMQ alerts.
- Listens to `burnout_alerts` queue
- Generates personalized messages for each student
- Posts to student notification feed via Spring Boot
- 100% autonomous operation

### 3. Counselor AI Assistant (`/api/counselor`)
AI summaries inside counselor dashboard.
- Pre-generated summaries for RED/ORANGE alerts
- Pattern analysis, risk factors, suggested approach
- Follow-up Q&A capability
- Saves 10-15 minutes per case review

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│  FastAPI AI      │────▶│  Spring Boot    │
│   Frontend      │◀────│  Service :8001   │◀────│  Backend :8080  │
│   :3000         │     │                  │     │                 │
└─────────────────┘     └────────┬─────────┘     └────────┬────────┘
                                 │                        │
                          ┌──────▼────────┐      ┌───────▼────────┐
                          │   Ollama      │      │   PostgreSQL   │
                          │   Qwen3       │      │   Student Data │
                          │   :11434      │      │                │
                          └───────────────┘      └────────────────┘
                                 
┌─────────────────┐
│   RabbitMQ      │
│   Alerts Queue  │───────┐
│   :5672         │       │
└─────────────────┘       │
                          │
                   ┌──────▼─────────┐
                   │  AI Consumer   │
                   │  (background)  │
                   └────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd burnout-ai-service
pip install -r requirements.txt
```

### 2. Start Ollama

```bash
ollama serve
ollama pull qwen3
```

### 3. Run AI Service

```bash
python -m burnout-ai-service.main
# Or with uvicorn directly:
uvicorn burnout-ai-service.main:app --reload --host 0.0.0.0 --port 8001
```

### 4. Run RabbitMQ Consumer (optional, for Feature 2)

```bash
python burnout-ai-service/rabbitmq_consumer.py
```

## API Endpoints

### Student Chat
- `WS /api/chat/ws/{user_id}` - WebSocket chat connection
- `POST /api/chat/session/{user_id}` - Create chat session
- `GET /api/chat/session/{session_id}/history` - Get chat history
- `DELETE /api/chat/session/{session_id}` - Clear session

### Proactive Agent
- `POST /api/agent/process-alert` - Generate proactive message for alert
- `POST /api/agent/rabbitmq/consume` - RabbitMQ webhook endpoint

### Counselor Assistant
- `POST /api/counselor/alert/{alert_id}/summary` - Generate AI summary
- `POST /api/counselor/alert/{alert_id}/ask` - Follow-up question
- `GET /api/counselor/alert/{alert_id}/stream-summary` - Stream summary generation
- `DELETE /api/counselor/alert/{alert_id}/conversation` - Clear conversation

## Configuration

Environment variables (optional, defaults shown):

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3
SPRING_BOOT_URL=http://localhost:8080
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
AI_SERVICE_PORT=8001
```

## Reference Architecture

Patterns adapted from:
- `upstreamproxy.ts` - LLM streaming and tool calling
- `sessionHistory.ts` - Conversation history management
- `package.json` - Dependency patterns (adapted for Python)

## Error Handling

- **Ollama offline**: Graceful fallback messages
- **Spring Boot unavailable**: Cached context data
- **RabbitMQ disconnected**: Auto-reconnect with backoff
- **Rate limiting**: Built into agent retry logic

## Security

- JWT authentication for all endpoints
- CORS restricted to frontend/backend origins
- No direct database access (all via Spring Boot)
- Conversation history not persisted (in-memory)
