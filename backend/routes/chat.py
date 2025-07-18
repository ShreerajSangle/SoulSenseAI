"""
Chat API routes
Handles conversation and messaging functionality
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from db.database import get_db
from db.models import ConversationModel, MessageModel, PersonaModel
from models.schemas import ChatMessage, ChatResponse, PersonaEnum
from utils.claude_client import ClaudeClient
from utils.emotion_detection import EmotionDetector
from utils.memory_system import MemorySystem

router = APIRouter()

# Initialize utilities
claude_client = ClaudeClient()
emotion_detector = EmotionDetector()
memory_system = MemorySystem()


@router.post("/chat/{persona_id}", response_model=ChatResponse)
async def chat_with_persona(
    persona_id: PersonaEnum,
    message: ChatMessage,
    user_id: str = "anonymous",
    db: AsyncSession = Depends(get_db)
):
    """Send message to a specific persona"""
    try:
        # Verify persona exists
        persona_result = await db.execute(
            select(PersonaModel).where(PersonaModel.id == persona_id.value)
        )
        persona = persona_result.scalar_one_or_none()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona not found")
        
        # Get or create conversation
        conversation = await get_or_create_conversation(
            db, user_id, persona_id.value
        )
        
        # Detect emotion in user message
        emotion = emotion_detector.detect_emotion(message.content)
        
        # Save user message
        await save_message(
            db, conversation.id, message.content, "user", emotion
        )
        
        # Get conversation context
        context = await memory_system.get_conversation_context(
            db, conversation.id, persona_id.value
        )
        
        # Generate AI response
        ai_response = await claude_client.generate_response(
            message.content,
            persona_id.value,
            context,
            emotion
        )
        
        # Save AI message
        await save_message(
            db, conversation.id, ai_response, "ai"
        )
        
        # Generate quick replies and suggestions
        quick_replies = await claude_client.generate_quick_replies(
            message.content, persona_id.value, emotion
        )
        
        suggested_actions = await claude_client.generate_suggestions(
            message.content, persona_id.value, emotion
        )
        
        return ChatResponse(
            message=ai_response,
            persona_id=persona_id.value,
            emotion_detected=emotion,
            quick_replies=quick_replies,
            suggested_actions=suggested_actions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/chat/history/{persona_id}")
async def get_chat_history(
    persona_id: str,
    user_id: str = "anonymous",
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get chat history for a persona"""
    try:
        # Get conversation
        conversation_result = await db.execute(
            select(ConversationModel).where(
                ConversationModel.user_id == user_id,
                ConversationModel.persona_id == persona_id
            )
        )
        conversation = conversation_result.scalar_one_or_none()
        
        if not conversation:
            return {"messages": [], "conversation_id": None}
        
        # Get messages
        messages_result = await db.execute(
            select(MessageModel)
            .where(MessageModel.conversation_id == conversation.id)
            .order_by(desc(MessageModel.timestamp))
            .limit(limit)
        )
        messages = messages_result.scalars().all()
        
        return {
            "messages": [
                {
                    "id": msg.id,
                    "content": msg.content,
                    "sender": msg.sender,
                    "emotion_detected": msg.emotion_detected,
                    "timestamp": msg.timestamp.isoformat()
                }
                for msg in reversed(messages)
            ],
            "conversation_id": conversation.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {str(e)}")


async def get_or_create_conversation(
    db: AsyncSession, user_id: str, persona_id: str
) -> ConversationModel:
    """Get existing conversation or create new one"""
    # Try to get existing conversation
    result = await db.execute(
        select(ConversationModel).where(
            ConversationModel.user_id == user_id,
            ConversationModel.persona_id == persona_id
        )
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        # Create new conversation
        conversation = ConversationModel(
            user_id=user_id,
            persona_id=persona_id,
            title=f"Chat with {persona_id.title()}"
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
    
    return conversation


async def save_message(
    db: AsyncSession,
    conversation_id: int,
    content: str,
    sender: str,
    emotion_detected: Optional[str] = None
):
    """Save message to database"""
    message = MessageModel(
        conversation_id=conversation_id,
        content=content,
        sender=sender,
        emotion_detected=emotion_detected
    )
    db.add(message)
    await db.commit()
    return message