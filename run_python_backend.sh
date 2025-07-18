#!/bin/bash

# SoulSense AI - Python Backend Startup Script
# Specifically for local development with database fixes

set -e

echo "🐍 SoulSense AI - Python Backend Startup"
echo "========================================"
echo

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Run this script from the project root directory"
    exit 1
fi

# Fix database issues first
echo "🔧 Step 1: Fixing Database Issues"
echo "================================="
python3 fix_database_local.py
echo

# Setup backend environment
echo "🔧 Step 2: Backend Environment Setup"
echo "===================================="

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing/updating dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Ensure .env exists
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env || {
        cat > .env << 'EOL'
OPENROUTER_API_KEY=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
DATABASE_URL=sqlite:///backend/soulsense.db
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
NODE_ENV=development
DEBUG=true
EOL
    }
    echo "✅ Created .env file with API key"
fi

echo
echo "🔧 Step 3: Database Verification"
echo "==============================="

# Verify database exists and is accessible
if [ -f "soulsense.db" ]; then
    echo "✅ Database file found: soulsense.db"
    
    # Check if database has proper tables
    table_count=$(sqlite3 soulsense.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "0")
    echo "✅ Database has $table_count tables"
    
    # Check personas
    persona_count=$(sqlite3 soulsense.db "SELECT COUNT(*) FROM personas;" 2>/dev/null || echo "0")
    echo "✅ Database has $persona_count personas"
else
    echo "❌ Database file not found, creating..."
    python3 scripts/init_db.py
fi

echo
echo "🚀 Step 4: Starting FastAPI Server"
echo "================================="

echo "Backend starting on: http://localhost:5000"
echo "API Documentation: http://localhost:5000/docs"
echo "Interactive API: http://localhost:5000/redoc"
echo
echo "🛑 Press Ctrl+C to stop the server"
echo

# Start the FastAPI server with proper settings
uvicorn main:app \
    --host 0.0.0.0 \
    --port 5000 \
    --reload \
    --reload-dir . \
    --log-level info