"""
SoulSense AI - Python FastAPI Backend
Complete replacement for TypeScript/Express backend
Preserves all functionality while providing Python ecosystem benefits
"""

import os
import time
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from core.database import Database, get_db
from core.storage import Storage
from core.persona_manager import PersonaManager
from core.emotion_engine import EmotionEngine
from core.claude_client import ClaudeClient
from api.personas import router as personas_router
from api.chat import router as chat_router
from api.profile import router as profile_router
from api.goals import router as goals_router
from api.diary import router as diary_router
from api.analytics import router as analytics_router
from api.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    print("Starting SoulSense AI Backend...")
    
    # Initialize core services
    database = Database()
    await database.initialize()
    
    storage = Storage(database)
    emotion_engine = EmotionEngine()
    claude_client = ClaudeClient()
    persona_manager = PersonaManager(storage, claude_client, emotion_engine)
    
    # Initialize personas
    await persona_manager.initialize_personas()
    print("✓ Personas already exist")
    
    # Ensure database tables exist
    await database.create_tables()
    print("✓ Database tables created")
    
    # Store services in app state
    app.state.database = database
    app.state.storage = storage
    app.state.emotion_engine = emotion_engine
    app.state.claude_client = claude_client
    app.state.persona_manager = persona_manager
    
    print("✓ Core services initialized")
    
    yield
    
    # Cleanup
    await database.close()


# Initialize FastAPI app
app = FastAPI(
    title="SoulSense AI Backend",
    description="AI-powered mental wellness platform backend",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5000",  # Production/unified server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log API requests with duration and response info"""
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = int((time.time() - start_time) * 1000)
    
    if request.url.path.startswith("/api"):
        log_line = f"{request.method} {request.url.path} {response.status_code} in {duration}ms"
        
        # Add response info for API calls
        if hasattr(response, '_content'):
            try:
                content_preview = str(response._content)[:60]
                if len(content_preview) == 60:
                    content_preview += "..."
                log_line += f" :: {content_preview}"
            except:
                pass
        
        print(log_line)
    
    return response


# Include API routers
app.include_router(personas_router, prefix="/api", tags=["personas"])
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(profile_router, prefix="/api", tags=["profile"])
app.include_router(goals_router, prefix="/api", tags=["goals"])
app.include_router(diary_router, prefix="/api", tags=["diary"])
app.include_router(analytics_router, prefix="/api", tags=["analytics"])
app.include_router(health_router, tags=["health"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - serves React app in production"""
    return {"message": "SoulSense AI Backend", "status": "running", "version": "2.0.0"}


# Serve static files in production
if os.getenv("NODE_ENV") != "development":
    # Check if static files exist before mounting
    static_dir = "../client/dist"
    if os.path.exists(static_dir):
        from fastapi.staticfiles import StaticFiles
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    print(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    # Run server directly when executed
    port = int(os.getenv("PORT", 5000))
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )