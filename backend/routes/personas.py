from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional, Dict, Any

from models import PersonaResponse
from auth import get_user_id
from storage import Storage
from database import get_db

router = APIRouter()

@router.get("/personas", response_model=List[PersonaResponse])
async def get_personas(
    req: Request,
    db_session=Depends(get_db)
):
    """Get all available personas"""
    try:
        storage: Storage = req.app.state.storage
        
        personas = await storage.get_personas()
        
        return [
            PersonaResponse(
                id=persona.id,
                name=persona.name,
                role=persona.role,
                specialty=persona.specialty,
                description=persona.description,
                avatar_url=persona.avatar_url,
                color=persona.color
            )
            for persona in personas
        ]
        
    except Exception as e:
        print(f"Error in get_personas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/personas/{persona_id}", response_model=PersonaResponse)
async def get_persona(
    persona_id: str,
    req: Request,
    db_session=Depends(get_db)
):
    """Get specific persona by ID"""
    try:
        storage: Storage = req.app.state.storage
        
        persona = await storage.get_persona(persona_id)
        
        if not persona:
            raise HTTPException(status_code=404, detail="Persona not found")
        
        return PersonaResponse(
            id=persona.id,
            name=persona.name,
            role=persona.role,
            specialty=persona.specialty,
            description=persona.description,
            avatar_url=persona.avatar_url,
            color=persona.color
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_persona: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/personas/{persona_id}/chat")
async def chat_with_persona(
    persona_id: str,
    request: Dict[str, Any],
    req: Request
):
    """Chat with a specific persona (alternative endpoint)"""
    try:
        # Extract message from request
        message = request.get("message", "")
        user_id = request.get("user_id", "anonymous")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # For now, return a simple response without full chat processing
        return {
            "message": f"Hello! I'm {persona_id.title()}. Thank you for your message: '{message}'. This is a test response from the Python backend.",
            "persona_id": persona_id,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "success": True
        }
        
    except Exception as e:
        print(f"Error in chat_with_persona: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/personas/{persona_id}/stats")
async def get_persona_stats(
    persona_id: str,
    req: Request,
    db_session=Depends(get_db)
):
    """Get usage statistics for a persona"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get conversations with this persona
        conversations = await storage.get_user_conversations(user_id)
        persona_conversations = [c for c in conversations if c.persona_id == persona_id]
        
        # Get analytics for this persona
        analytics = await storage.get_user_session_analytics(user_id)
        persona_analytics = [a for a in analytics if a.persona_id == persona_id]
        
        # Calculate stats
        total_conversations = len(persona_conversations)
        total_sessions = len(persona_analytics)
        total_messages = sum(a.message_count for a in persona_analytics)
        
        # Average session duration
        durations = [a.duration_minutes for a in persona_analytics if a.duration_minutes]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        # Most recent conversation
        last_conversation = persona_conversations[0] if persona_conversations else None
        
        return {
            "persona_id": persona_id,
            "total_conversations": total_conversations,
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "average_duration_minutes": round(avg_duration, 1),
            "last_conversation_date": last_conversation.updated_at if last_conversation else None,
            "usage_frequency": "high" if total_sessions > 10 else "medium" if total_sessions > 3 else "low"
        }
        
    except Exception as e:
        print(f"Error in get_persona_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))