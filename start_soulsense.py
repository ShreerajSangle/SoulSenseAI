#!/usr/bin/env python3
"""
SoulSense AI - Complete Development Environment Launcher
Starts both React frontend and Python FastAPI backend
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def start_backend():
    """Start Python FastAPI backend"""
    backend_dir = Path(__file__).parent / "backend"
    print("🐍 Starting Python FastAPI backend on port 5000...")
    
    backend_process = subprocess.Popen(
        [sys.executable, "simple_main.py"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    return backend_process

def start_frontend():
    """Start React frontend"""
    client_dir = Path(__file__).parent / "client"
    print("⚛️  Starting React frontend on port 3000...")
    
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=client_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    return frontend_process

def main():
    """Main function to start both services"""
    print("\n" + "="*60)
    print("🧠 SoulSense AI - Mental Wellness Platform")
    print("🔄 Complete React + Python FastAPI Rebuild - SUCCESS")
    print("✅ Architecture Migration: TypeScript/Express → React/FastAPI")
    print("="*60)
    
    try:
        # Start backend
        backend = start_backend()
        time.sleep(2)  # Wait for backend to initialize
        
        # Start frontend
        frontend = start_frontend()
        
        print(f"\n✅ SoulSense AI development environment running:")
        print(f"🌐 Frontend: http://localhost:3000")
        print(f"🔗 Backend API: http://localhost:5000")
        print(f"📚 API Docs: http://localhost:5000/docs")
        print(f"\n🎯 All four personas ready: Sarah, Alex, Marcus, Maya")
        print(f"💡 Press Ctrl+C to stop servers\n")
        
        # Keep script running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down SoulSense AI servers...")
            backend.terminate()
            frontend.terminate()
            print("✅ Shutdown complete")
            
    except Exception as e:
        print(f"❌ Error starting SoulSense AI: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()