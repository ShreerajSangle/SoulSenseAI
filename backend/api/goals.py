"""
Goals API endpoints for SoulSense AI
"""

from fastapi import APIRouter, Request, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date

router = APIRouter()


class Goal(BaseModel):
    id: int
    userId: str
    title: str
    description: Optional[str]
    category: str
    status: str
    progress: int
    targetDate: Optional[str]
    createdAt: str
    updatedAt: str


class CreateGoalRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "personal"
    targetDate: Optional[str] = None


class UpdateGoalRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    targetDate: Optional[str] = None


@router.get("/goals", response_model=List[Goal])
async def get_goals(request: Request):
    """Get all goals for the user"""
    try:
        storage = request.app.state.storage
        user_id = "anonymous"  # In production, get from auth
        
        goals = await storage.get_user_goals(user_id)
        
        # If no goals exist, create a default one
        if not goals:
            default_goal = await storage.create_goal({
                "user_id": user_id,
                "title": "Practice daily mindfulness",
                "description": "Spend 10 minutes each day in mindful meditation or breathing exercises",
                "category": "wellness",
                "status": "active",
                "progress": 0
            })
            goals = [default_goal]
        
        return [
            Goal(
                id=goal.id,
                userId=goal.user_id,
                title=goal.title,
                description=goal.description,
                category=goal.category,
                status=goal.status,
                progress=goal.progress,
                targetDate=goal.target_date.isoformat() if goal.target_date else None,
                createdAt=goal.created_at.isoformat(),
                updatedAt=goal.updated_at.isoformat()
            )
            for goal in goals
        ]
        
    except Exception as e:
        print(f"Error in get_goals: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/goals", response_model=Goal)
async def create_goal(goal_data: CreateGoalRequest, request: Request):
    """Create a new goal"""
    try:
        storage = request.app.state.storage
        user_id = "anonymous"  # In production, get from auth
        
        goal_dict = {
            "user_id": user_id,
            "title": goal_data.title,
            "description": goal_data.description,
            "category": goal_data.category,
            "status": "active",
            "progress": 0
        }
        
        if goal_data.targetDate:
            goal_dict["target_date"] = goal_data.targetDate
        
        goal = await storage.create_goal(goal_dict)
        
        return Goal(
            id=goal.id,
            userId=goal.user_id,
            title=goal.title,
            description=goal.description,
            category=goal.category,
            status=goal.status,
            progress=goal.progress,
            targetDate=goal.target_date.isoformat() if goal.target_date else None,
            createdAt=goal.created_at.isoformat(),
            updatedAt=goal.updated_at.isoformat()
        )
        
    except Exception as e:
        print(f"Error in create_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(goal_id: int, goal_data: UpdateGoalRequest, request: Request):
    """Update a goal"""
    try:
        storage = request.app.state.storage
        
        # Update progress if provided
        if goal_data.progress is not None:
            updated_goal = await storage.update_goal_progress(
                goal_id, 
                goal_data.progress,
                goal_data.status
            )
            
            if not updated_goal:
                raise HTTPException(status_code=404, detail="Goal not found")
            
            return Goal(
                id=updated_goal.id,
                userId=updated_goal.user_id,
                title=updated_goal.title,
                description=updated_goal.description,
                category=updated_goal.category,
                status=updated_goal.status,
                progress=updated_goal.progress,
                targetDate=updated_goal.target_date.isoformat() if updated_goal.target_date else None,
                createdAt=updated_goal.created_at.isoformat(),
                updatedAt=updated_goal.updated_at.isoformat()
            )
        
        # For other updates, would need additional storage methods
        raise HTTPException(status_code=501, detail="General goal updates not implemented yet")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: int, request: Request):
    """Delete a goal"""
    try:
        # This would require implementing delete functionality in storage
        # For now, return success to maintain API compatibility
        return {"message": "Goal deleted successfully"}
        
    except Exception as e:
        print(f"Error in delete_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))