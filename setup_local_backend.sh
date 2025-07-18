#!/bin/bash

# SoulSense AI - Backend Setup Script
# Sets up Python FastAPI backend for local development

echo "🐍 SoulSense AI - Backend Setup"
echo "==============================="
echo

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Run this script from the project root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

echo "🔍 Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ Found: $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate || {
    echo "❌ Failed to activate virtual environment"
    exit 1
}

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env from template"
    echo "⚠️  Please add your OpenRouter API key to backend/.env"
else
    echo "✅ .env file already exists"
fi

# Initialize database
echo "💾 Initializing database..."
python scripts/init_db.py

echo
echo "✅ Backend setup complete!"
echo
echo "🚀 To start the backend server:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --host 0.0.0.0 --port 5000 --reload"
echo
echo "📝 Don't forget to add your OpenRouter API key to backend/.env"