from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime

from auth import get_user_id
from storage import Storage
from database import get_db

router = APIRouter()

@router.get("/breathing/exercises")
async def get_breathing_exercises(
    req: Request,
    db_session=Depends(get_db)
):
    """Get available breathing exercises"""
    try:
        exercises = [
            {
                "id": "box_breathing",
                "name": "Box Breathing",
                "description": "4-4-4-4 breathing pattern for stress relief",
                "duration": 300,  # 5 minutes
                "pattern": {
                    "inhale": 4,
                    "hold_in": 4,
                    "exhale": 4,
                    "hold_out": 4
                },
                "instructions": "Inhale for 4 counts, hold for 4, exhale for 4, hold for 4",
                "difficulty": "beginner",
                "benefits": ["stress relief", "focus", "anxiety reduction"]
            },
            {
                "id": "calm_breathing",
                "name": "Calm Breathing",
                "description": "4-7-8 breathing for deep relaxation",
                "duration": 240,  # 4 minutes
                "pattern": {
                    "inhale": 4,
                    "hold_in": 7,
                    "exhale": 8,
                    "hold_out": 0
                },
                "instructions": "Inhale for 4, hold for 7, exhale slowly for 8",
                "difficulty": "intermediate",
                "benefits": ["deep relaxation", "sleep aid", "anxiety relief"]
            },
            {
                "id": "energizing_breath",
                "name": "Energizing Breath",
                "description": "Quick energizing breath pattern",
                "duration": 180,  # 3 minutes
                "pattern": {
                    "inhale": 3,
                    "hold_in": 1,
                    "exhale": 3,
                    "hold_out": 1
                },
                "instructions": "Quick inhale for 3, brief hold, quick exhale for 3",
                "difficulty": "beginner",
                "benefits": ["energy boost", "alertness", "morning activation"]
            },
            {
                "id": "coherent_breathing",
                "name": "Coherent Breathing",
                "description": "5-5 breathing for balance and coherence",
                "duration": 600,  # 10 minutes
                "pattern": {
                    "inhale": 5,
                    "hold_in": 0,
                    "exhale": 5,
                    "hold_out": 0
                },
                "instructions": "Smooth inhale for 5, smooth exhale for 5",
                "difficulty": "beginner",
                "benefits": ["balance", "heart rate variability", "emotional regulation"]
            }
        ]
        
        return {
            "exercises": exercises,
            "total": len(exercises)
        }
        
    except Exception as e:
        print(f"Error in get_breathing_exercises: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/breathing/exercises/{exercise_id}")
