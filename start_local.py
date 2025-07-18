#!/usr/bin/env python3
"""
SoulSense AI Local Startup Script
Automatically sets up and starts the local development environment
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path

def print_header():
    print("🎯 SoulSense AI - Local Setup & Startup")
    print("=" * 50)
    print()

def check_prerequisites():
    """Check if required tools are installed"""
    print("🔍 Checking prerequisites...")
    
    # Check Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        node_version = result.stdout.strip()
        print(f"✅ Node.js: {node_version}")
    except FileNotFoundError:
        print("❌ Node.js not found. Please install Node.js 18+")
        return False
    
    # Check npm
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        npm_version = result.stdout.strip()
        print(f"✅ npm: {npm_version}")
    except FileNotFoundError:
        print("❌ npm not found. Please install npm")
        return False
    
    # Check Python
    try:
        result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
        python_version = result.stdout.strip()
        print(f"✅ Python: {python_version}")
    except FileNotFoundError:
        print("❌ Python not found. Please install Python 3.8+")
        return False
    
    print()
    return True

def setup_environment():
    """Create .env file if it doesn't exist"""
    print("🔧 Setting up environment...")
    
    env_path = Path('.env')
    env_example_path = Path('.env.example')
    
    if not env_path.exists():
        if env_example_path.exists():
            shutil.copy(env_example_path, env_path)
            print("✅ Created .env from template")
        else:
            # Create basic .env
            env_content = """# SoulSense AI Environment Configuration

# REQUIRED: OpenRouter API Key for AI responses
# Get yours at: https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key_here

# OPTIONAL: Database Configuration (SQLite used by default)
# DATABASE_URL=postgresql://username:password@localhost:5432/soulsense

# OPTIONAL: Session Secret
SESSION_SECRET=soulsense_local_development_secret_change_in_production

# Development Settings
NODE_ENV=development
"""
            with open(env_path, 'w') as f:
                f.write(env_content)
            print("✅ Created .env file")
        
        print("⚠️  IMPORTANT: Please add your OpenRouter API key to .env")
        print("   Visit https://openrouter.ai/ to get your free API key")
        print()
    else:
        print("✅ .env file already exists")
        print()

def install_dependencies():
    """Install Node.js and Python dependencies"""
    print("📦 Installing dependencies...")
    
    # Check if node_modules exists
    if not Path('node_modules').exists():
        print("Installing Node.js dependencies...")
        try:
            subprocess.run(['npm', 'install'], check=True)
            print("✅ Node.js dependencies installed")
        except subprocess.CalledProcessError:
            print("❌ Failed to install Node.js dependencies")
            return False
    else:
        print("✅ Node.js dependencies already installed")
    
    # Check Python dependencies
    try:
        import fastapi
        print("✅ Python dependencies already installed")
    except ImportError:
        print("Installing Python dependencies...")
        try:
            subprocess.run([
                sys.executable, '-m', 'pip', 'install',
                'fastapi', 'uvicorn', 'pydantic', 'python-dotenv',
                'httpx', 'asyncpg', 'aiosqlite', 'sqlalchemy',
                'passlib', 'python-jose', 'python-multipart'
            ], check=True)
            print("✅ Python dependencies installed")
        except subprocess.CalledProcessError:
            print("❌ Failed to install Python dependencies")
            return False
    
    print()
    return True

def check_api_key():
    """Check if OpenRouter API key is configured"""
    print("🔑 Checking API configuration...")
    
    env_path = Path('.env')
    if env_path.exists():
        with open(env_path, 'r') as f:
            content = f.read()
            if 'OPENROUTER_API_KEY=your_openrouter_api_key_here' in content:
                print("⚠️  OpenRouter API key not configured")
                print("   Edit .env and add your API key from https://openrouter.ai/")
                print("   The app will work but AI responses won't function without it")
                print()
                return False
            elif 'OPENROUTER_API_KEY=' in content:
                print("✅ OpenRouter API key configured")
                print()
                return True
    
    print("⚠️  No API key found in .env")
    print()
    return False

def start_application():
    """Start the SoulSense AI application"""
    print("🚀 Starting SoulSense AI...")
    print("👀 Visit: http://localhost:5000")
    print("🛑 Press Ctrl+C to stop")
    print()
    
    try:
        subprocess.run(['npm', 'run', 'dev'], check=True)
    except subprocess.CalledProcessError:
        print("❌ Failed to start application")
        return False
    except KeyboardInterrupt:
        print("\n👋 SoulSense AI stopped")
        return True
    
    return True

def main():
    """Main setup and startup function"""
    print_header()
    
    # Check prerequisites
    if not check_prerequisites():
        print("Please install missing prerequisites and try again")
        return 1
    
    # Setup environment
    setup_environment()
    
    # Install dependencies
    if not install_dependencies():
        print("Failed to install dependencies")
        return 1
    
    # Check API key
    api_key_configured = check_api_key()
    
    # Start application
    print("All checks complete! Starting application...")
    print()
    
    if not api_key_configured:
        response = input("Start anyway? (AI chat won't work without API key) [y/N]: ")
        if response.lower() not in ['y', 'yes']:
            print("Please configure your OpenRouter API key in .env and run again")
            return 1
    
    start_application()
    return 0

if __name__ == "__main__":
    sys.exit(main())