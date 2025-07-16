#!/bin/bash

# SoulSense AI - Development Startup Script
echo "🚀 Starting SoulSense AI Development Environment..."

# Start Python FastAPI Backend
echo "🐍 Starting Python FastAPI Backend..."
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start React Frontend
echo "⚛️ Starting React Frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ SoulSense AI Development Environment Started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"

# Keep script running
wait $BACKEND_PID $FRONTEND_PID