async def get_breathing_exercise(
    exercise_id: str,
    req: Request,
    db_session=Depends(get_db)
):
    """Get specific breathing exercise"""
    try:
        # Get all exercises and find the requested one
        exercises_response = await get_breathing_exercises(req, db_session)
        exercises = exercises_response["exercises"]
        
        exercise = next((e for e in exercises if e["id"] == exercise_id), None)
        
        if not exercise:
            raise HTTPException(status_code=404, detail="Breathing exercise not found")
        
        return exercise
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_breathing_exercise: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/breathing/sessions")
async def create_breathing_session(
    request: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Create a breathing session record"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Create breathing session record
        session_data = {
            "user_id": user_id,
            "type": "breathing",
            "content": request.get("exercise_id", "box_breathing"),
            "metadata": {
                "exercise_id": request.get("exercise_id"),
                "duration_seconds": request.get("duration_seconds", 300),
                "completed": request.get("completed", False),
                "satisfaction_rating": request.get("satisfaction_rating")
            }
        }
        
        # Save as user memory
        memory = await storage.save_user_memory(user_id, session_data)
        
        # Also create session analytics
        await storage.create_session_analytic(
            user_id=user_id,
            analytic_data={
                "session_type": "breathing",
                "persona_id": "maya",  # Maya handles breathing
                "duration_minutes": request.get("duration_seconds", 300) // 60,
                "techniques_used": [request.get("exercise_id", "box_breathing")],
                "satisfaction_rating": request.get("satisfaction_rating")
            }
        )
        
        return {
            "success": True,
            "session_id": memory.id,
            "message": "Breathing session recorded successfully"
        }
        
    except Exception as e:
        print(f"Error in create_breathing_session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/breathing/sessions")
async def get_breathing_sessions(
    req: Request,
    limit: int = 20,
    db_session=Depends(get_db)
):
    """Get user's breathing sessions"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get user memories related to breathing
        memories = await storage.get_user_memories(user_id)
        breathing_sessions = [m for m in memories if m.type == "breathing"]
        
        # Format for frontend
        sessions = []
        for session in breathing_sessions[:limit]:
            metadata = session.metadata or {}
            sessions.append({
                "id": session.id,
                "exercise_id": metadata.get("exercise_id", "unknown"),
                "duration_seconds": metadata.get("duration_seconds", 0),
                "completed": metadata.get("completed", False),
                "satisfaction_rating": metadata.get("satisfaction_rating"),
                "created_at": session.created_at.isoformat()
            })
        
        return {
            "sessions": sessions,
            "total": len(breathing_sessions)
        }
        
    except Exception as e:
        print(f"Error in get_breathing_sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/breathing/stats")
async def get_breathing_stats(
    req: Request,
    db_session=Depends(get_db)
):
    """Get breathing exercise statistics"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        # Get breathing sessions
        memories = await storage.get_user_memories(user_id)
        breathing_sessions = [m for m in memories if m.type == "breathing"]
        
        if not breathing_sessions:
            return {
                "total_sessions": 0,
                "total_minutes": 0,
                "average_duration": 0,
                "completion_rate": 0,
                "favorite_exercise": None,
                "streak": 0
            }
        
        # Calculate statistics
        total_sessions = len(breathing_sessions)
        total_seconds = sum(
            (session.metadata or {}).get("duration_seconds", 0)
            for session in breathing_sessions
        )
        total_minutes = total_seconds // 60
        
        average_duration = total_seconds / total_sessions if total_sessions > 0 else 0
        
        # Completion rate
        completed_sessions = sum(
            1 for session in breathing_sessions
            if (session.metadata or {}).get("completed", False)
        )
        completion_rate = (completed_sessions / total_sessions) * 100 if total_sessions > 0 else 0
        
        # Favorite exercise
        exercise_counts = {}
        for session in breathing_sessions:
            exercise_id = (session.metadata or {}).get("exercise_id", "unknown")
            exercise_counts[exercise_id] = exercise_counts.get(exercise_id, 0) + 1
        
        favorite_exercise = max(exercise_counts, key=exercise_counts.get) if exercise_counts else None
        
        # Simple streak calculation (sessions in last 7 days)
        recent_sessions = [
            s for s in breathing_sessions
            if (datetime.utcnow() - s.created_at).days <= 7
        ]
        streak = len(recent_sessions)
        
        return {
            "total_sessions": total_sessions,
            "total_minutes": total_minutes,
            "average_duration": round(average_duration, 1),
            "completion_rate": round(completion_rate, 1),
            "favorite_exercise": favorite_exercise,
            "streak": streak,
            "exercise_breakdown": [
                {"exercise_id": exercise_id, "count": count}
                for exercise_id, count in exercise_counts.items()
            ]
        }
        
    except Exception as e:
        print(f"Error in get_breathing_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/breathing/guided-session")
async def start_guided_breathing_session(
    request: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Start a guided breathing session with Maya"""
    try:
        user_id = await get_user_id(req)
        exercise_id = request.get("exercise_id", "box_breathing")
        
        # Get exercise details
        exercises_response = await get_breathing_exercises(req, db_session)
        exercises = exercises_response["exercises"]
        exercise = next((e for e in exercises if e["id"] == exercise_id), None)
        
        if not exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")
        
        # Maya's guided instructions
        guided_instructions = {
            "box_breathing": "Let's begin with Box Breathing. Find a comfortable position and close your eyes. We'll breathe together in a square pattern - inhale, hold, exhale, hold. Each side of our breathing square is 4 counts.",
            "calm_breathing": "Welcome to the 4-7-8 breathing technique. This is deeply relaxing. Sit comfortably and prepare to breathe slowly and mindfully. Inhale through your nose for 4, hold for 7, then exhale completely through your mouth for 8.",
            "energizing_breath": "Time to energize! This quick breathing pattern will help awaken your body and mind. Sit tall and breathe with purpose - quick, clean breaths to activate your energy.",
            "coherent_breathing": "Let's practice Coherent Breathing - the rhythm of the heart. This gentle 5-5 pattern will bring balance to your nervous system. Breathe smoothly and naturally."
        }
        
        return {
            "exercise": exercise,
            "guided_intro": guided_instructions.get(exercise_id, "Let's begin this breathing exercise together."),
            "session_id": f"guided_{exercise_id}_{datetime.utcnow().timestamp()}",
            "maya_message": f"I'm here to guide you through {exercise['name']}. {guided_instructions.get(exercise_id, '')} Ready when you are. 🌸"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in start_guided_breathing_session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))