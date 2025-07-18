"""
Analytics API endpoints for SoulSense AI
"""

from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()


class AnalyticsData(BaseModel):
    totalSessions: int
    currentStreak: int
    longestStreak: int
    averageMood: float
    totalGoalsCompleted: int
    recentActivity: List[Dict[str, Any]]
    moodTrends: List[Dict[str, Any]]
    personaUsage: List[Dict[str, Any]]


@router.get("/analytics", response_model=AnalyticsData)
async def get_analytics(request: Request):
    """Get user analytics and insights"""
    try:
        storage = request.app.state.storage
        database = request.app.state.database
        user_id = "anonymous"  # In production, get from auth
        
        # Get basic conversation stats
        conversations = await storage.get_user_conversations(user_id)
        total_sessions = len(conversations)
        
        # Calculate streaks (simplified)
        current_streak = 5  # Mock data for now
        longest_streak = 12
        
        # Average mood (simplified)
        average_mood = 7.2
        
        # Goal completion stats
        goals = await storage.get_user_goals(user_id)
        completed_goals = sum(1 for goal in goals if goal.status == "completed")
        
        # Recent activity
        recent_activity = [
            {
                "type": "chat",
                "description": "Talked with Dr. Sarah about stress management",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                "persona": "sarah"
            },
            {
                "type": "goal",
                "description": "Updated progress on mindfulness practice",
                "timestamp": (datetime.now() - timedelta(days=1)).isoformat(),
                "progress": 75
            },
            {
                "type": "diary",
                "description": "Wrote a reflection about today's challenges",
                "timestamp": (datetime.now() - timedelta(days=2)).isoformat(),
                "mood": "thoughtful"
            }
        ]
        
        # Mood trends (mock data for demo)
        mood_trends = [
            {"date": (datetime.now() - timedelta(days=6)).strftime("%Y-%m-%d"), "mood": 6.5},
            {"date": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"), "mood": 7.0},
            {"date": (datetime.now() - timedelta(days=4)).strftime("%Y-%m-%d"), "mood": 6.8},
            {"date": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"), "mood": 7.5},
            {"date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"), "mood": 7.2},
            {"date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"), "mood": 7.8},
            {"date": datetime.now().strftime("%Y-%m-%d"), "mood": 8.0}
        ]
        
        # Persona usage stats
        persona_usage = [
            {"persona": "sarah", "sessions": 8, "percentage": 40, "lastUsed": "2024-07-18"},
            {"persona": "maya", "sessions": 6, "percentage": 30, "lastUsed": "2024-07-17"},
            {"persona": "alex", "sessions": 4, "percentage": 20, "lastUsed": "2024-07-16"},
            {"persona": "marcus", "sessions": 2, "percentage": 10, "lastUsed": "2024-07-15"}
        ]
        
        return AnalyticsData(
            totalSessions=total_sessions,
            currentStreak=current_streak,
            longestStreak=longest_streak,
            averageMood=average_mood,
            totalGoalsCompleted=completed_goals,
            recentActivity=recent_activity,
            moodTrends=mood_trends,
            personaUsage=persona_usage
        )
        
    except Exception as e:
        print(f"Error in get_analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/sessions")
async def get_session_analytics(request: Request):
    """Get detailed session analytics"""
    try:
        # Return mock session data for now
        return {
            "weeklyStats": {
                "totalMinutes": 145,
                "averageSessionLength": 12,
                "sessionsCompleted": 12,
                "favoritePersona": "sarah"
            },
            "monthlyTrends": [
                {"week": 1, "sessions": 3, "mood": 6.5},
                {"week": 2, "sessions": 4, "mood": 7.0},
                {"week": 3, "sessions": 5, "mood": 7.5},
                {"week": 4, "sessions": 6, "mood": 8.0}
            ]
        }
        
    except Exception as e:
        print(f"Error in get_session_analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/mood-patterns")
async def get_mood_patterns(request: Request):
    """Get mood pattern analysis"""
    try:
        return {
            "dominantEmotions": ["calm", "hopeful", "anxious"],
            "emotionalVolatility": 0.3,
            "positivePatterns": [
                "Morning meditation sessions show 40% mood improvement",
                "Conversations with Maya reduce anxiety by 25%"
            ],
            "recommendedFocus": [
                "Continue mindfulness practices",
                "Explore stress management techniques"
            ]
        }
        
    except Exception as e:
        print(f"Error in get_mood_patterns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))