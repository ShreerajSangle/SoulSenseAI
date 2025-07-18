"""
Diary API routes
Handles journaling and diary entries
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from db.database import get_db
from db.models import DiaryEntryModel
from models.schemas import DiaryEntry, DiaryEntryCreate, DiaryEntryUpdate
from models.responses import DiaryResponse

router = APIRouter()


@router.get("/diary/{user_id}", response_model=DiaryResponse)
async def get_diary_entries(
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get diary entries for a user"""
    try:
        result = await db.execute(
            select(DiaryEntryModel)
            .where(DiaryEntryModel.user_id == user_id)
            .order_by(desc(DiaryEntryModel.created_at))
            .limit(limit)
            .offset(offset)
        )
        entries = result.scalars().all()
        
        # Get total count
        count_result = await db.execute(
            select(func.count(DiaryEntryModel.id))
            .where(DiaryEntryModel.user_id == user_id)
        )
        total_count = count_result.scalar()
        
        return DiaryResponse(
            entries=[
                DiaryEntry(
                    id=entry.id,
                    user_id=entry.user_id,
                    title=entry.title,
                    content=entry.content,
                    mood=entry.mood,
                    tags=entry.tags or [],
                    is_private=entry.is_private,
                    created_at=entry.created_at,
                    updated_at=entry.updated_at
                )
                for entry in entries
            ],
            total_count=total_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch diary entries: {str(e)}")


@router.post("/diary", response_model=DiaryEntry)
async def create_diary_entry(
    entry_data: DiaryEntryCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new diary entry"""
    try:
        entry = DiaryEntryModel(**entry_data.dict())
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        
        return DiaryEntry(
            id=entry.id,
            user_id=entry.user_id,
            title=entry.title,
            content=entry.content,
            mood=entry.mood,
            tags=entry.tags or [],
            is_private=entry.is_private,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create diary entry: {str(e)}")


@router.put("/diary/{entry_id}", response_model=DiaryEntry)
async def update_diary_entry(
    entry_id: int,
    entry_update: DiaryEntryUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a diary entry"""
    try:
        result = await db.execute(
            select(DiaryEntryModel).where(DiaryEntryModel.id == entry_id)
        )
        entry = result.scalar_one_or_none()
        
        if not entry:
            raise HTTPException(status_code=404, detail="Diary entry not found")
        
        # Update fields
        for field, value in entry_update.dict(exclude_unset=True).items():
            setattr(entry, field, value)
        
        await db.commit()
        await db.refresh(entry)
        
        return DiaryEntry(
            id=entry.id,
            user_id=entry.user_id,
            title=entry.title,
            content=entry.content,
            mood=entry.mood,
            tags=entry.tags or [],
            is_private=entry.is_private,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update diary entry: {str(e)}")


@router.delete("/diary/{entry_id}")
async def delete_diary_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a diary entry"""
    try:
        result = await db.execute(
            select(DiaryEntryModel).where(DiaryEntryModel.id == entry_id)
        )
        entry = result.scalar_one_or_none()
        
        if not entry:
            raise HTTPException(status_code=404, detail="Diary entry not found")
        
        await db.delete(entry)
        await db.commit()
        
        return {"message": "Diary entry deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete diary entry: {str(e)}")


@router.get("/diary/{user_id}/search")
async def search_diary_entries(
    user_id: str,
    query: str,
    db: AsyncSession = Depends(get_db)
):
    """Search diary entries by content"""
    try:
        result = await db.execute(
            select(DiaryEntryModel)
            .where(
                DiaryEntryModel.user_id == user_id,
                DiaryEntryModel.content.contains(query)
            )
            .order_by(desc(DiaryEntryModel.created_at))
            .limit(20)
        )
        entries = result.scalars().all()
        
        return {
            "entries": [
                {
                    "id": entry.id,
                    "title": entry.title,
                    "content": entry.content,
                    "mood": entry.mood,
                    "created_at": entry.created_at.isoformat()
                }
                for entry in entries
            ],
            "query": query,
            "count": len(entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search diary entries: {str(e)}")