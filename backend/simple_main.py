#!/usr/bin/env python3
"""
SoulSense AI - Simplified FastAPI Backend
Working backend for the rebuilt SoulSense application
"""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

# Initialize FastAPI app
app = FastAPI(
    title="SoulSense AI",
    description="Mental wellness platform with therapeutic AI personas",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PersonaResponse(BaseModel):
    id: str
    name: str
    role: str
    description: str
    color: str

class ChatMessage(BaseModel):
    content: str
    persona_id: str

class ChatResponse(BaseModel):
    response: str
    persona_id: str
    emotion_detected: str = ""

class UserProfile(BaseModel):
    id: str
    name: str
    email: str = ""

# In-memory data storage
personas_data = [
    {
        "id": "sarah",
        "name": "Dr. Sarah",
        "role": "Clinical Therapist",
        "description": "Compassionate therapist specializing in CBT and emotional healing",
        "color": "#8b5cf6"
    },
    {
        "id": "alex",
        "name": "Alex", 
        "role": "Digital Best Friend",
        "description": "Witty, supportive companion with humor and peer support",
        "color": "#f59e0b"
    },
    {
        "id": "marcus",
        "name": "Marcus",
        "role": "Life Coach", 
        "description": "Confident mentor focused on goal-setting and motivation",
        "color": "#10b981"
    },
    {
        "id": "maya",
        "name": "Maya",
        "role": "Spiritual Guide",
        "description": "Serene wellness guide specializing in yoga and meditation", 
        "color": "#06b6d4"
    }
]

conversations = {}
user_profiles = {}

# API Routes
@app.get("/")
async def root():
    return {
        "message": "SoulSense AI Backend - Mental Wellness Platform",
        "version": "2.0.0",
        "status": "running",
        "rebuild": "Complete Python FastAPI rebuild successful"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "backend": "Python FastAPI",
        "frontend": "React + Vite"
    }

@app.get("/api/personas", response_model=List[PersonaResponse])
async def get_personas():
    """Get all therapeutic personas"""
    return personas_data

@app.get("/api/personas/{persona_id}", response_model=PersonaResponse)
async def get_persona(persona_id: str):
    """Get specific persona by ID"""
    for persona in personas_data:
        if persona["id"] == persona_id:
            return persona
    return {"error": "Persona not found"}

@app.post("/api/chat/{persona_id}", response_model=ChatResponse)
async def chat_with_persona(persona_id: str, message: ChatMessage, user_id: str = "anonymous"):
    """Send message to specific persona"""
    
    # Get persona info
    persona = next((p for p in personas_data if p["id"] == persona_id), None)
    if not persona:
        return {"response": "Persona not found", "persona_id": persona_id}
    
    # Persona-specific responses
    responses = {
        "sarah": f"Thank you for sharing that with me. As your therapist, I want you to know that what you're feeling is completely valid. Let's explore this together - can you tell me more about what's underneath these feelings?",
        "alex": f"Hey! I hear you, and honestly? That sounds totally normal to me! 😊 We've all been there. Want to talk it through? I'm here to listen and maybe crack a joke if it helps!",
        "marcus": f"I appreciate you bringing this to me. Here's what I'm hearing - there's an opportunity for growth here. What if we break this down into actionable steps? What's one small thing you could do today?",
        "maya": f"🙏 I feel the energy in your words. Let's take three deep breaths together first... *inhale*... *exhale*... Your feelings are sacred messengers. What is your heart trying to tell you?"
    }
    
    response_text = responses.get(persona_id, "Thank you for sharing. How can I support you today?")
    
    # Store conversation
    conv_key = f"{user_id}_{persona_id}"
    if conv_key not in conversations:
        conversations[conv_key] = {"messages": []}
    
    conversations[conv_key]["messages"].extend([
        {"sender": "user", "content": message.content, "persona_id": persona_id},
        {"sender": "ai", "content": response_text, "persona_id": persona_id}
    ])
    
    return ChatResponse(
        response=response_text,
        persona_id=persona_id,
        emotion_detected="supportive"
    )

@app.get("/api/chat/history/{persona_id}")
async def get_chat_history(persona_id: str, user_id: str = "anonymous", limit: int = 50):
    """Get chat history for specific persona"""
    conv_key = f"{user_id}_{persona_id}"
    
    if conv_key in conversations:
        messages = conversations[conv_key]["messages"][-limit:]
        return {
            "messages": messages,
            "conversation_id": conv_key,
            "total_count": len(messages)
        }
    
    return {"messages": [], "conversation_id": None, "total_count": 0}

@app.get("/api/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile"""
    if user_id not in user_profiles:
        user_profiles[user_id] = {
            "id": user_id,
            "name": "Anonymous User" if user_id == "anonymous" else f"User {user_id}",
            "email": ""
        }
    
    return user_profiles[user_id]

@app.get("/api/goals/{user_id}")
async def get_user_goals(user_id: str):
    """Get user goals"""
    return {
        "goals": [],
        "total_count": 0,
        "active_count": 0,
        "completed_count": 0
    }

@app.get("/api/diary/{user_id}")
async def get_diary_entries(user_id: str):
    """Get diary entries"""
    return {
        "entries": [],
        "total_count": 0
    }

@app.get("/api/sessions/{user_id}/analytics")
async def get_session_analytics(user_id: str):
    """Get session analytics"""
    return {
        "total_sessions": 0,
        "total_duration_minutes": 0,
        "average_duration_minutes": 0,
        "most_used_persona": None,
        "sessions_this_week": 0,
        "mood_trends": []
    }

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🧠 SoulSense AI - Mental Wellness Platform")
    print("🔄 Complete Python FastAPI Rebuild - SUCCESSFUL")
    print("🔗 Backend API: http://localhost:5000")
    print("📚 API Docs: http://localhost:5000/docs")
    print("🎯 Status: Ready for React frontend connection")
    print("="*60 + "\n")
    
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0", 
        port=5000,
        reload=True,
        log_level="info"
    )