#!/usr/bin/env python3
"""
SoulSense AI - Local Setup Testing Script
Tests that the local setup is working correctly
"""

import asyncio
import httpx
import json
import os
import sys
from pathlib import Path


async def test_backend_connection():
    """Test if backend is responding"""
    print("🔌 Testing backend connection...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:5000/")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Backend responding: {data.get('message', 'Unknown')}")
                return True
            else:
                print(f"❌ Backend error: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False


async def test_personas_api():
    """Test personas API endpoint"""
    print("👥 Testing personas API...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:5000/api/personas")
            if response.status_code == 200:
                personas = response.json()
                if isinstance(personas, list) and len(personas) == 4:
                    names = [p.get('name', 'Unknown') for p in personas]
                    print(f"✅ Found {len(personas)} personas: {', '.join(names)}")
                    return True
                else:
                    print(f"❌ Invalid personas data: {len(personas) if isinstance(personas, list) else 'not a list'}")
                    return False
            else:
                print(f"❌ Personas API error: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Personas API failed: {e}")
        return False


async def test_health_endpoint():
    """Test health endpoint"""
    print("🏥 Testing health endpoint...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:5000/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check passed: {data.get('status', 'Unknown')}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
        return False


def test_database():
    """Test database existence"""
    print("💾 Testing database...")
    
    # Check if database file exists
    db_files = [
        "backend/soulsense.db",
        "soulsense.db",
        "backend/data/soulsense.db"
    ]
    
    for db_file in db_files:
        if Path(db_file).exists():
            print(f"✅ Database found: {db_file}")
            return True
    
    print("❌ No database file found")
    return False


def test_environment():
    """Test environment configuration"""
    print("🔧 Testing environment configuration...")
    
    env_files = [".env", "backend/.env"]
    api_key_configured = False
    
    for env_file in env_files:
        if Path(env_file).exists():
            print(f"✅ Found {env_file}")
            with open(env_file, 'r') as f:
                content = f.read()
                if 'OPENROUTER_API_KEY=' in content and 'your_openrouter_api_key_here' not in content:
                    api_key_configured = True
        else:
            print(f"❌ Missing {env_file}")
    
    if api_key_configured:
        print("✅ OpenRouter API key appears to be configured")
    else:
        print("⚠️  OpenRouter API key not configured (AI features won't work)")
    
    return True


def test_dependencies():
    """Test if all dependencies are installed"""
    print("📦 Testing dependencies...")
    
    # Test Python dependencies
    try:
        import fastapi
        import uvicorn
        import httpx
        print("✅ Python dependencies available")
        python_deps = True
    except ImportError as e:
        print(f"❌ Missing Python dependency: {e}")
        python_deps = False
    
    # Test if Node.js dependencies exist
    if Path("node_modules").exists():
        print("✅ Node.js dependencies installed")
        node_deps = True
    else:
        print("❌ Node.js dependencies not found")
        node_deps = False
    
    return python_deps and node_deps


async def main():
    """Run all tests"""
    print("🧪 SoulSense AI - Local Setup Testing")
    print("=====================================")
    print()
    
    tests = [
        ("Environment", test_environment),
        ("Dependencies", test_dependencies), 
        ("Database", test_database),
        ("Backend Connection", test_backend_connection),
        ("Health Endpoint", test_health_endpoint),
        ("Personas API", test_personas_api),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"Running {test_name} test...")
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
        print()
    
    # Summary
    print("📊 Test Results Summary")
    print("======================")
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! SoulSense AI is ready to use.")
        print()
        print("🚀 Start the application:")
        print("   npm run dev")
        print("   Visit: http://localhost:5000")
    else:
        print("⚠️  Some tests failed. Check the issues above.")
        print()
        print("🔧 Common fixes:")
        print("   - Run: ./complete_local_setup.sh")
        print("   - Add OpenRouter API key to .env")
        print("   - Install dependencies: npm install")
        print("   - Start backend: cd backend && uvicorn main:app --reload")
    
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)