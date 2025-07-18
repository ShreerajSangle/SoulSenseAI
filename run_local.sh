#!/bin/bash

# SoulSense AI - Complete Local Startup Script
# This script ensures everything is set up and running properly

set -e  # Exit on any error

echo "🎯 SoulSense AI - Complete Local Setup"
echo "======================================"
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking system requirements..."

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    echo "   Download: https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python not found. Please install Python 3.8+"
    echo "   Download: https://python.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
PYTHON_VERSION=$(python3 --version)

echo "✅ Node.js: $NODE_VERSION"
echo "✅ npm: $NPM_VERSION"
echo "✅ Python: $PYTHON_VERSION"
echo

# Create .env if it doesn't exist
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from template"
    else
        cat > .env << 'EOL'
# SoulSense AI Environment Configuration

# REQUIRED: OpenRouter API Key for AI responses
# Get yours at: https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key_here

# OPTIONAL: Database Configuration (SQLite used by default)
# DATABASE_URL=postgresql://username:password@localhost:5432/soulsense

# OPTIONAL: Session Secret
SESSION_SECRET=soulsense_local_development_secret_change_in_production

# Development Settings
NODE_ENV=development
EOL
        echo "✅ Created .env file"
    fi
    echo "⚠️  IMPORTANT: Add your OpenRouter API key to .env"
    echo "   Visit https://openrouter.ai/ to get your free API key"
else
    echo "✅ .env file exists"
fi
echo

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Node.js dependencies installed"
else
    echo "✅ Node.js dependencies already installed"
fi
echo

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
if python3 -c "import fastapi" 2>/dev/null; then
    echo "✅ Python dependencies already installed"
else
    echo "Installing Python packages..."
    if [ -f "local_requirements.txt" ]; then
        pip3 install -r local_requirements.txt
    else
        pip3 install fastapi uvicorn pydantic python-dotenv httpx asyncpg aiosqlite sqlalchemy passlib python-jose python-multipart
    fi
    echo "✅ Python dependencies installed"
fi
echo

# Check for OpenRouter API key
echo "🔑 Checking API configuration..."
if grep -q "OPENROUTER_API_KEY=your_openrouter_api_key_here" .env 2>/dev/null; then
    echo "⚠️  OpenRouter API key not configured"
    echo "   Edit .env and add your API key from https://openrouter.ai/"
    echo "   The app will work but AI responses won't function without it"
    echo
    
    read -p "Start anyway? (AI chat won't work without API key) [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please configure your OpenRouter API key in .env and run again"
        exit 1
    fi
elif grep -q "OPENROUTER_API_KEY=" .env 2>/dev/null; then
    echo "✅ OpenRouter API key configured"
else
    echo "⚠️  No API key found in .env"
fi
echo

# Start the application
echo "🚀 Starting SoulSense AI..."
echo "👀 Visit: http://localhost:5000"
echo "🛑 Press Ctrl+C to stop"
echo

# Start the development server
exec npm run dev