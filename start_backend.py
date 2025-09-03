#!/usr/bin/env python3
"""
SoulSense AI - Backend Startup Script
Starts the FastAPI server with proper configuration
"""

import os
import sys
import asyncio
import uvicorn
from pathlib import Path

# Add this block to load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Please install python-dotenv: pip install python-dotenv")
    sys.exit(1)

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

async def main():
    """Main startup function"""
    print("🪷 Starting SoulSense AI Backend...")
    print("=" * 50)
    
    # Set environment variables if not already set
    if not os.getenv("OPENROUTER_API_KEY"):
        print("⚠️  Warning: OPENROUTER_API_KEY not found in environment variables")
        print("   Please set your OpenRouter API key for AI functionality")
    
    # Import and run the FastAPI app
    try:
        from main import app
        
        # Configure uvicorn
        config = uvicorn.Config(
            app=app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            access_log=True,
            reload=True,
            reload_dirs=["backend"]
        )
        
        server = uvicorn.Server(config)
        
        print("🚀 SoulSense AI Backend starting on http://0.0.0.0:8000")
        print("📚 API Documentation: http://0.0.0.0:8000/docs")
        print("🔍 Alternative docs: http://0.0.0.0:8000/redoc")
        print("=" * 50)
        
        await server.serve()
        
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())