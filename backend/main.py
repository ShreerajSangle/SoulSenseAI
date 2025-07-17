"""
SoulSense AI - FastAPI Backend
Mental Health Therapy Application with Four Therapeutic Personas
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime
import os
from typing import Optional, List, Dict, Any

# Import persona handlers
from personas.maya_handler import MayaHandler
from personas.sarah_handler import SarahHandler
from personas.alex_handler import AlexHandler
from personas.marcus_handler import MarcusHandler

# Import core systems
from core.database import Database
from core.emotion_engine import EmotionEngine
from core.memory_system import MemorySystem
from core.quick_reply_engine import QuickReplyEngine
from models.schemas import (
    ChatMessage, 
    ChatResponse, 
    PersonaConfig, 
    UserProfile,
    SessionData,
    BreathingSession,
    JournalEntry,
    Goal,
    EmotionalContext
)

# Initialize database and core systems
database = Database()
emotion_engine = EmotionEngine()
memory_system = MemorySystem()
quick_reply_engine = QuickReplyEngine()

# Initialize persona handlers
maya_handler = MayaHandler()
sarah_handler = SarahHandler()
alex_handler = AlexHandler()
marcus_handler = MarcusHandler()

# Persona routing dictionary
PERSONA_HANDLERS = {
    "maya": maya_handler,
    "sarah": sarah_handler,
    "alex": alex_handler,
    "marcus": marcus_handler
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and setup on startup"""
    await database.initialize()
    yield
    await database.close()

