#!/bin/bash

echo "🔄 SoulSense AI - Starting Python FastAPI Backend..."

# Kill any existing servers
pkill -f "tsx" 2>/dev/null || true
pkill -f "express" 2>/dev/null || true

# Set environment variables
export NODE_ENV=development
export PYTHONPATH="$(pwd)/backend"

# Start Python FastAPI server
cd backend
echo "🚀 Starting FastAPI server on port 5000..."
uvicorn main:app --host 0.0.0.0 --port 5000 --reload --log-level info