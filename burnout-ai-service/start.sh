#!/bin/bash
# Start Burnout Tracker AI Service

echo "Starting Burnout Tracker AI Service..."

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "Warning: Ollama not running. Start with: ollama serve"
fi

# Check if qwen2.5:0.5b model is available
if ! curl -s http://localhost:11434/api/tags | grep -q "qwen2.5:0.5b"; then
    echo "Pulling qwen2.5:0.5b model..."
    ollama pull qwen2.5:0.5b
fi

# Start the service
echo "Starting FastAPI service on port 8001..."
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
