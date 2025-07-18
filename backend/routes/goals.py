"""
Goals API routes
Handles goal management and tracking
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from db.database import get_db
from db.models import GoalModel
from models.schemas import Goal, GoalCreate, GoalUpdate, GoalStatus
from models.responses import GoalsResponse

router = APIRouter()


@router.get("/goals/{user_id}", response_model=GoalsResponse)
async def get_user_goals(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get all goals for a user"""
    try:
        result = await db.execute(
            select(GoalModel).where(GoalModel.user_id == user_id)
        )
        goals = result.scalars().all()
        
        # Count by status
        total_count = len(goals)
        active_count = len([g for g in goals if g.status == "active"])
        completed_count = len([g for g in goals if g.status == "completed"])
        
        return GoalsResponse(
            goals=[
                Goal(
                    id=g.id,
                    user_id=g.user_id,
                    title=g.title,
                    description=g.description,
                    category=g.category,
                    status=GoalStatus(g.status),
                    progress=g.progress,
                    target_date=g.target_date,
                    created_at=g.created_at,
                    updated_at=g.updated_at
                )
                for g in goals
            ],
            total_count=total_count,
            active_count=active_count,
            completed_count=completed_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch goals: {str(e)}")


@router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate, db: AsyncSession = Depends(get_db)):
    """Create a new goal"""
    try:
        goal = GoalModel(**goal_data.dict())
        db.add(goal)
        await db.commit()
        await db.refresh(goal)
        
        return Goal(
            id=goal.id,
            user_id=goal.user_id,
            title=goal.title,
            description=goal.description,
            category=goal.category,
            status=GoalStatus(goal.status),
            progress=goal.progress,
            target_date=goal.target_date,
            created_at=goal.created_at,
            updated_at=goal.updated_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create goal: {str(e)}")


@router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a goal"""
    try:
        result = await db.execute(
            select(GoalModel).where(GoalModel.id == goal_id)
        )
        goal = result.scalar_one_or_none()
        
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        # Update fields
        for field, value in goal_update.dict(exclude_unset=True).items():
            setattr(goal, field, value)
        
        await db.commit()
        await db.refresh(goal)
        
        return Goal(
            id=goal.id,
            user_id=goal.user_id,
            title=goal.title,
            description=goal.description,
            category=goal.category,
            status=GoalStatus(goal.status),
            progress=goal.progress,
            target_date=goal.target_date,
            created_at=goal.created_at,
            updated_at=goal.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update goal: {str(e)}")


@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a goal"""
    try:
        result = await db.execute(
            select(GoalModel).where(GoalModel.id == goal_id)
        )
        goal = result.scalar_one_or_none()
        
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        await db.delete(goal)
        await db.commit()
        
        return {"message": "Goal deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete goal: {str(e)}")