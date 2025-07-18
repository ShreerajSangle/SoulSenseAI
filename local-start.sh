#!/bin/bash

echo "🎯 Starting SoulSense AI Locally"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file..."
    cat > .env << EOL
# REQUIRED: Add your OpenRouter API key here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# OPTIONAL: Database (SQLite used by default)
# DATABASE_URL=postgresql://user:password@localhost:5432/soulsense

# OPTIONAL: Session management  
SESSION_SECRET=soulsense_local_development_secret_key_change_in_production

# Development settings
NODE_ENV=development
EOL
    echo "✅ Created .env file - PLEASE ADD YOUR OPENROUTER API KEY"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    echo "✅ Node.js dependencies installed"
    echo ""
fi

# Check Python dependencies
echo "🐍 Checking Python dependencies..."
python3 -c "import fastapi" 2>/dev/null || {
    echo "📦 Installing Python dependencies..."
    pip3 install fastapi uvicorn pydantic python-dotenv httpx asyncpg aiosqlite sqlalchemy passlib python-jose python-multipart
    echo "✅ Python dependencies installed"
    echo ""
}

echo "🚀 Starting SoulSense AI..."
echo "👀 Visit: http://localhost:5000"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Start the application
npm run dev