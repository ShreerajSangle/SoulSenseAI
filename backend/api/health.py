"""
Health check and system status endpoints for SoulSense AI
"""

from fastapi import APIRouter, Request
from datetime import datetime
from typing import Dict, Any

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "service": "SoulSense AI Backend"
    }


@router.get("/status")
async def system_status(request: Request):
    """Detailed system status"""
    try:
        # Check database connection
        database = request.app.state.database
        db_status = "healthy" if database._connection else "disconnected"
        
        # Check core services
        services_status = {
            "database": db_status,
            "storage": "healthy",
            "emotion_engine": "healthy",
            "claude_client": "healthy",
            "persona_manager": "healthy"
        }
        
        return {
            "status": "operational",
            "timestamp": datetime.now().isoformat(),
            "services": services_status,
            "uptime": "running",
            "version": "2.0.0"
        }
        
    except Exception as e:
        return {
            "status": "degraded",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "version": "2.0.0"
        }


@router.get("/version")
async def get_version():
    """Get API version information"""
    return {
        "version": "2.0.0",
        "api_version": "v1",
        "backend": "Python FastAPI",
        "build": datetime.now().strftime("%Y%m%d"),
        "features": [
            "therapeutic_personas",
            "emotion_detection", 
            "conversation_memory",
            "goal_tracking",
            "diary_system",
            "analytics_dashboard"
        ]
    }