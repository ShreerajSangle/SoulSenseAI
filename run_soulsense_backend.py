#!/usr/bin/env python3
"""
SoulSense AI - Backend Startup Script
Replaces the TypeScript/Express server with Python FastAPI
"""

import os
import sys
import subprocess
import signal
import time

def kill_existing_servers():
    """Kill any existing TypeScript or Python servers"""
    try:
        # Kill TypeScript Express server
        subprocess.run(["pkill", "-f", "tsx server/index.ts"], check=False)
        subprocess.run(["pkill", "-f", "npm run dev"], check=False)
        
        # Kill any existing Python servers
        subprocess.run(["pkill", "-f", "python.*main.py"], check=False)
        subprocess.run(["pkill", "-f", "uvicorn.*main:app"], check=False)
        
        print("✓ Stopped existing servers")
        time.sleep(2)
        
    except Exception as e:
        print(f"Note: Error stopping servers: {e}")

def start_python_backend():
    """Start the Python FastAPI backend"""
    print("🚀 Starting SoulSense AI Python Backend...")
    
    # Change to backend directory
    os.chdir("backend")
    
    # Set environment
    os.environ["NODE_ENV"] = "development"
    os.environ["PYTHONPATH"] = os.getcwd()
    
    # Start the server
    print("📍 Backend API: http://localhost:5000")
    print("📚 API Documentation: http://localhost:5000/docs")
    print("🔧 Interactive API: http://localhost:5000/redoc")
    print("")
    
    try:
        # Run the FastAPI server
        subprocess.run([
            sys.executable, "main.py"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down SoulSense AI Backend...")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    kill_existing_servers()
    start_python_backend()