"""
Data Endpoints - API routes for comprehensive data operations
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any, List
from datetime import datetime
from core.data_pipeline import DataPipeline
from core.database import Database
from core.llm_client import LLMClient
from models.schemas import (
    JournalEntry,
    Goal,
    BreathingSession,
    UserProfile
)

router = APIRouter()

# Initialize components
database = Database()
llm_client = LLMClient()
data_pipeline = DataPipeline(database, llm_client)

@router.post("/sessions/{session_id}/summary")
async def generate_session_summary(session_id: str, user_id: str, persona_id: str):
    """Generate and store session summary"""
    try:
        summary = await data_pipeline.generate_and_store_session_summary(
            session_id=session_id,
            user_id=user_id,
            persona_id=persona_id
        )
        return {
            "session_id": session_id,
            "summary": summary,
            "status": "generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")

@router.post("/mood-checkin")
async def log_mood_checkin(
    user_id: str,
    persona_id: str,
    session_id: str,
    mood_rating: int,
    emotion_tags: List[str],
    energy_level: int,
    stress_level: int,
    additional_notes: str = "",
    context_activity: str = ""
):
    """Log detailed mood check-in"""
    try:
        await data_pipeline.log_mood_checkin(
            user_id=user_id,
            persona_id=persona_id,
            session_id=session_id,
            mood_rating=mood_rating,
            emotion_tags=emotion_tags,
            energy_level=energy_level,
            stress_level=stress_level,
            additional_notes=additional_notes,
            context_activity=context_activity
        )
        return {"status": "logged", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mood logging failed: {str(e)}")

@router.post("/journal/enhanced")
async def create_enhanced_journal_entry(
    user_id: str,
    persona_id: str,
    entry: JournalEntry
):
    """Create journal entry with AI reflection"""
    try:
        # Store base journal entry
        journal_id = await database.store_journal_entry(user_id, entry)
        
        # Generate AI reflection
        reflection = await data_pipeline.log_journal_with_ai_reflection(
            user_id=user_id,
            persona_id=persona_id,
            journal_entry_id=journal_id,
            raw_user_input=entry.content,
            mood=entry.mood.value
        )
        
        return {
            "journal_id": journal_id,
            "ai_reflection": reflection,
            "status": "created_with_reflection"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhanced journal creation failed: {str(e)}")

@router.get("/user/{user_id}/interaction-history")
async def get_interaction_history(
    user_id: str,
    persona_id: Optional[str] = None,
    days_back: int = 30
):
    """Get comprehensive user interaction history"""
    try:
        history = await data_pipeline.get_user_interaction_history(
            user_id=user_id,
            persona_id=persona_id,
            days_back=days_back
        )
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History retrieval failed: {str(e)}")

@router.get("/user/{user_id}/data-export")
async def export_user_data(user_id: str):
    """Export all user data for backup or migration"""
    try:
        # Get all user data
        conversations = await database.connection.execute('''
            SELECT * FROM conversations WHERE user_id = ? ORDER BY timestamp DESC
        ''', (user_id,))
        conversations = [dict(row) for row in await conversations.fetchall()]
        
        summaries = await database.connection.execute('''
            SELECT * FROM conversation_summaries WHERE user_id = ? ORDER BY created_at DESC
        ''', (user_id,))
        summaries = [dict(row) for row in await summaries.fetchall()]
        
        quick_replies = await database.connection.execute('''
            SELECT * FROM quick_reply_interactions WHERE user_id = ? ORDER BY created_at DESC
        ''', (user_id,))
        quick_replies = [dict(row) for row in await quick_replies.fetchall()]
        
        mood_checkins = await database.connection.execute('''
            SELECT * FROM mood_checkins WHERE user_id = ? ORDER BY created_at DESC
        ''', (user_id,))
        mood_checkins = [dict(row) for row in await mood_checkins.fetchall()]
        
        journal_entries = await database.connection.execute('''
            SELECT * FROM journal_entries WHERE user_id = ? ORDER BY timestamp DESC
        ''', (user_id,))
        journal_entries = [dict(row) for row in await journal_entries.fetchall()]
        
        goals = await database.connection.execute('''
            SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC
        ''', (user_id,))
        goals = [dict(row) for row in await goals.fetchall()]
        
        return {
            "user_id": user_id,
            "export_timestamp": datetime.now().isoformat(),
            "data": {
                "conversations": conversations,
                "conversation_summaries": summaries,
                "quick_reply_interactions": quick_replies,
                "mood_checkins": mood_checkins,
                "journal_entries": journal_entries,
                "goals": goals
            },
            "metadata": {
                "total_conversations": len(conversations),
                "total_summaries": len(summaries),
                "total_quick_replies": len(quick_replies),
                "total_mood_checkins": len(mood_checkins),
                "total_journal_entries": len(journal_entries),
                "total_goals": len(goals)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data export failed: {str(e)}")

@router.get("/training-data")
async def get_training_data(
    persona_id: Optional[str] = None,
    interaction_type: Optional[str] = None,
    limit: int = 1000
):
    """Get interaction training data for AI fine-tuning"""
    try:
        where_conditions = []
        params = []
        
        if persona_id:
            where_conditions.append("persona_id = ?")
            params.append(persona_id)
        
        if interaction_type:
            where_conditions.append("interaction_type = ?")
            params.append(interaction_type)
        
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)
        
        params.append(limit)
        
        training_data = await database.connection.execute(f'''
            SELECT * FROM interaction_training_data 
            {where_clause}
            ORDER BY created_at DESC 
            LIMIT ?
        ''', params)
        
        training_data = [dict(row) for row in await training_data.fetchall()]
        
        return {
            "training_data": training_data,
            "total_records": len(training_data),
            "persona_filter": persona_id,
            "interaction_type_filter": interaction_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training data retrieval failed: {str(e)}")

@router.get("/analytics/database-stats")
async def get_database_statistics():
    """Get comprehensive database statistics"""
    try:
        stats = {}
        
        # Count records in each table
        tables = [
            'users', 'conversations', 'conversation_summaries', 
            'quick_reply_interactions', 'mood_checkins', 'journal_entries',
            'journal_reflections', 'goals', 'breathing_sessions',
            'interaction_training_data'
        ]
        
        for table in tables:
            result = await database.connection.execute(f'SELECT COUNT(*) as count FROM {table}')
            count_row = await result.fetchone()
            stats[table] = count_row['count']
        
        # Get date ranges
        conversations_date_range = await database.connection.execute('''
            SELECT MIN(timestamp) as earliest, MAX(timestamp) as latest 
            FROM conversations
        ''')
        date_range = await conversations_date_range.fetchone()
        
        return {
            "table_counts": stats,
            "date_range": {
                "earliest_conversation": date_range['earliest'],
                "latest_conversation": date_range['latest']
            },
            "total_interactions": sum(stats.values()),
            "database_health": "operational"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics retrieval failed: {str(e)}")