# AI Features Integration Checklist

## Prerequisites

- [ ] **Ollama is running**
  ```bash
  ollama serve
  # Check: curl http://localhost:11434/api/tags
  ```

- [ ] **Qwen3 model is pulled**
  ```bash
  ollama pull qwen3
  # Check: ollama list | grep qwen3
  ```

- [ ] **FastAPI starts without errors**
  ```bash
  cd burnout-ai-service
  uvicorn main:app --reload --port 8001
  # Check: curl http://localhost:8001/health
  ```

- [ ] **Spring Boot running** (port 8080)
  ```bash
  cd burnout-backend
  mvn spring-boot:run
  # Check: curl http://localhost:8080/actuator/health
  ```

- [ ] **RabbitMQ running** (port 5672)
  ```bash
  docker-compose up -d rabbitmq
  # Check: curl http://localhost:15672
  ```

---

## Run Tests

```bash
cd burnout-ai-service
./tests/run_tests.sh
# Or: python3 tests/test_ai_features.py
```

**All 7 tests must pass:**
- [ ] Test 1: Ollama Connection
- [ ] Test 2: Tool Execution
- [ ] Test 3: Student Agent (full loop)
- [ ] Test 4: Proactive Agent
- [ ] Test 5: Counselor Summary
- [ ] Test 6: RabbitMQ Consumer
- [ ] Test 7: Frontend SSE Streaming

---

## Frontend Integration

- [ ] **Chat widget appears on student dashboard**
  - Navigate to: http://localhost:3000/dashboard
  - Look for floating button (bottom-right, gradient circle)
  - Click to open chat panel

- [ ] **First message auto-sends**
  - Widget opens automatically sends: "Hi Willow, how am I doing?"
  - Watch for streaming response (word by word)

- [ ] **AI responds with personalized context**
  - Response should mention actual data (burnout score, mood, sleep)
  - If backend unavailable, shows fallback message

- [ ] **Conversation continues**
  - Send follow-up messages
  - Verify history is maintained
  - Check streaming works for each response

- [ ] **Counselor AI panel appears on alert detail page**
  - Navigate to counselor dashboard
  - Open an alert (RED/ORANGE)
  - Look for "AI Clinical Summary" panel (right column)

- [ ] **Summary generates or loads from cache**
  - First load: streams generation (watch typing indicator)
  - Second load: instant from cache

- [ ] **Follow-up Q&A works**
  - Type question in "Ask a follow-up..." input
  - Verify streaming response
  - Check conversation history displays

- [ ] **Proactive message generates when test alert is created**
  ```bash
  # Create test alert via Spring Boot API
  curl -X POST http://localhost:8080/api/alerts/test \
    -H "Content-Type: application/json" \
    -d '{"userId": "test-user", "type": "ORANGE"}'
  
  # Check RabbitMQ queue
  # Check student notifications in UI
  ```

---

## Fallback Testing

- [ ] **Stop Ollama**
  ```bash
  # Kill Ollama process
  pkill -f "ollama serve"
  ```

- [ ] **Verify graceful error message**
  - Open chat widget
  - Send message
  - Should see: "Our AI companion is taking a short break..."
  - Frontend should NOT crash

- [ ] **Restart Ollama**
  ```bash
  ollama serve
  ```

- [ ] **Verify recovery**
  - Send message again
  - Should work normally

---

## Performance Checks

- [ ] **First token latency < 2 seconds**
  - Time from send to first chunk received

- [ ] **Streaming smooth (no long pauses)**
  - Chunks should arrive every 10-50ms

- [ ] **Summary generation < 30 seconds**
  - For typical 30-day data

- [ ] **No memory leaks**
  - Check after 10+ chat messages

---

## Security Checks

- [ ] **JWT authentication required**
  - Try without token → should get 401

- [ ] **Counselor role verification**
  - Student JWT on counselor routes → should get 403

- [ ] **CORS restricted**
  - Try from unauthorized origin → should be blocked

- [ ] **No secrets in logs**
  - Check logs for JWT tokens, passwords

---

## Sign-off

All items checked? ✅

**Ready for production deployment!**

---

## Troubleshooting

### Ollama not available
```bash
ollama serve
ollama pull qwen3
```

### Spring Boot connection refused
```bash
cd burnout-backend
mvn spring-boot:run
```

### RabbitMQ not running
```bash
docker-compose up -d rabbitmq
# Access UI: http://localhost:15672 (guest/guest)
```

### AI Service won't start
```bash
cd burnout-ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Chat widget not appearing
```bash
# Check browser console for errors
# Verify component imported in dashboard page
# Check: src/app/(student)/dashboard/page.tsx has <ChatWidget />
```

### SSE stream not working
```bash
# Test with curl:
curl -N -H "Authorization: Bearer test" \
  -X POST http://localhost:8001/ai/chat/start \
  -d '{"message": "Hi"}'
```
