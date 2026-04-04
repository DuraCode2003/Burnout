#!/bin/bash
# AI Features Test Runner

echo "=========================================="
echo "  Burnout Tracker AI - Test Suite"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Ollama
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "❌ Ollama is not running"
    echo "   Run: ollama serve"
    exit 1
fi

# Check FastAPI
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ AI Service is running"
else
    echo "⚠️  AI Service not running (will start for testing)"
fi

# Check Spring Boot
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Spring Boot is running"
else
    echo "⚠️  Spring Boot not running (tests may fail)"
fi

# Check RabbitMQ
if curl -s http://localhost:15672 > /dev/null 2>&1; then
    echo "✅ RabbitMQ is running"
else
    echo "⚠️  RabbitMQ not running (test 6 will fail)"
fi

echo ""
echo "Running tests..."
echo ""

# Run Python tests
cd "$(dirname "$0")/.."
python3 tests/test_ai_features.py

exit_code=$?

echo ""
echo "=========================================="
if [ $exit_code -eq 0 ]; then
    echo "  All tests passed! ✅"
else
    echo "  Some tests failed ❌"
fi
echo "=========================================="

exit $exit_code
