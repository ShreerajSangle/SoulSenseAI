#!/usr/bin/env python3
"""
SoulSense AI - Python FastAPI Backend Startup Script
"""

import os
import sys
import asyncio
from pathlib import Path

# Add this block to load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Please install python-dotenv: pip install python-dotenv")
    sys.exit(1)

# Add the backend directory to the Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# Set environment variables
os.environ["NODE_ENV"] = "development"
os.environ["PYTHONPATH"] = str(backend_path)

def main():
    """Main startup function"""
    print("🚀 Starting SoulSense AI Python Backend...")
    print("=" * 50)
    
    # Check for required environment variables
    required_vars = ["DATABASE_URL", "OPENROUTER_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these environment variables before starting the backend.")
        sys.exit(1)
    
    print("✅ Environment variables validated")
    
    # Import and run the FastAPI app
    try:
        import uvicorn
        from main import app
        
        print("✅ FastAPI app loaded successfully")
        print("🌐 Starting server on http://0.0.0.0:8000")
        print("📚 API documentation available at http://0.0.0.0:8000/docs")
        print("=" * 50)
        
        # Run the server
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
        
    except ImportError as e:
        print(f"❌ Failed to import required modules: {e}")
        print("Please ensure all dependencies are installed.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()