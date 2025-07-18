from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime

from models import (
    ChatRequest, ChatResponse, MessageCreate, ConversationCreate,
    MessageResponse, ConversationResponse
)
from auth import get_user_id
from storage import Storage
from claude_client import ClaudeClient
from emotion_engine import EmotionEngine
from database import get_db

router = APIRouter()

@router.post("/chat/message", response_model=ChatResponse)
async def send_chat_message(
    request: ChatRequest,
    req: Request,
    db_session=Depends(get_db)
):
    """Send a message and get AI response"""
    try:
        # Get user ID
        user_id = await get_user_id(req)
        
        # Get services from app state
        storage: Storage = req.app.state.storage
        claude_client: ClaudeClient = req.app.state.claude_client
        emotion_engine: EmotionEngine = req.app.state.emotion_engine
        
        # Get or create conversation
        conversation = None
        if request.conversation_id:
            conversation = await storage.get_conversation(request.conversation_id)
        
        if not conversation:
            conversation_data = ConversationCreate(
                user_id=user_id,
                persona_id=request.persona_id,
                title=f"Chat with {request.persona_id.title()}"
            )
            conversation = await storage.create_conversation(conversation_data)
        
        # Detect emotion in user message
        emotion_result = emotion_engine.detect_emotion(request.message)
        
        # Get conversation history
        message_history = await storage.get_conversation_messages(conversation.id)
        
        # Format conversation history for Claude
        claude_history = []
        for msg in message_history[-10:]:  # Last 10 messages for context
            claude_history.append({
                "role": "user" if msg.sender == "user" else "assistant",
                "content": msg.content
            })
        
        # Prepare user context
        user_context = {
            "recent_mood": emotion_result.primary_emotion,
            "emotion_intensity": emotion_result.intensity,
            "support_needs": emotion_result.support_needs
        }
        
        # Get AI response
        ai_response = await claude_client.get_persona_response(
            persona_id=request.persona_id,
            user_message=request.message,
            conversation_history=claude_history,
            user_context=user_context
        )
        
        if not ai_response.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"AI service error: {ai_response.get('error', 'Unknown error')}"
            )
        
        # Save user message
        user_message_data = MessageCreate(
            conversation_id=conversation.id,
            content=request.message,
            sender="user",
            emotion_detected=emotion_result.primary_emotion
        )
        await storage.create_message(user_message_data)
        
        # Save AI response
        ai_message_data = MessageCreate(
            conversation_id=conversation.id,
            content=ai_response["content"],
            sender="ai"
        )
        await storage.create_message(ai_message_data)
        
        # Update conversation timestamp
        await storage.update_conversation(conversation.id, {"updated_at": datetime.utcnow()})
        
        # Generate quick replies
        quick_replies = await claude_client.generate_quick_replies(
            request.persona_id,
            request.message,
            ai_response["content"]
        )
        
        # Create session analytics
        await storage.create_session_analytic(
            user_id=user_id,
            analytic_data={
                "conversation_id": conversation.id,
                "persona_id": request.persona_id,
                "session_type": "chat",
                "message_count": 1,
                "emotion_analysis": emotion_engine.get_emotion_summary(emotion_result),
                "start_time": datetime.utcnow()
            }
        )
        
        return ChatResponse(
            message=ai_response["content"],
            persona_id=request.persona_id,
            conversation_id=conversation.id,
            quick_replies=quick_replies,
            emotion_detected=emotion_result.primary_emotion,
            suggestions=[]
        )
        
    except Exception as e:
        print(f"Error in send_chat_message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add persona-specific chat endpoints
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
        storage: Storage = req.app.state.storage
        conversations = await storage.get_user_conversations(user_id)
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/conversations", response_model=List[ConversationResponse])
async def get_user_conversations(
    req: Request,
    db_session=Depends(get_db)
):
    """Get all conversations for the current user"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
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
        print(f"Error in get_user_conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    req: Request,
    db_session=Depends(get_db)
):
    """Get all messages for a conversation"""
    try:
        storage: Storage = req.app.state.storage
        
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
async def mood_check(
    request: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Quick mood check endpoint"""
    try:
        user_id = await get_user_id(req)
        persona_id = request.get("persona_id", "sarah")
        
        # Simple mood responses by persona
        mood_responses = {
            "sarah": "How are you feeling today? I'm here to listen and help you process any emotions you're experiencing.",
            "alex": "Hey! What's going on with you today? I'm here if you need to talk or just want someone to listen 😊",
            "marcus": "What's your energy level like today? Let's check in and see how we can make this a productive day for you.",
            "maya": "Take a moment to breathe and check in with yourself. What emotions are you noticing right now?"
        }
        
        response = mood_responses.get(persona_id, mood_responses["sarah"])
        
        return {
            "message": response,
            "persona_id": persona_id,
            "quick_replies": [
                "I'm feeling great!",
                "I'm okay",
                "I'm struggling a bit",
                "I need support"
            ]
        }
        
    except Exception as e:
        print(f"Error in mood_check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/session-summary")
async def create_session_summary(
    request: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Create session summary"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        conversation_id = request.get("conversation_id")
        if not conversation_id:
            raise HTTPException(status_code=400, detail="conversation_id is required")
        
        # Create session record
        session_data = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "persona_id": request.get("persona_id", "sarah"),
            "summary": request.get("summary", ""),
            "key_topics": request.get("key_topics", []),
            "techniques_used": request.get("techniques_used", []),
            "homework": request.get("homework", []),
            "mood_before": request.get("mood_before"),
            "mood_after": request.get("mood_after")
        }
        
        session = await storage.create_session(session_data)
        
        return {
            "success": True,
            "session_id": session.id,
            "message": "Session summary created successfully"
        }
        
    except Exception as e:
        print(f"Error in create_session_summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))