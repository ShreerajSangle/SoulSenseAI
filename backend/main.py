import os
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import uvicorn

from database import get_db, DatabaseManager
# Import directly from models.py to avoid circular imports
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from models import (
        ChatRequest, ChatResponse, MessageCreate, ConversationCreate,
        MessageResponse, ConversationResponse, PersonaResponse,
        GoalCreate, GoalResponse, MoodEntryCreate, MoodEntryResponse,
        DiaryEntryCreate, DiaryEntryResponse, UserCreate, UserResponse
    )
except ImportError as e:
    print(f"Failed to import models: {e}")
    sys.exit(1)
from routes import chat, personas, analytics, goals, diary, profile, breathing
from auth import setup_auth, get_current_user
from claude_client import ClaudeClient
from emotion_engine import EmotionEngine
from storage import Storage

# Database manager instance
db_manager = DatabaseManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    print("Starting SoulSense AI Backend...")
    await db_manager.create_tables()
    
    # Initialize core services
    app.state.claude_client = ClaudeClient()
    app.state.emotion_engine = EmotionEngine()
    app.state.storage = Storage(db_manager)
    
    print("✓ Database tables created")
    print("✓ Core services initialized")
    
    yield
    
    # Shutdown
    print("Shutting down SoulSense AI Backend...")

# Create FastAPI app
app = FastAPI(
    title="SoulSense AI API",
    description="Mental health therapy application with AI-powered personas",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    
    # Extract user_id from request body and store in request state
    if request.method == "POST" and "application/json" in request.headers.get("content-type", ""):
        try:
            body = await request.body()
            if body:
                import json
                request_data = json.loads(body)
                if "user_id" in request_data:
                    request.state.user_id = request_data["user_id"]
                
                # Re-create request with body for downstream handlers
                from starlette.requests import Request as StarletteRequest
                request._body = body
        except:
            pass
    
    response = await call_next(request)
    
    process_time = (datetime.now() - start_time).total_seconds() * 1000
    
    if request.url.path.startswith("/api"):
        log_line = f"{request.method} {request.url.path} {response.status_code} in {process_time:.0f}ms"
        if len(log_line) > 80:
            log_line = log_line[:79] + "…"
        print(log_line)
    
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Include all route modules
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(personas.router, prefix="/api", tags=["personas"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(goals.router, prefix="/api", tags=["goals"])
app.include_router(diary.router, prefix="/api", tags=["diary"])
app.include_router(profile.router, prefix="/api", tags=["profile"])
app.include_router(breathing.router, prefix="/api", tags=["breathing"])

# Setup authentication
setup_auth(app)

# Serve static files in production
if os.getenv("NODE_ENV") == "production":
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

# Root endpoint for development
@app.get("/")
async def root():
    return {"message": "SoulSense AI Backend", "docs": "/docs"}

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True if os.getenv("NODE_ENV") == "development" else False,
        log_level="info"
    )