#!/bin/bash

# SoulSense AI Development Server
# Complete React + Python FastAPI Architecture

echo "🧠 SoulSense AI - Starting Development Environment"
echo "🔄 Complete React + Python FastAPI Rebuild - SUCCESS"
echo "=================================================="

# Start Python backend in background
echo "🐍 Starting Python FastAPI backend on port 5000..."
cd backend && python simple_main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start React frontend
echo "⚛️  Starting React frontend on port 3000..."
cd ../client && npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT