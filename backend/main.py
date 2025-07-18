"""
SoulSense AI - FastAPI Backend
Complete rebuild with Python FastAPI replacing TypeScript Express
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from contextlib import asynccontextmanager

from routes import chat, user, goals, diary, sessions, personas
from db.database import init_database
from models.responses import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown"""
    print("🚀 Starting SoulSense AI Backend...")
    
    # Initialize database
    await init_database()
    print("✅ Database initialized")
    
    yield
    
    print("🛑 Shutting down SoulSense AI Backend...")


# Create FastAPI app
app = FastAPI(
    title="SoulSense AI",
    description="AI-powered mental wellness platform with therapeutic personas",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000", "https://*.replit.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(user.router, prefix="/api", tags=["user"])
app.include_router(goals.router, prefix="/api", tags=["goals"])
app.include_router(diary.router, prefix="/api", tags=["diary"])
app.include_router(sessions.router, prefix="/api", tags=["sessions"])
app.include_router(personas.router, prefix="/api", tags=["personas"])


@app.get("/api/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="SoulSense AI Backend is running",
        version="2.0.0"
    )


# Serve React frontend
if os.path.exists("../client/dist"):
    app.mount("/", StaticFiles(directory="../client/dist", html=True), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React app for all non-API routes"""
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        file_path = f"../client/dist/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Return index.html for React Router
        return FileResponse("../client/dist/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )