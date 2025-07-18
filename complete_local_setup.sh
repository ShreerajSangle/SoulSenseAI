#!/bin/bash

# SoulSense AI - Complete Local Setup
# This script sets up everything needed to run SoulSense AI locally

set -e  # Exit on any error

echo "🎯 SoulSense AI - Complete Local Setup"
echo "======================================"
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check prerequisites
echo "🔍 Step 1: Checking Prerequisites"
echo "================================="

# Check Python
if ! command_exists python3; then
    echo "❌ Python 3 not found"
    echo "   Please install Python 3.9+ from https://python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ $PYTHON_VERSION"

# Check Node.js
if ! command_exists node; then
    echo "❌ Node.js not found"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION"

# Check npm
if ! command_exists npm; then
    echo "❌ npm not found"
    echo "   Please install npm"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm $NPM_VERSION"

# Check pip
if ! command_exists pip3; then
    echo "❌ pip3 not found"
    echo "   Please install pip3"
    exit 1
fi

echo "✅ pip3 available"
echo

# Backend Setup
echo "🐍 Step 2: Backend Setup (Python FastAPI)"
echo "=========================================="

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip >/dev/null 2>&1

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating backend .env file..."
    cp .env.example .env
    echo "✅ Created backend/.env"
else
    echo "✅ Backend .env already exists"
fi

# Initialize database
echo "💾 Initializing database..."
python scripts/init_db.py

cd ..
echo

# Frontend Setup
echo "⚛️  Step 3: Frontend Setup (React)"
echo "=================================="

# Install main dependencies
echo "📦 Installing main dependencies..."
npm install >/dev/null 2>&1
echo "✅ Main dependencies installed"

# Setup frontend if it exists
if [ -d "frontend" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install >/dev/null 2>&1
    echo "✅ Frontend dependencies installed"
    cd ..
fi

# Environment Configuration
echo "🔧 Step 4: Environment Configuration"
echo "===================================="

# Create main .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating main .env file..."
    cat > .env << 'EOL'
# SoulSense AI Environment Configuration

# REQUIRED: OpenRouter API Key for AI responses
# Get yours at: https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Database Configuration (SQLite used by default)
DATABASE_URL=sqlite:///soulsense.db

# Development Settings
NODE_ENV=development

# Session Secret
SESSION_SECRET=soulsense_local_development_secret_change_in_production
EOL
    echo "✅ Created main .env file"
else
    echo "✅ Main .env file already exists"
fi

# Copy main .env to backend if needed
if [ ! -f "backend/.env" ]; then
    cp .env backend/.env
    echo "✅ Copied .env to backend"
fi

echo

# Port Management
echo "🌐 Step 5: Port Management"
echo "=========================="

# Clean up any existing processes
if check_port 5000; then
    echo "🧹 Cleaning up port 5000..."
    npx kill-port 5000 >/dev/null 2>&1 || true
fi

if check_port 3000; then
    echo "🧹 Cleaning up port 3000..."
    npx kill-port 3000 >/dev/null 2>&1 || true
fi

echo "✅ Ports cleaned"
echo

# Final Check
echo "✅ Step 6: Setup Complete!"
echo "========================="
echo
echo "🎯 SoulSense AI is ready to run locally!"
echo
echo "📝 IMPORTANT: Add your OpenRouter API key"
echo "   1. Get a free key from: https://openrouter.ai/"
echo "   2. Edit .env and add: OPENROUTER_API_KEY=your_key_here"
echo
echo "🚀 Start Options:"
echo "   1. Unified Server (Recommended):"
echo "      npm run dev"
echo "      Visit: http://localhost:5000"
echo
echo "   2. Python Backend Only:"
echo "      cd backend"
echo "      source venv/bin/activate"
echo "      uvicorn main:app --host 0.0.0.0 --port 5000 --reload"
echo
echo "   3. Complete Development Mode:"
echo "      ./start_local_development.sh --separate"
echo "      Backend: http://localhost:5000"
echo "      Frontend: http://localhost:3000"
echo
echo "🔧 Verification:"
echo "   ./verify_local_setup.sh"
echo
echo "📚 Documentation:"
echo "   - QUICK_START_LOCAL.md"
echo "   - LOCAL_DEPLOYMENT_COMPLETE.md"
echo "   - STEP_BY_STEP_LOCAL_SETUP.md"
echo

# Check API key
if grep -q "OPENROUTER_API_KEY=your_openrouter_api_key_here" .env 2>/dev/null; then
    echo "⚠️  Remember to configure your OpenRouter API key!"
    echo "   Without it, AI chat features won't work."
else
    echo "✅ API key appears to be configured"
fi

echo
echo "🎉 Setup complete! Ready to develop SoulSense AI locally."