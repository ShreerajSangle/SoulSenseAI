"""
Sessions API routes
Handles therapy session summaries and analytics
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List, Optional

from db.database import get_db
from db.models import TherapySessionModel, SessionAnalyticsModel
from models.schemas import TherapySession, SessionSummary
from models.responses import SessionsResponse

router = APIRouter()


@router.get("/sessions/{user_id}", response_model=SessionsResponse)
async def get_user_sessions(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get therapy sessions for a user"""
    try:
        result = await db.execute(
            select(TherapySessionModel)
            .where(TherapySessionModel.user_id == user_id)
            .order_by(desc(TherapySessionModel.created_at))
            .limit(limit)
            .offset(offset)
        )
        sessions = result.scalars().all()
        
        # Get total count
        count_result = await db.execute(
            select(func.count(TherapySessionModel.id))
            .where(TherapySessionModel.user_id == user_id)
        )
        total_count = count_result.scalar()
        
        return SessionsResponse(
            sessions=[
                TherapySession(
                    id=session.id,
                    conversation_id=session.conversation_id,
                    user_id=session.user_id,
                    persona_id=session.persona_id,
                    summary=session.summary,
                    key_topics=session.key_topics or [],
                    techniques_used=session.techniques_used or [],
                    homework=session.homework or [],
                    mood_before=session.mood_before,
                    mood_after=session.mood_after,
                    duration_minutes=session.duration_minutes,
                    message_count=session.message_count,
                    emotion_analysis=session.emotion_analysis or {},
                    start_time=session.start_time,
                    end_time=session.end_time,
                    created_at=session.created_at
                )
                for session in sessions
            ],
            total_count=total_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")


@router.post("/sessions/summary")
async def create_session_summary(
    summary_data: SessionSummary,
    db: AsyncSession = Depends(get_db)
):
    """Create a session summary"""
    try:
        session = TherapySessionModel(
            conversation_id=summary_data.conversation_id,
            user_id="anonymous",  # Default user
            persona_id="sarah",  # Default persona
            summary=summary_data.summary,
            key_topics=summary_data.key_topics,
            techniques_used=summary_data.techniques_used,
            homework=summary_data.homework,
            mood_before=summary_data.mood_before,
            mood_after=summary_data.mood_after,
            duration_minutes=summary_data.duration_minutes,
            message_count=summary_data.message_count,
            emotion_analysis=summary_data.emotion_analysis
        )
        
        db.add(session)
        await db.commit()
        await db.refresh(session)
        
        return {
            "id": session.id,
            "message": "Session summary created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session summary: {str(e)}")


@router.get("/sessions/{user_id}/analytics")
async def get_session_analytics(
    user_id: str,
    days: int = 30,
    db: AsyncSession = Depends(get_db)
):
    """Get session analytics for a user"""
    try:
        # Get session analytics
        result = await db.execute(
            select(SessionAnalyticsModel)
            .where(SessionAnalyticsModel.user_id == user_id)
            .order_by(desc(SessionAnalyticsModel.created_at))
            .limit(days)
        )
        analytics = result.scalars().all()
        
        # Calculate stats
        total_sessions = len(analytics)
        total_duration = sum(a.session_duration or 0 for a in analytics)
        avg_duration = total_duration / total_sessions if total_sessions > 0 else 0
        
        # Most used persona
        persona_counts = {}
        for a in analytics:
            if a.persona_id:
                persona_counts[a.persona_id] = persona_counts.get(a.persona_id, 0) + 1
        
        most_used_persona = max(persona_counts.items(), key=lambda x: x[1])[0] if persona_counts else None
        
        return {
            "total_sessions": total_sessions,
            "total_duration_minutes": total_duration,
            "average_duration_minutes": round(avg_duration, 1),
            "most_used_persona": most_used_persona,
            "sessions_this_week": len([a for a in analytics if a.created_at]),
            "mood_trends": [
                {
                    "date": a.created_at.date().isoformat(),
                    "mood_before": a.mood_before,
                    "mood_after": a.mood_after
                }
                for a in analytics[:7]  # Last 7 sessions
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")


@router.post("/sessions/analytics")
async def track_session_analytics(
    analytics_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Track session analytics"""
    try:
        analytics = SessionAnalyticsModel(
            user_id=analytics_data.get("user_id", "anonymous"),
            conversation_id=analytics_data.get("conversation_id"),
            persona_id=analytics_data.get("persona_id"),
            session_duration=analytics_data.get("session_duration"),
            message_count=analytics_data.get("message_count"),
            mood_before=analytics_data.get("mood_before"),
            mood_after=analytics_data.get("mood_after"),
            topics_discussed=analytics_data.get("topics_discussed", []),
            techniques_used=analytics_data.get("techniques_used", []),
            emotion_analysis=analytics_data.get("emotion_analysis", {})
        )
        
        db.add(analytics)
        await db.commit()
        
        return {"message": "Analytics tracked successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track analytics: {str(e)}")