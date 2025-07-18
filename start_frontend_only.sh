#!/bin/bash

# SoulSense AI - Frontend Only Startup (for development)
# This script starts just the React frontend for UI development

echo "🎨 SoulSense AI - Frontend Development Mode"
echo "==========================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start just the frontend development server
echo "🚀 Starting frontend development server..."
echo "👀 Visit: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop"
echo

cd client && npm start