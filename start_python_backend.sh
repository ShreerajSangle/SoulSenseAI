#!/bin/bash

echo "🔄 Stopping TypeScript Express server..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

echo "🚀 Starting SoulSense AI Python Backend..."
cd backend

# Set environment variables
export NODE_ENV=development
export PYTHONPATH=$(pwd)

# Start the Python FastAPI server
echo "📍 Starting server on http://localhost:5000"
echo "📚 API docs: http://localhost:5000/docs"
exec python3 main.py