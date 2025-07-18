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
from core.passive_logger import PassiveLogger
from core.session_manager import SessionManager
from core.emotional_timeline import EmotionalTimelineTracker
from core.persona_pathways import PersonaPathwaySystem
from core.daily_loop import DailySoulSenseLoop
from core.daily_loop_integration import DailyLoopIntegration
from core.advanced_emotion_engine import AdvancedEmotionEngine
from api.emotional_intelligence import router as emotional_intelligence_router
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
passive_logger = PassiveLogger()
session_manager = SessionManager()
emotional_timeline = EmotionalTimelineTracker()
persona_pathways = PersonaPathwaySystem()
daily_loop = DailySoulSenseLoop()
daily_loop_integration = DailyLoopIntegration()

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
    await passive_logger.initialize()
    await session_manager.initialize()
    await emotional_timeline.initialize()
    await persona_pathways.initialize()
    await daily_loop.initialize()
    await daily_loop_integration.initialize()
    yield
    await database.close()
    await passive_logger.close()
    await session_manager.close()
    await emotional_timeline.close()
    await persona_pathways.close()
    await daily_loop.close()
    await daily_loop_integration.close()

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

# Include API routers
app.include_router(emotional_intelligence_router)

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
        
        # Get daily loop context for personalized response
        daily_context = await daily_loop_integration.get_persona_context(user_id, persona_id)
        
        # Generate persona-specific response with daily loop context
        response = await handler.generate_response(
            message.content,
            message.conversation_history or [],
            emotional_context,
            memory,
            daily_context
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
        
        # Session management and passive logging
        session_id = message.session_id or await session_manager.start_session(user_id, persona_id)
        
        # Update session context
        await session_manager.update_session_context(
            session_id=session_id,
            user_message=message.content,
            ai_response=response.content,
            emotional_context=emotional_context.__dict__
        )
        
        # Emotional timeline tracking
        await emotional_timeline.log_emotional_point(
            user_id=user_id,
            emotion=emotional_context.primary_emotion,
            intensity=emotional_context.intensity,
            session_id=session_id,
            persona_id=persona_id,
            source_type="chat",
            context_excerpt=message.content[:100]  # First 100 chars as excerpt
        )

        # Passive logging - store conversation in background (non-blocking)
        passive_logger.log_conversation_async(
            session_id=session_id,
            user_id=user_id,
            persona_id=persona_id,
            user_message=message.content,
            ai_response=response.content,
            emotional_context=emotional_context.__dict__
        )
        
        # Log quick reply suggestions passively
        passive_logger.log_interaction_async(
            user_id=user_id,
            persona_id=persona_id,
            session_id=session_id,
            interaction_type="quick_replies_suggested",
            interaction_data={
                "quick_replies": quick_reply_data,
                "emotional_context": emotional_context.primary_emotion.value if hasattr(emotional_context, 'primary_emotion') else 'neutral'
            }
        )

        return ChatResponse(
            content=response.content,
            persona_id=persona_id,
            emotion=emotional_context.primary_emotion,
            confidence=emotional_context.confidence,
            features_activated=handler.get_active_features(),
            persona_config=handler.get_config(),
            session_id=session_id,
            quick_replies=quick_reply_data
        )
        
    except Exception as e:
        error_message = f"{handler.get_config().name} is currently unavailable. Please try again soon."
        raise HTTPException(status_code=500, detail=error_message)

# Breathing exercise endpoints
@app.post("/api/breathing/session")
async def create_breathing_session(session: BreathingSession, user_id: str = "anonymous"):
    """Create and track breathing exercise session"""
    result = await database.store_breathing_session(user_id, session)
    
    # Passive logging for breathing session
    passive_logger.log_wellness_activity_async(
        user_id=user_id,
        persona_id=getattr(session, 'persona_id', 'unknown'),
        activity_type="breathing_exercise",
        activity_data={
            "technique": session.technique,
            "rounds_completed": getattr(session, 'rounds_completed', 0)
        },
        duration_seconds=session.duration_seconds,
        effectiveness_rating=getattr(session, 'effectiveness_rating', 0)
    )
    
    return result

@app.get("/api/breathing/history/{user_id}")
async def get_breathing_history(user_id: str):
    """Get user's breathing exercise history"""
    return await database.get_breathing_history(user_id)

# Journal endpoints
@app.post("/api/journal/entry")
async def create_journal_entry(entry: JournalEntry, user_id: str = "anonymous"):
    """Create journal entry with persona-specific insights"""
    result = await database.store_journal_entry(user_id, entry)
    
    # Passive logging for journal entry
    passive_logger.log_diary_entry_async(
        user_id=user_id,
        persona_id=getattr(entry, 'persona_id', 'unknown'),
        entry_content=entry.content,
        mood_rating=entry.mood.value if hasattr(entry.mood, 'value') else str(entry.mood),
        emotion_tags=getattr(entry, 'emotion_tags', [])
    )
    
    return result

@app.get("/api/journal/entries/{user_id}")
async def get_journal_entries(user_id: str):
    """Get user's journal entries"""
    return await database.get_journal_entries(user_id)

# Goal setting endpoints
@app.post("/api/goals")
async def create_goal(goal: Goal, user_id: str = "anonymous"):
    """Create wellness goal with persona guidance"""
    result = await database.store_goal(user_id, goal)
    
    # Passive logging for goal creation
    passive_logger.log_goal_interaction_async(
        user_id=user_id,
        persona_id=getattr(goal, 'persona_id', 'unknown'),
        goal_title=goal.title,
        goal_description=goal.description,
        goal_category=goal.category,
        action_type="create",
        progress_value=0.0
    )
    
    return result

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

# Enhanced data endpoints
from api.data_endpoints import router as data_router
app.include_router(data_router, prefix="/api/data", tags=["data"])

# Session continuity endpoints
@app.get("/api/session/last-unfinished/{user_id}/{persona_id}")
async def get_last_unfinished_session(user_id: str, persona_id: str):
    """Get the most recent unfinished session for resumption"""
    context = await session_manager.get_last_unfinished_session(user_id, persona_id)
    if not context:
        return {"has_unfinished": False}
    
    # Generate continuation prompt
    continuation_prompt = await session_manager.generate_continuation_prompt(context, "there")
    
    return {
        "has_unfinished": True,
        "session_id": context.session_id,
        "continuation_prompt": continuation_prompt,
        "last_activity": context.last_activity.isoformat(),
        "message_count": context.message_count,
        "key_topics": context.key_topics,
        "emotional_tone": context.emotional_tone
    }

@app.post("/api/session/finish/{session_id}")
async def finish_session(session_id: str, request: dict):
    """Mark session as finished and generate summary"""
    achievements = request.get('achievements', [])
    mood_change = request.get('mood_change', '')
    next_steps = request.get('next_steps', [])
    
    summary = await session_manager.finish_session(
        session_id=session_id,
        achievements=achievements,
        mood_change=mood_change,
        next_steps=next_steps
    )
    
    return summary

@app.get("/api/session/recent/{user_id}")
async def get_recent_sessions(user_id: str, persona_id: str = None, limit: int = 5):
    """Get recent sessions for a user"""
    sessions = await session_manager.get_recent_sessions(user_id, persona_id, limit)
    
    return [
        {
            "session_id": session.session_id,
            "persona_id": session.persona_id,
            "last_activity": session.last_activity.isoformat(),
            "message_count": session.message_count,
            "key_topics": session.key_topics,
            "emotional_tone": session.emotional_tone,
            "unfinished": session.unfinished
        }
        for session in sessions
    ]

# Emotional timeline endpoints
@app.get("/api/emotional-timeline/{user_id}")
async def get_emotional_timeline(user_id: str, period: str = "week", start_date: str = None):
    """Get emotional timeline data for visualization"""
    from datetime import datetime
    
    parsed_start_date = None
    if start_date:
        try:
            parsed_start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        except ValueError:
            parsed_start_date = None
    
    timeline_points = await emotional_timeline.get_emotional_timeline(
        user_id=user_id,
        period=period,
        start_date=parsed_start_date
    )
    
    return [
        {
            "date": point.date.isoformat(),
            "primary_emotion": point.primary_emotion,
            "intensity": point.intensity,
            "session_id": point.session_id,
            "persona_id": point.persona_id,
            "key_excerpt": point.key_excerpt,
            "mood_color": point.mood_color,
            "session_type": point.session_type
        }
        for point in timeline_points
    ]

@app.get("/api/emotional-timeline/{user_id}/metrics")
async def get_timeline_metrics(user_id: str, period: str = "week"):
    """Get timeline analytics and insights"""
    metrics = await emotional_timeline.get_timeline_metrics(user_id, period)
    
    return {
        "date_range": [metrics.date_range[0].isoformat(), metrics.date_range[1].isoformat()],
        "total_sessions": metrics.total_sessions,
        "dominant_emotions": metrics.dominant_emotions,
        "emotional_trend": metrics.emotional_trend,
        "crisis_moments": metrics.crisis_moments,
        "breakthrough_moments": metrics.breakthrough_moments
    }

@app.get("/api/emotional-timeline/{user_id}/moments/{target_date}")
async def get_clickable_moments(user_id: str, target_date: str):
    """Get detailed moments for a specific date"""
    from datetime import datetime
    
    try:
        parsed_date = datetime.strptime(target_date, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    moments = await emotional_timeline.get_clickable_moments(user_id, parsed_date)
    return moments

@app.get("/api/emotional-timeline/{user_id}/weekly-insights")
async def get_weekly_insights(user_id: str, week_start: str = None):
    """Generate weekly emotional pattern insights"""
    from datetime import datetime
    
    parsed_week_start = None
    if week_start:
        try:
            parsed_week_start = datetime.strptime(week_start, '%Y-%m-%d').date()
        except ValueError:
            parsed_week_start = None
    
    insights = await emotional_timeline.generate_weekly_insights(user_id, parsed_week_start)
    return insights

# Persona pathways endpoints
@app.get("/api/pathways")
async def get_available_pathways(persona_id: str = None):
    """Get available guided pathways, optionally filtered by persona"""
    pathways = await persona_pathways.get_available_pathways(persona_id)
    return pathways

@app.post("/api/pathways/{pathway_id}/enroll")
async def enroll_in_pathway(pathway_id: str, request: dict):
    """Enroll user in a guided pathway"""
    user_id = request.get('user_id')
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    
    success = await persona_pathways.enroll_user_in_pathway(user_id, pathway_id)
    if success:
        return {"message": "Successfully enrolled in pathway", "pathway_id": pathway_id}
    else:
        raise HTTPException(status_code=400, detail="Failed to enroll in pathway")

@app.get("/api/pathways/user/{user_id}")
async def get_user_pathways(user_id: str):
    """Get all pathways for a user"""
    pathways = await persona_pathways.get_user_pathways(user_id)
    return pathways

@app.get("/api/pathways/{pathway_id}/activity/{day_number}")
async def get_daily_activity(pathway_id: str, day_number: int):
    """Get the daily activity for a specific pathway and day"""
    activity = await persona_pathways.get_daily_activity(pathway_id, day_number)
    if activity:
        return activity
    else:
        raise HTTPException(status_code=404, detail="Activity not found")

@app.post("/api/pathways/{pathway_id}/complete")
async def complete_daily_activity(pathway_id: str, request: dict):
    """Mark a daily activity as completed"""
    user_id = request.get('user_id')
    day_number = request.get('day_number')
    mood_rating = request.get('mood_rating')
    completion_notes = request.get('completion_notes', '')
    time_spent_minutes = request.get('time_spent_minutes')
    
    if not user_id or not day_number:
        raise HTTPException(status_code=400, detail="User ID and day number required")
    
    success = await persona_pathways.complete_daily_activity(
        user_id, pathway_id, day_number, mood_rating, completion_notes, time_spent_minutes
    )
    
    if success:
        return {"message": "Activity completed successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to complete activity")

@app.get("/api/pathways/{pathway_id}/progress/{user_id}")
async def get_pathway_progress(pathway_id: str, user_id: str):
    """Get detailed progress for a user's pathway"""
    progress = await persona_pathways.get_user_progress(user_id, pathway_id)
    if progress:
        return progress
    else:
        raise HTTPException(status_code=404, detail="Pathway progress not found")

@app.get("/api/pathways/recommendations/{user_id}")
async def get_pathway_recommendations(user_id: str, emotional_state: str = None):
    """Get personalized pathway recommendations"""
    recommendations = await persona_pathways.get_pathway_recommendations(user_id, emotional_state)
    return recommendations

# Daily Loop endpoints
@app.get("/api/daily-loop/morning/{user_id}")
async def get_morning_activity(user_id: str, date: str = None):
    """Get personalized morning check-in activity"""
    parsed_date = None
    if date:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            parsed_date = None
    
    activity = await daily_loop.get_morning_activity(user_id, parsed_date)
    return activity

@app.get("/api/daily-loop/evening/{user_id}")
async def get_evening_activity(user_id: str, date: str = None):
    """Get personalized evening reflection activity"""
    parsed_date = None
    if date:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            parsed_date = None
    
    activity = await daily_loop.get_evening_activity(user_id, parsed_date)
    return activity

@app.get("/api/daily-loop/midday/{user_id}")
async def get_midday_pulse(user_id: str):
    """Get midday pulse check activity"""
    activity = await daily_loop.get_midday_pulse(user_id)
    return activity

@app.post("/api/daily-loop/complete")
async def complete_loop_activity(request: dict):
    """Complete a daily loop activity"""
    user_id = request.get('user_id')
    loop_type = request.get('loop_type')
    mood_rating = request.get('mood_rating')
    energy_level = request.get('energy_level')
    stress_level = request.get('stress_level')
    
    if not user_id or not loop_type:
        raise HTTPException(status_code=400, detail="User ID and loop type required")
    
    success = await daily_loop.complete_loop_activity(
        user_id=user_id,
        loop_type=loop_type,
        mood_rating=mood_rating,
        energy_level=energy_level,
        stress_level=stress_level,
        gratitude_notes=request.get('gratitude_notes', ''),
        challenges_faced=request.get('challenges_faced', ''),
        accomplishments=request.get('accomplishments', ''),
        goals_for_day=request.get('goals_for_day', ''),
        reflection_notes=request.get('reflection_notes', ''),
        selected_persona=request.get('selected_persona', ''),
        date=None
    )
    
    if success:
        return {"message": "Loop activity completed successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to complete loop activity")

@app.get("/api/daily-loop/summary/{user_id}")
async def get_daily_summary(user_id: str, date: str = None):
    """Get comprehensive daily summary"""
    parsed_date = None
    if date:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            parsed_date = None
    
    summary = await daily_loop.get_user_daily_summary(user_id, parsed_date)
    return summary

@app.get("/api/daily-loop/weekly/{user_id}")
async def get_weekly_summary(user_id: str, week_start: str = None):
    """Get weekly summary of daily loop activities"""
    parsed_week_start = None
    if week_start:
        try:
            parsed_week_start = datetime.strptime(week_start, '%Y-%m-%d').date()
        except ValueError:
            parsed_week_start = None
    
    summary = await daily_loop.get_weekly_loop_summary(user_id, parsed_week_start)
    return summary

# Daily Loop Integration endpoints
@app.get("/api/daily-loop-integration/persona-context/{user_id}/{persona_id}")
async def get_persona_context(user_id: str, persona_id: str, date: str = None):
    """Get daily loop context for a specific persona"""
    parsed_date = None
    if date:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            parsed_date = None
    
    context = await daily_loop_integration.get_persona_context(user_id, persona_id, parsed_date)
    return context

@app.get("/api/daily-loop-integration/weekly-insights/{user_id}")
async def get_weekly_persona_insights(user_id: str):
    """Get weekly insights for persona recommendations"""
    insights = await daily_loop_integration.get_weekly_persona_insights(user_id)
    return insights

@app.post("/api/daily-loop-integration/save-context")
async def save_persona_context(request: dict):
    """Save persona context for future reference"""
    user_id = request.get('user_id')
    persona_id = request.get('persona_id')
    context_data = request.get('context_data')
    
    if not user_id or not persona_id or not context_data:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    await daily_loop_integration.save_persona_context(user_id, persona_id, context_data)
    return {"message": "Context saved successfully"}

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