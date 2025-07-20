from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime

from models import GoalCreate, GoalResponse
from auth import get_user_id
from storage import Storage
from database import get_db

router = APIRouter()

@router.get("/goals", response_model=List[GoalResponse])
async def get_user_goals(
    req: Request,
    db_session=Depends(get_db)
):
    """Get all goals for the current user"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        goals = await storage.get_user_goals(user_id)
        
        return [
            GoalResponse(
                id=goal.id,
                user_id=goal.user_id,
                title=goal.title,
                description=goal.description,
                category=goal.category,
                status=goal.status,
                target_date=goal.target_date,
                completed_date=goal.completed_date,
                priority=goal.priority,
                progress=goal.progress,
                created_at=goal.created_at,
                updated_at=goal.updated_at
            )
            for goal in goals
        ]
        
    except Exception as e:
        print(f"Error in get_user_goals: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/goals", response_model=GoalResponse)
async def create_goal(
    goal_data: GoalCreate,
    req: Request,
    db_session=Depends(get_db)
):
    """Create a new goal"""
    try:
        user_id = await get_user_id(req)
        storage: Storage = req.app.state.storage
        
        goal = await storage.create_goal(user_id, goal_data)
        
        return GoalResponse(
            id=goal.id,
            user_id=goal.user_id,
            title=goal.title,
            description=goal.description,
            category=goal.category,
            status=goal.status,
            target_date=goal.target_date,
            completed_date=goal.completed_date,
            priority=goal.priority,
            progress=goal.progress,
            created_at=goal.created_at,
            updated_at=goal.updated_at
        )
        
    except Exception as e:
        print(f"Error in create_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/goals/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: int,
    req: Request,
    db_session=Depends(get_db)
):
    """Get specific goal by ID"""
    try:
        storage: Storage = req.app.state.storage
        
        goal = await storage.get_goal(goal_id)
        
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        return GoalResponse(
            id=goal.id,
            user_id=goal.user_id,
            title=goal.title,
            description=goal.description,
            category=goal.category,
            status=goal.status,
            target_date=goal.target_date,
            completed_date=goal.completed_date,
            priority=goal.priority,
            progress=goal.progress,
            created_at=goal.created_at,
            updated_at=goal.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/goals/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    updates: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Update a goal"""
    try:
        storage: Storage = req.app.state.storage
        
        goal = await storage.update_goal(goal_id, updates)
        
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        return GoalResponse(
            id=goal.id,
            user_id=goal.user_id,
            title=goal.title,
            description=goal.description,
            category=goal.category,
            status=goal.status,
            target_date=goal.target_date,
            completed_date=goal.completed_date,
            priority=goal.priority,
            progress=goal.progress,
            created_at=goal.created_at,
            updated_at=goal.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: int,
    req: Request,
    db_session=Depends(get_db)
):
    """Delete a goal"""
    try:
        storage: Storage = req.app.state.storage
        
        success = await storage.delete_goal(goal_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        return {"message": "Goal deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/goals/{goal_id}/complete")
async def complete_goal(
    goal_id: int,
    req: Request,
    db_session=Depends(get_db)
):
    """Mark a goal as completed"""
    try:
        storage: Storage = req.app.state.storage
        
        goal = await storage.update_goal_status(goal_id, "completed", datetime.utcnow())
        
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        return {
            "message": "Goal marked as completed",
            "goal": GoalResponse(
                id=goal.id,
                user_id=goal.user_id,
                title=goal.title,
                description=goal.description,
                category=goal.category,
                status=goal.status,
                target_date=goal.target_date,
                completed_date=goal.completed_date,
                priority=goal.priority,
                progress=goal.progress,
                created_at=goal.created_at,
                updated_at=goal.updated_at
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in complete_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/goals/{goal_id}/progress")
async def update_goal_progress(
    goal_id: int,
    request: Dict[str, Any],
    req: Request,
    db_session=Depends(get_db)
):
    """Update goal progress"""
    try:
        storage: Storage = req.app.state.storage
        
        progress = request.get("progress", 0)
        if not isinstance(progress, int) or progress < 0 or progress > 100:
            raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
        
        updates = {"progress": progress}
        
        # Auto-complete if progress is 100%
        if progress == 100:
            updates["status"] = "completed"
            updates["completed_date"] = datetime.utcnow()
        
        goal = await storage.update_goal(goal_id, updates)
        
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        return {
            "message": "Goal progress updated",
            "goal": GoalResponse(
                id=goal.id,
                user_id=goal.user_id,
                title=goal.title,
                description=goal.description,
                category=goal.category,
                status=goal.status,
                target_date=goal.target_date,
                completed_date=goal.completed_date,
                priority=goal.priority,
                progress=goal.progress,
                created_at=goal.created_at,
                updated_at=goal.updated_at
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_goal_progress: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))