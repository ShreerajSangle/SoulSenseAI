from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime

from models import UserResponse, UserCreate
from auth import get_user_id
from storage import Storage
from database import get_db

router = APIRouter()

@router.get("/profile")
async def get_user_profile(
    req: Request,
    db_session=Depends(get_db)
):
    """Get current user profile with comprehensive data"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get or create user profile
        profile = await storage.get_user_profile(user_id)
        
        if not profile:
            # Create default profile for new user
            user_data = UserCreate(
                id=user_id,
                name="Demo User",
                email=f"{user_id}@example.com"
            )
            await storage.upsert_user(user_data)
            profile = await storage.get_user_profile(user_id)
        
        return profile
        
    except Exception as e:
        print(f"Error in get_user_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
async def update_user_profile(
    updates: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Update user profile"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Update profile
        profile = await storage.update_user_profile(user_id, updates)
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_user_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/analytics")
async def get_profile_analytics(
    req: Request,
    db_session=Depends(get_db)
):
    """Get comprehensive profile analytics"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get dashboard data
        dashboard_data = await storage.get_user_dashboard_data(user_id)
        
        # Get recent activities
        recent_conversations = dashboard_data["conversations"][:5]
        recent_goals = dashboard_data["goals"][:5]
        recent_moods = dashboard_data["mood_entries"][:7]
        
        # Calculate persona preferences
        persona_usage = {}
        for conv in dashboard_data["conversations"]:
            persona_id = conv.persona_id
            persona_usage[persona_id] = persona_usage.get(persona_id, 0) + 1
        
        # Sort personas by usage
        sorted_personas = sorted(persona_usage.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "overview": {
                "totalSessions": dashboard_data["total_sessions"],
                "currentStreak": dashboard_data["current_streak"],
                "averageMood": dashboard_data["average_mood"],
                "favoritePersona": dashboard_data["favorite_persona"],
                "totalGoals": len(dashboard_data["goals"]),
                "completedGoals": dashboard_data["completed_goals"]
            },
            "recentActivity": {
                "conversations": [
                    {
                        "id": conv.id,
                        "persona_id": conv.persona_id,
                        "title": conv.title,
                        "updated_at": conv.updated_at.isoformat()
                    }
                    for conv in recent_conversations
                ],
                "goals": [
                    {
                        "id": goal.id,
                        "title": goal.title,
                        "status": goal.status,
                        "progress": goal.progress,
                        "updated_at": goal.updated_at.isoformat()
                    }
                    for goal in recent_goals
                ],
                "moods": [
                    {
                        "id": mood.id,
                        "mood_rating": mood.mood_rating,
                        "energy_level": mood.energy_level,
                        "created_at": mood.created_at.isoformat()
                    }
                    for mood in recent_moods
                ]
            },
            "personaPreferences": [
                {
                    "persona_id": persona_id,
                    "usage_count": count,
                    "percentage": round((count / len(dashboard_data["conversations"])) * 100, 1) if dashboard_data["conversations"] else 0
                }
                for persona_id, count in sorted_personas
            ],
            "streaks": {
                "current": dashboard_data["current_streak"],
                "longest": dashboard_data["current_streak"],  # Could implement longest streak tracking
                "type": "daily_chat"
            }
        }
        
    except Exception as e:
        print(f"Error in get_profile_analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/sessions")
async def get_profile_sessions(
    req: Request,
    limit: int = 20,
    db_session=Depends(get_db)
):
    """Get recent therapy sessions"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get session analytics
        sessions = await storage.get_user_session_analytics(user_id, days=90)
        
        # Format for frontend
        formatted_sessions = []
        for session in sessions[:limit]:
            formatted_sessions.append({
                "id": session.id,
                "persona_id": session.persona_id,
                "session_type": session.session_type,
                "duration": session.duration_minutes,
                "message_count": session.message_count,
                "mood_before": session.mood_before,
                "mood_after": session.mood_after,
                "created_at": session.created_at.isoformat(),
                "techniques_used": session.techniques_used or [],
                "satisfaction_rating": session.satisfaction_rating
            })
        
        return {
            "total": len(sessions),
            "sessions": formatted_sessions,
            "summary": {
                "total_duration": sum(s.duration_minutes for s in sessions if s.duration_minutes),
                "average_duration": sum(s.duration_minutes for s in sessions if s.duration_minutes) / len([s for s in sessions if s.duration_minutes]) if sessions else 0,
                "total_messages": sum(s.message_count for s in sessions),
                "most_active_persona": max(
                    set(s.persona_id for s in sessions),
                    key=lambda p: len([s for s in sessions if s.persona_id == p])
                ) if sessions else None
            }
        }
        
    except Exception as e:
        print(f"Error in get_profile_sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/mood-trends")
async def get_profile_mood_trends(
    req: Request,
    days: int = 30,
    db_session=Depends(get_db)
):
    """Get mood trends for profile"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get mood entries
        mood_entries = await storage.get_user_mood_entries(user_id, days)
        
        if not mood_entries:
            return {
                "totalEntries": 0,
                "averageMood": 0,
                "trend": "stable",
                "entries": []
            }
        
        # Calculate weekly averages
        weekly_averages = {}
        for entry in mood_entries:
            # Group by week
            week_key = entry.created_at.strftime("%Y-W%U")
            if week_key not in weekly_averages:
                weekly_averages[week_key] = []
            weekly_averages[week_key].append(entry.mood_rating)
        
        # Calculate averages
        week_data = []
        for week, ratings in weekly_averages.items():
            avg_mood = sum(ratings) / len(ratings)
            week_data.append({
                "week": week,
                "average_mood": round(avg_mood, 1),
                "entries": len(ratings)
            })
        
        # Sort by week
        week_data.sort(key=lambda x: x["week"])
        
        # Calculate overall trend
        if len(week_data) >= 2:
            recent_avg = week_data[-1]["average_mood"]
            previous_avg = week_data[-2]["average_mood"]
            if recent_avg > previous_avg + 0.5:
                trend = "improving"
            elif recent_avg < previous_avg - 0.5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"
        
        return {
            "totalEntries": len(mood_entries),
            "averageMood": round(sum(e.mood_rating for e in mood_entries) / len(mood_entries), 1),
            "trend": trend,
            "weeklyData": week_data,
            "recentEntries": [
                {
                    "mood_rating": entry.mood_rating,
                    "energy_level": entry.energy_level,
                    "stress_level": entry.stress_level,
                    "created_at": entry.created_at.isoformat()
                }
                for entry in mood_entries[:10]
            ]
        }
        
    except Exception as e:
        print(f"Error in get_profile_mood_trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/preferences")
async def get_user_preferences(
    req: Request,
    db_session=Depends(get_db)
):
    """Get user preferences"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        user = await storage.get_user(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "preferences": user.preferences or {},
            "privacy_settings": user.privacy_settings or {},
            "notification_settings": user.preferences.get("notifications", {}) if user.preferences else {}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_user_preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile/preferences")
async def update_user_preferences(
    preferences: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Update user preferences"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Update preferences
        updates = {}
        if "preferences" in preferences:
            updates["preferences"] = preferences["preferences"]
        if "privacy_settings" in preferences:
            updates["privacy_settings"] = preferences["privacy_settings"]
        
        profile = await storage.update_user_profile(user_id, updates)
        
        if not profile:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Preferences updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_user_preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))