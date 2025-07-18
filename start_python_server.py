#!/usr/bin/env python3
"""
SoulSense AI - Python FastAPI Server Startup
Permanently replaces TypeScript Express backend
"""

import uvicorn
import os
import sys
from pathlib import Path

# Set up environment
os.environ["NODE_ENV"] = "development"
os.environ["PYTHONPATH"] = str(Path(__file__).parent / "backend")

# Change to backend directory
backend_dir = Path(__file__).parent / "backend"
os.chdir(backend_dir)

if __name__ == "__main__":
    print("🚀 Starting SoulSense AI Python FastAPI Backend...")
    print("📍 Server: http://localhost:5000")
    print("📚 API Docs: http://localhost:5000/docs")
    print("🔧 Interactive API: http://localhost:5000/redoc")
    print("")
    
    # Start the FastAPI server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )