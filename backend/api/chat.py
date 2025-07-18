"""
Chat API endpoints for SoulSense AI
Handles all conversation and messaging functionality
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from core.storage import Conversation, Message
from core.database import get_db

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    persona_id: str
    conversation_id: Optional[int] = None
    user_id: str = "anonymous"
    is_first_message: bool = False
    user_mood: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    persona_id: str
    conversation_id: int
    quick_replies: List[str]
    emotion_detected: Optional[str]
    suggestions: List[str] = []


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    content: str
    sender: str
    emotion_detected: Optional[str]
    timestamp: datetime


class ConversationResponse(BaseModel):
    id: int
    user_id: str
    persona_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    persona: Optional[Dict[str, Any]] = None


async def get_user_id(request: Request) -> str:
    """Extract user ID from request (placeholder for auth)"""
    return "anonymous"  # In production, extract from auth token


@router.post("/chat/message", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest, req: Request):
    """Send a chat message and get AI response"""
    try:
        storage = req.app.state.storage
        persona_manager = req.app.state.persona_manager
        
        # Get or create conversation
        conversation_id = request.conversation_id
        if not conversation_id:
            conversation = await storage.create_conversation(
                user_id=request.user_id,
                persona_id=request.persona_id,
                title=f"Chat with {request.persona_id}"
            )
            conversation_id = conversation.id
        
        # Store user message
        await storage.create_message(
            conversation_id=conversation_id,
            content=request.message,
            sender="user"
        )
        
        # Get conversation history for context
        messages = await storage.get_conversation_messages(conversation_id)
        conversation_history = [
            {"content": msg.content, "sender": msg.sender}
            for msg in messages[-10:]  # Last 10 messages
        ]
        
        # Generate AI response
        response_data = await persona_manager.get_persona_chat_response(
            persona_id=request.persona_id,
            user_message=request.message,
            conversation_history=conversation_history[:-1],  # Exclude current message
            user_context={}
        )
        
        ai_response = response_data["ai_response"]
        emotion_result = response_data["emotion_result"]
        quick_replies = response_data["quick_replies"]
        
        # Store AI message
        await storage.create_message(
            conversation_id=conversation_id,
            content=ai_response["content"],
            sender="ai",
            emotion_detected=emotion_result.primary_emotion
        )
        
        return ChatResponse(
            message=ai_response["content"],
            persona_id=request.persona_id,
            conversation_id=conversation_id,
            quick_replies=quick_replies,
            emotion_detected=emotion_result.primary_emotion,
            suggestions=[]
        )
        
    except Exception as e:
        print(f"Error in send_chat_message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Persona-specific chat endpoints
@router.post("/chat/sarah", response_model=ChatResponse)
async def chat_with_sarah(request: ChatRequest, req: Request):
    """Chat with Dr. Sarah (Clinical Therapist)"""
    request.persona_id = "sarah"
    return await send_chat_message(request, req)


@router.post("/chat/alex", response_model=ChatResponse)
async def chat_with_alex(request: ChatRequest, req: Request):
    """Chat with Alex (Peer Counselor)"""
    request.persona_id = "alex"
    return await send_chat_message(request, req)


@router.post("/chat/marcus", response_model=ChatResponse)
async def chat_with_marcus(request: ChatRequest, req: Request):
    """Chat with Marcus (Life Coach)"""
    request.persona_id = "marcus"
    return await send_chat_message(request, req)


@router.post("/chat/maya", response_model=ChatResponse)
async def chat_with_maya(request: ChatRequest, req: Request):
    """Chat with Maya (Mindfulness Expert)"""
    request.persona_id = "maya"
    return await send_chat_message(request, req)


@router.get("/conversations/{user_id}", response_model=List[ConversationResponse])
async def get_user_conversations_by_id(user_id: str, req: Request):
    """Get all conversations for a specific user"""
    try:
        storage = req.app.state.storage
        conversations = await storage.get_user_conversations(user_id)
        
        return [
            ConversationResponse(
                id=conv.id,
                user_id=conv.user_id,
                persona_id=conv.persona_id,
                title=conv.title,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                persona={
                    "id": conv.persona.id,
                    "name": conv.persona.name,
                    "role": conv.persona.role,
                    "specialty": conv.persona.specialty,
                    "description": conv.persona.description,
                    "avatar_url": conv.persona.avatar_url,
                    "color": conv.persona.color
                } if conv.persona else None
            )
            for conv in conversations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/conversations", response_model=List[ConversationResponse])
async def get_user_conversations(req: Request):
    """Get all conversations for the current user"""
    try:
        user_id = await get_user_id(req)
        return await get_user_conversations_by_id(user_id, req)
    except Exception as e:
        print(f"Error in get_user_conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(conversation_id: int, req: Request):
    """Get all messages for a conversation"""
    try:
        storage = req.app.state.storage
        messages = await storage.get_conversation_messages(conversation_id)
        
        return [
            MessageResponse(
                id=msg.id,
                conversation_id=msg.conversation_id,
                content=msg.content,
                sender=msg.sender,
                emotion_detected=msg.emotion_detected,
                timestamp=msg.timestamp
            )
            for msg in messages
        ]
    except Exception as e:
        print(f"Error in get_conversation_messages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/mood-check")
async def mood_check(request: Dict[str, Any], req: Request):
    """Quick mood check endpoint"""
    try:
        persona_id = request.get("persona_id", "sarah")
        user_id = request.get("user_id", "anonymous")
        
        # Simple mood check response
        return {
            "message": "How are you feeling today? I'm here to listen and support you.",
            "persona_id": persona_id,
            "suggestions": [
                "I'm feeling anxious",
                "I'm doing well today",
                "I need some support",
                "I want to talk"
            ]
        }
    except Exception as e:
        print(f"Error in mood_check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))