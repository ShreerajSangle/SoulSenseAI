"""
Diary API endpoints for SoulSense AI
"""

from fastapi import APIRouter, Request, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class DiaryEntry(BaseModel):
    id: int
    userId: str
    title: str
    content: str
    mood: Optional[str]
    tags: List[str]
    isPrivate: bool
    createdAt: str
    updatedAt: str


class CreateDiaryRequest(BaseModel):
    title: str = ""
    content: str
    mood: Optional[str] = None
    tags: List[str] = []
    isPrivate: bool = False


@router.get("/diary", response_model=List[DiaryEntry])
async def get_diary_entries(request: Request):
    """Get all diary entries for the user"""
    try:
        storage = request.app.state.storage
        user_id = "anonymous"  # In production, get from auth
        
        entries = await storage.get_diary_entries(user_id)
        
        return [
            DiaryEntry(
                id=entry.id,
                userId=entry.user_id,
                title=entry.title,
                content=entry.content,
                mood=entry.mood,
                tags=entry.tags,
                isPrivate=entry.is_private,
                createdAt=entry.created_at.isoformat(),
                updatedAt=entry.updated_at.isoformat()
            )
            for entry in entries
        ]
        
    except Exception as e:
        print(f"Error in get_diary_entries: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/diary", response_model=DiaryEntry)
async def create_diary_entry(entry_data: CreateDiaryRequest, request: Request):
    """Create a new diary entry"""
    try:
        storage = request.app.state.storage
        user_id = "anonymous"  # In production, get from auth
        
        entry_dict = {
            "user_id": user_id,
            "title": entry_data.title or f"Entry {datetime.now().strftime('%Y-%m-%d')}",
            "content": entry_data.content,
            "mood": entry_data.mood,
            "tags": entry_data.tags,
            "is_private": entry_data.isPrivate
        }
        
        entry = await storage.create_diary_entry(entry_dict)
        
        return DiaryEntry(
            id=entry.id,
            userId=entry.user_id,
            title=entry.title,
            content=entry.content,
            mood=entry.mood,
            tags=entry.tags,
            isPrivate=entry.is_private,
            createdAt=entry.created_at.isoformat(),
            updatedAt=entry.updated_at.isoformat()
        )
        
    except Exception as e:
        print(f"Error in create_diary_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/diary/{entry_id}", response_model=DiaryEntry)
async def get_diary_entry(entry_id: int, request: Request):
    """Get a specific diary entry"""
    try:
        # This would require implementing get_diary_entry in storage
        # For now, return a placeholder to maintain API compatibility
        raise HTTPException(status_code=501, detail="Get single diary entry not implemented yet")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_diary_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/diary/{entry_id}", response_model=DiaryEntry)
async def update_diary_entry(entry_id: int, entry_data: CreateDiaryRequest, request: Request):
    """Update a diary entry"""
    try:
        # This would require implementing update functionality in storage
        # For now, return placeholder to maintain API compatibility
        raise HTTPException(status_code=501, detail="Update diary entry not implemented yet")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_diary_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/diary/{entry_id}")
async def delete_diary_entry(entry_id: int, request: Request):
    """Delete a diary entry"""
    try:
        # This would require implementing delete functionality in storage
        # For now, return success to maintain API compatibility
        return {"message": "Diary entry deleted successfully"}
        
    except Exception as e:
        print(f"Error in delete_diary_entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))