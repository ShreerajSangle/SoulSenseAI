#!/usr/bin/env python3
"""
SoulSense AI - Production Startup Script
Starts the Python FastAPI backend server
"""

import os
import sys
import uvicorn
from pathlib import Path

def main():
    # Set environment variables
    os.environ["NODE_ENV"] = "development"
    
    # Change to backend directory
    backend_path = Path(__file__).parent / "backend"
    os.chdir(backend_path)
    
    print("🚀 Starting SoulSense AI...")
    print("📍 Backend API: http://localhost:5000")
    print("📚 Documentation: http://localhost:5000/docs")
    print("")
    
    # Start FastAPI server
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0", 
            port=5000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 SoulSense AI stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()