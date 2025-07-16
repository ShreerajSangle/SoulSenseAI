#!/bin/bash

# SoulSense AI - Development Startup Script
# Runs both frontend and backend in development mode

echo "🪷 Starting SoulSense AI Development Environment"
echo "================================================="

# Function to kill background processes on exit
cleanup() {
    echo "Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Start backend server
echo "🚀 Starting Python FastAPI Backend..."
cd "$(dirname "$0")"
python3 start_backend.py &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Start frontend server
echo "🌐 Starting React Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

# Wait for both processes
echo "✅ Development environment started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "================================================="
echo "Press Ctrl+C to stop all servers"

wait $BACKEND_PID $FRONTEND_PID