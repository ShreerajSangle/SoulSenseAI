#!/bin/bash

# SoulSense AI - Complete Local Development Startup
# Starts both backend and frontend in perfect sync

echo "🎯 SoulSense AI - Local Development Startup"
echo "==========================================="
echo

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Kill processes on our ports if they exist
echo "🧹 Cleaning up existing processes..."
if check_port 5000; then
    echo "Killing process on port 5000..."
    npx kill-port 5000 2>/dev/null || true
fi

if check_port 3000; then
    echo "Killing process on port 3000..."
    npx kill-port 3000 2>/dev/null || true
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo "✅ All prerequisites found"

# Setup backend if needed
if [ ! -d "backend/venv" ]; then
    echo "🔧 Setting up backend for first time..."
    ./setup_local_backend.sh
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "🔧 Installing frontend dependencies..."
    npm install
fi

# Create main .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating main .env file..."
    cat > .env << 'EOL'
# SoulSense AI Environment Configuration

# REQUIRED: OpenRouter API Key for AI responses
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///soulsense.db

# Development Settings
NODE_ENV=development

# Session Secret
SESSION_SECRET=soulsense_local_development_secret
EOL
    echo "✅ Created .env file"
    echo "⚠️  Please add your OpenRouter API key to .env"
else
    echo "✅ Main .env file exists"
fi

# Copy .env to backend if needed
if [ ! -f "backend/.env" ]; then
    cp .env backend/.env
    echo "✅ Copied .env to backend directory"
fi

# Start the application
echo
echo "🚀 Starting SoulSense AI..."
echo "Backend: http://localhost:5000"
echo "API Docs: http://localhost:5000/docs"
echo
echo "🛑 Press Ctrl+C to stop all services"
echo

# Option 1: Start unified server (recommended)
if [ "$1" == "--unified" ] || [ "$1" == "" ]; then
    echo "Starting unified server (backend + frontend)..."
    npm run dev
    
# Option 2: Start separate backend and frontend
elif [ "$1" == "--separate" ]; then
    echo "Starting separate backend and frontend servers..."
    
    # Start backend in background
    echo "Starting Python FastAPI backend on port 5000..."
    cd backend
    source venv/bin/activate
    uvicorn main:app --host 0.0.0.0 --port 5000 --reload &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    echo "Starting React frontend on port 3000..."
    if [ -d "client" ]; then
        cd client && npm start &
    elif [ -d "frontend" ]; then
        cd frontend && npm start &
    else
        # Use main package.json
        npm start &
    fi
    FRONTEND_PID=$!
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
fi