#!/bin/bash

# SoulSense AI - Frontend Setup Script
# Sets up React frontend for local development

echo "⚛️  SoulSense AI - Frontend Setup"
echo "================================"
echo

# Check if we're in the right directory
if [ ! -d "client" ]; then
    echo "❌ Run this script from the project root directory"
    exit 1
fi

# Check Node.js
echo "🔍 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Found Node.js: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ Found npm: $NPM_VERSION"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Check if we have a separate React app in client/
if [ -d "client" ] && [ -f "client/package.json" ]; then
    echo "📦 Installing client dependencies..."
    cd client
    npm install
    cd ..
fi

# Check if we have a separate React app in frontend/
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo
echo "✅ Frontend setup complete!"
echo
echo "🚀 To start the development server:"
echo "   npm run dev"
echo
echo "🌐 Frontend will be available at:"
echo "   http://localhost:3000 (if using separate React server)"
echo "   http://localhost:5000 (if using unified server)"