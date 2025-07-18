from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime

from models import DiaryEntryCreate, DiaryEntryResponse
from auth import get_user_id
from storage import Storage
from database import get_db

router = APIRouter()

@router.get("/diary", response_model=List[DiaryEntryResponse])
async def get_diary_entries(
    req: Request,
    db_session=Depends(get_db)
):
    """Get all diary entries for the current user"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        entries = await storage.get_diary_entries(user_id)
        
        return [
            DiaryEntryResponse(
                id=entry.id,
                user_id=entry.user_id,
                title=entry.title,
                content=entry.content,
                mood_rating=entry.mood_rating,
                tags=entry.tags,
                persona_id=entry.persona_id,
                is_private=entry.is_private,
                created_at=entry.created_at,
                updated_at=entry.updated_at
            )
            for entry in entries
        ]
        
    except Exception as e:
        print(f"Error in get_diary_entries: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/diary", response_model=DiaryEntryResponse)
async def create_diary_entry(
    entry_data: DiaryEntryCreate,
    req: Request,
    db_session=Depends(get_db)
):
    """Create a new diary entry"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        entry = await storage.create_diary_entry(user_id, entry_data)
        
        return DiaryEntryResponse(
            id=entry.id,
            user_id=entry.user_id,
            title=entry.title,
            content=entry.content,
            mood_rating=entry.mood_rating,
            tags=entry.tags,
            persona_id=entry.persona_id,
            is_private=entry.is_private,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        )
        
    except Exception as e:
        print(f"Error in create_diary_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diary/{entry_id}", response_model=DiaryEntryResponse)
async def get_diary_entry(
    entry_id: int,
    req: Request,
    db_session=Depends(get_db)
):
    """Get specific diary entry by ID"""
    try:
        storage: Storage = req.app.state.storage
        
        # Note: In a real app, you'd verify the entry belongs to the user
        entries = await storage.get_diary_entries(await get_user_id(req))
        entry = next((e for e in entries if e.id == entry_id), None)
        
        if not entry:
            raise HTTPException(status_code=404, detail="Diary entry not found")
        
        return DiaryEntryResponse(
            id=entry.id,
            user_id=entry.user_id,
            title=entry.title,
            content=entry.content,
            mood_rating=entry.mood_rating,
            tags=entry.tags,
            persona_id=entry.persona_id,
            is_private=entry.is_private,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_diary_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/diary/{entry_id}", response_model=DiaryEntryResponse)
async def update_diary_entry(
    entry_id: int,
    updates: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Update a diary entry"""
    try:
        storage: Storage = req.app.state.storage
        
        entry = await storage.update_diary_entry(entry_id, updates)
        
        if not entry:
            raise HTTPException(status_code=404, detail="Diary entry not found")
        
        return DiaryEntryResponse(
            id=entry.id,
            user_id=entry.user_id,
            title=entry.title,
            content=entry.content,
            mood_rating=entry.mood_rating,
            tags=entry.tags,
            persona_id=entry.persona_id,
            is_private=entry.is_private,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_diary_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/diary/{entry_id}")
async def delete_diary_entry(
    entry_id: int,
    req: Request,
    db_session=Depends(get_db)
):
    """Delete a diary entry"""
    try:
        storage: Storage = req.app.state.storage
        
        success = await storage.delete_diary_entry(entry_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Diary entry not found")
        
        return {"message": "Diary entry deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_diary_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diary/tags/popular")
async def get_popular_tags(
    req: Request,
    db_session=Depends(get_db)
):
    """Get popular tags for diary entries"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        entries = await storage.get_diary_entries(user_id)
        
        # Count tag frequency
        tag_counts = {}
        for entry in entries:
            if entry.tags:
                for tag in entry.tags:
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort by frequency and return top 10
        popular_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "tags": [
                {"tag": tag, "count": count}
                for tag, count in popular_tags
            ]
        }
        
    except Exception as e:
        print(f"Error in get_popular_tags: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diary/stats")
async def get_diary_stats(
    req: Request,
    db_session=Depends(get_db)
):
    """Get diary statistics"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        entries = await storage.get_diary_entries(user_id)
        
        if not entries:
            return {
                "total_entries": 0,
                "average_mood": 0,
                "entries_this_month": 0,
                "favorite_persona": None,
                "total_words": 0
            }
        
        # Calculate statistics
        total_entries = len(entries)
        moods = [e.mood_rating for e in entries if e.mood_rating is not None]
        average_mood = sum(moods) / len(moods) if moods else 0
        
        # Entries this month
        current_month = datetime.utcnow().replace(day=1)
        entries_this_month = len([e for e in entries if e.created_at >= current_month])
        
        # Favorite persona
        persona_counts = {}
        for entry in entries:
            if entry.persona_id:
                persona_counts[entry.persona_id] = persona_counts.get(entry.persona_id, 0) + 1
        
        favorite_persona = max(persona_counts, key=persona_counts.get) if persona_counts else None
        
        # Total words
        total_words = sum(len(entry.content.split()) for entry in entries)
        
        return {
            "total_entries": total_entries,
            "average_mood": round(average_mood, 1),
            "entries_this_month": entries_this_month,
            "favorite_persona": favorite_persona,
            "total_words": total_words,
            "writing_streak": 0  # Could implement streak calculation
        }
        
    except Exception as e:
        print(f"Error in get_diary_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))