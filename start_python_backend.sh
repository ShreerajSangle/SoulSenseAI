#!/bin/bash

# Start Python FastAPI Backend for SoulSense AI
echo "Starting SoulSense AI Python FastAPI Backend..."

# Navigate to backend directory
cd backend

# Install dependencies if needed
echo "Checking Python dependencies..."
python -c "import fastapi, uvicorn, pydantic" 2>/dev/null || {
    echo "Installing Python dependencies..."
    pip install fastapi uvicorn pydantic httpx aiosqlite python-multipart "python-jose[cryptography]" "passlib[bcrypt]" python-dotenv
}

# Start the FastAPI server
echo "Starting FastAPI server on port 5000..."
python main.py