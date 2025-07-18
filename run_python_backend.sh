#!/bin/bash

# SoulSense AI - Python FastAPI Backend Startup Script
# This replaces the TypeScript/Express server

echo "🚀 Starting SoulSense AI Python Backend..."

# Kill any existing TypeScript server
pkill -f "tsx server/index.ts" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null

# Navigate to backend directory
cd backend

# Check Python dependencies
echo "📦 Checking Python dependencies..."
python -c "import fastapi, uvicorn, pydantic, httpx, aiosqlite" 2>/dev/null || {
    echo "❌ Missing Python dependencies. Installing..."
    pip install fastapi uvicorn pydantic httpx aiosqlite python-multipart "python-jose[cryptography]" "passlib[bcrypt]" python-dotenv
}

echo "✅ All dependencies ready"

# Start the Python FastAPI server
echo "🧠 Starting Python FastAPI Backend on port 5000..."
echo "📍 API Documentation: http://localhost:5000/docs"
echo "💻 React Frontend: Connect via standard workflow"
echo ""

# Run the server
python main.py