# FastAPI app initialization
app = FastAPI(
    title="SoulSense AI API",
    description="Mental Health Therapy Application with Four Therapeutic Personas",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Get all persona configurations
@app.get("/api/personas", response_model=List[PersonaConfig])
async def get_personas():
    """Get all available persona configurations"""
    return [
        handler.get_config() 
        for handler in PERSONA_HANDLERS.values()
    ]

# Get specific persona configuration
@app.get("/api/personas/{persona_id}", response_model=PersonaConfig)
async def get_persona(persona_id: str):
    """Get specific persona configuration"""
    if persona_id not in PERSONA_HANDLERS:
        raise HTTPException(status_code=404, detail="Persona not found")
    
    return PERSONA_HANDLERS[persona_id].get_config()

# Maya chat endpoint - Spiritual Guide & Breathwork Mentor
@app.post("/api/chat/maya", response_model=ChatResponse)
async def chat_maya(message: ChatMessage, user_id: str = "anonymous"):
    """Maya's isolated chat endpoint with spiritual guidance features"""
    return await process_persona_chat("maya", message, user_id)

# Sarah chat endpoint - Clinical Therapist
@app.post("/api/chat/sarah", response_model=ChatResponse)
async def chat_sarah(message: ChatMessage, user_id: str = "anonymous"):
    """Dr. Sarah's isolated chat endpoint with clinical therapy features"""
    return await process_persona_chat("sarah", message, user_id)

# Alex chat endpoint - Peer Support Friend
@app.post("/api/chat/alex", response_model=ChatResponse)
async def chat_alex(message: ChatMessage, user_id: str = "anonymous"):
    """Alex's isolated chat endpoint with peer support features"""
    return await process_persona_chat("alex", message, user_id)

# Marcus chat endpoint - Life Coach & Wellness Expert
@app.post("/api/chat/marcus", response_model=ChatResponse)
async def chat_marcus(message: ChatMessage, user_id: str = "anonymous"):
    """Marcus's isolated chat endpoint with life coaching features"""
    return await process_persona_chat("marcus", message, user_id)

async def process_persona_chat(persona_id: str, message: ChatMessage, user_id: str) -> ChatResponse:
    """Process chat message through isolated persona system"""
    try:
        # Get persona handler
        handler = PERSONA_HANDLERS[persona_id]
        
        # Get user's conversation memory for this persona
        memory = await memory_system.get_conversation_memory(user_id, persona_id)
        
        # Detect emotional context
        emotional_context = await emotion_engine.analyze_emotion(message.content)
        
        # Generate persona-specific response
        response = await handler.generate_response(
            message.content,
            message.conversation_history or [],
            emotional_context,
            memory
        )
        
        # Update memory with persona-specific rules
        await memory_system.update_memory(
            user_id, 
            persona_id, 
            message.content, 
            response.content,
            emotional_context,
            handler.get_memory_rules()
        )
        
        # Generate dynamic quick replies based on context
        conversation_history = message.conversation_history or []
        quick_replies = quick_reply_engine.generate_quick_replies(
            persona_id=persona_id,
            user_message=message.content,
            conversation_history=conversation_history,
            conversation_context={
                'duration_minutes': 0,  # Calculate based on session time
                'emotional_state': emotional_context
            }
        )
        
        # Convert QuickReply objects to dictionaries
        quick_reply_data = [
            {
                "text": reply.text,
                "action_type": reply.action_type,
                "action_data": reply.action_data,
                "emoji": reply.emoji,
                "priority": reply.priority
            }
            for reply in quick_replies
        ]
        
        # Store conversation in database
        await database.store_conversation(
            user_id=user_id,
            persona_id=persona_id,
            user_message=message.content,
            ai_response=response.content,
            emotional_context=emotional_context,
            features_used=handler.get_active_features()
        )
        
        return ChatResponse(
            content=response.content,
            persona_id=persona_id,
            emotion=emotional_context.primary_emotion,
            confidence=emotional_context.confidence,
            features_activated=handler.get_active_features(),
            persona_config=handler.get_config(),
            session_id=message.session_id,
            quick_replies=quick_reply_data
        )
        
    except Exception as e:
        error_message = f"{handler.get_config().name} is currently unavailable. Please try again soon."
        raise HTTPException(status_code=500, detail=error_message)

# Breathing exercise endpoints
@app.post("/api/breathing/session")
async def create_breathing_session(session: BreathingSession, user_id: str = "anonymous"):
    """Create and track breathing exercise session"""
    return await database.store_breathing_session(user_id, session)

@app.get("/api/breathing/history/{user_id}")
async def get_breathing_history(user_id: str):
    """Get user's breathing exercise history"""
    return await database.get_breathing_history(user_id)

# Journal endpoints
@app.post("/api/journal/entry")
async def create_journal_entry(entry: JournalEntry, user_id: str = "anonymous"):
    """Create journal entry with persona-specific insights"""
    return await database.store_journal_entry(user_id, entry)

@app.get("/api/journal/entries/{user_id}")
async def get_journal_entries(user_id: str):
    """Get user's journal entries"""
    return await database.get_journal_entries(user_id)

# Goal setting endpoints
@app.post("/api/goals")
async def create_goal(goal: Goal, user_id: str = "anonymous"):
    """Create wellness goal with persona guidance"""
    return await database.store_goal(user_id, goal)

@app.get("/api/goals/{user_id}")
async def get_goals(user_id: str):
    """Get user's wellness goals"""
    return await database.get_goals(user_id)

# Analytics endpoints
@app.get("/api/analytics/{user_id}")
async def get_user_analytics(user_id: str):
    """Get comprehensive user analytics and insights"""
    return await database.get_user_analytics(user_id)

@app.get("/api/analytics/persona/{user_id}/{persona_id}")
async def get_persona_analytics(user_id: str, persona_id: str):
    """Get persona-specific usage analytics"""
    return await database.get_persona_analytics(user_id, persona_id)

# User profile endpoints
@app.get("/api/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile and preferences"""
    return await database.get_user_profile(user_id)

@app.put("/api/profile/{user_id}")
async def update_user_profile(user_id: str, profile: UserProfile):
    """Update user profile and preferences"""
    return await database.update_user_profile(user_id, profile)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )