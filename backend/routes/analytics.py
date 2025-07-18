from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from auth import get_user_id
from storage import Storage
from database import get_db

router = APIRouter()

@router.get("/analytics/dashboard")
async def get_dashboard_analytics(
    req: Request,
    db_session=Depends(get_db)
):
    """Get comprehensive dashboard analytics for user"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get comprehensive dashboard data
        dashboard_data = await storage.get_user_dashboard_data(user_id)
        
        # Format for frontend
        return {
            "totalSessions": dashboard_data["total_sessions"],
            "currentStreak": dashboard_data["current_streak"],
            "averageMood": round(dashboard_data["average_mood"], 1),
            "favoritePersona": dashboard_data["favorite_persona"],
            "goalProgress": {
                "total": len(dashboard_data["goals"]),
                "completed": dashboard_data["completed_goals"],
                "percentage": (dashboard_data["completed_goals"] / len(dashboard_data["goals"]) * 100) if dashboard_data["goals"] else 0
            },
            "sessionHistory": [
                {
                    "id": session.id,
                    "personaId": session.persona_id,
                    "date": session.created_at.isoformat(),
                    "duration": session.duration_minutes,
                    "messageCount": session.message_count,
                    "moodBefore": session.mood_before,
                    "moodAfter": session.mood_after
                }
                for session in dashboard_data["session_analytics"][:10]
            ],
            "moodTrends": [
                {
                    "date": entry.created_at.isoformat(),
                    "mood": entry.mood_rating,
                    "energy": entry.energy_level,
                    "stress": entry.stress_level
                }
                for entry in dashboard_data["mood_entries"][:30]
            ]
        }
        
    except Exception as e:
        print(f"Error in get_dashboard_analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/sessions")
async def get_session_analytics(
    req: Request,
    days: int = 30,
    db_session=Depends(get_db)
):
    """Get session analytics for user"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get session analytics
        analytics = await storage.get_user_session_analytics(user_id, days)
        
        # Group by persona
        persona_stats = {}
        for session in analytics:
            persona_id = session.persona_id
            if persona_id not in persona_stats:
                persona_stats[persona_id] = {
                    "persona_id": persona_id,
                    "total_sessions": 0,
                    "total_messages": 0,
                    "total_duration": 0,
                    "average_duration": 0
                }
            
            persona_stats[persona_id]["total_sessions"] += 1
            persona_stats[persona_id]["total_messages"] += session.message_count
            if session.duration_minutes:
                persona_stats[persona_id]["total_duration"] += session.duration_minutes
        
        # Calculate averages
        for stats in persona_stats.values():
            if stats["total_sessions"] > 0:
                stats["average_duration"] = round(stats["total_duration"] / stats["total_sessions"], 1)
        
        return {
            "totalSessions": len(analytics),
            "dateRange": {
                "start": (datetime.utcnow() - timedelta(days=days)).isoformat(),
                "end": datetime.utcnow().isoformat()
            },
            "personaStats": list(persona_stats.values()),
            "recentSessions": [
                {
                    "id": session.id,
                    "persona_id": session.persona_id,
                    "created_at": session.created_at.isoformat(),
                    "duration_minutes": session.duration_minutes,
                    "message_count": session.message_count,
                    "mood_before": session.mood_before,
                    "mood_after": session.mood_after
                }
                for session in analytics[:20]
            ]
        }
        
    except Exception as e:
        print(f"Error in get_session_analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/personas")
async def get_persona_analytics(
    req: Request,
    db_session=Depends(get_db)
):
    """Get persona usage analytics"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get conversations and analytics
        conversations = await storage.get_user_conversations(user_id)
        analytics = await storage.get_user_session_analytics(user_id)
        
        # Group by persona
        persona_data = {}
        for conversation in conversations:
            persona_id = conversation.persona_id
            if persona_id not in persona_data:
                persona_data[persona_id] = {
                    "persona_id": persona_id,
                    "conversations": 0,
                    "sessions": 0,
                    "last_interaction": None,
                    "total_messages": 0,
                    "preferred_times": [],
                    "affinity_score": 0
                }
            
            persona_data[persona_id]["conversations"] += 1
            if not persona_data[persona_id]["last_interaction"] or conversation.updated_at > persona_data[persona_id]["last_interaction"]:
                persona_data[persona_id]["last_interaction"] = conversation.updated_at
        
        # Add session data
        for session in analytics:
            persona_id = session.persona_id
            if persona_id in persona_data:
                persona_data[persona_id]["sessions"] += 1
                persona_data[persona_id]["total_messages"] += session.message_count
        
        # Calculate affinity scores
        total_sessions = len(analytics)
        for data in persona_data.values():
            if total_sessions > 0:
                data["affinity_score"] = round((data["sessions"] / total_sessions) * 100, 1)
        
        return {
            "totalPersonas": len(persona_data),
            "totalInteractions": len(conversations),
            "personaBreakdown": [
                {
                    **data,
                    "last_interaction": data["last_interaction"].isoformat() if data["last_interaction"] else None
                }
                for data in persona_data.values()
            ],
            "favoritePersona": max(persona_data.keys(), key=lambda k: persona_data[k]["affinity_score"]) if persona_data else None
        }
        
    except Exception as e:
        print(f"Error in get_persona_analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/mood-trends")
async def get_mood_trends(
    req: Request,
    days: int = 30,
    db_session=Depends(get_db)
):
    """Get mood trends analytics"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get mood entries
        mood_entries = await storage.get_user_mood_entries(user_id, days)
        
        if not mood_entries:
            return {
                "totalEntries": 0,
                "averageMood": 0,
                "moodTrend": "stable",
                "entries": []
            }
        
        # Calculate statistics
        total_entries = len(mood_entries)
        average_mood = sum(entry.mood_rating for entry in mood_entries) / total_entries
        
        # Calculate trend (last 7 days vs previous 7 days)
        recent_entries = [e for e in mood_entries if e.created_at >= datetime.utcnow() - timedelta(days=7)]
        older_entries = [e for e in mood_entries if e.created_at < datetime.utcnow() - timedelta(days=7) and e.created_at >= datetime.utcnow() - timedelta(days=14)]
        
        recent_avg = sum(e.mood_rating for e in recent_entries) / len(recent_entries) if recent_entries else 0
        older_avg = sum(e.mood_rating for e in older_entries) / len(older_entries) if older_entries else 0
        
        if recent_avg > older_avg + 0.5:
            trend = "improving"
        elif recent_avg < older_avg - 0.5:
            trend = "declining"
        else:
            trend = "stable"
        
        return {
            "totalEntries": total_entries,
            "averageMood": round(average_mood, 1),
            "moodTrend": trend,
            "trendChange": round(recent_avg - older_avg, 1),
            "entries": [
                {
                    "id": entry.id,
                    "mood_rating": entry.mood_rating,
                    "energy_level": entry.energy_level,
                    "stress_level": entry.stress_level,
                    "notes": entry.notes,
                    "created_at": entry.created_at.isoformat()
                }
                for entry in mood_entries
            ]
        }
        
    except Exception as e:
        print(f"Error in get_mood_trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/mood-entry")
async def create_mood_entry(
    request: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Create a new mood entry"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        from models import MoodEntryCreate
        
        # Validate and create mood entry
        mood_data = MoodEntryCreate(
            mood_rating=request.get("mood_rating", 3),
            energy_level=request.get("energy_level"),
            stress_level=request.get("stress_level"),
            notes=request.get("notes"),
            type=request.get("type", "general")
        )
        
        mood_entry = await storage.create_mood_entry(user_id, mood_data)
        
        return {
            "id": mood_entry.id,
            "mood_rating": mood_entry.mood_rating,
            "energy_level": mood_entry.energy_level,
            "stress_level": mood_entry.stress_level,
            "notes": mood_entry.notes,
            "type": mood_entry.type,
            "created_at": mood_entry.created_at.isoformat()
        }
        
    except Exception as e:
        print(f"Error in create_mood_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))