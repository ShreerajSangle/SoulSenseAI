"""
User API routes
Handles user profile and authentication
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from db.database import get_db
from db.models import UserModel
from models.schemas import User, UserCreate, UserUpdate
from models.responses import UserProfileResponse

router = APIRouter()


@router.get("/profile/{user_id}", response_model=User)
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user profile"""
    try:
        result = await db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Create anonymous user if not exists
            user = UserModel(
                id=user_id,
                name="Anonymous User",
                email="",
                first_name="Anonymous",
                last_name="User"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        return User(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            name=user.name,
            pronouns=user.pronouns,
            mood_tagline=user.mood_tagline,
            profile_image_url=user.profile_image_url,
            bio=user.bio,
            preferences=user.preferences or {},
            goals=user.goals or [],
            interests=user.interests or [],
            mental_health_focus=user.mental_health_focus or [],
            privacy_settings=user.privacy_settings or {},
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user profile: {str(e)}")


@router.put("/profile/{user_id}", response_model=User)
async def update_user_profile(
    user_id: str,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    try:
        result = await db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        return User(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            name=user.name,
            pronouns=user.pronouns,
            mood_tagline=user.mood_tagline,
            profile_image_url=user.profile_image_url,
            bio=user.bio,
            preferences=user.preferences or {},
            goals=user.goals or [],
            interests=user.interests or [],
            mental_health_focus=user.mental_health_focus or [],
            privacy_settings=user.privacy_settings or {},
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user profile: {str(e)}")


@router.post("/users", response_model=User)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create new user"""
    try:
        # Check if user already exists
        result = await db.execute(
            select(UserModel).where(UserModel.id == user_data.id)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user
        user = UserModel(**user_data.dict())
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return User(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            name=user.name,
            pronouns=user.pronouns,
            mood_tagline=user.mood_tagline,
            profile_image_url=user.profile_image_url,
            bio=user.bio,
            preferences=user.preferences or {},
            goals=user.goals or [],
            interests=user.interests or [],
            mental_health_focus=user.mental_health_focus or [],
            privacy_settings=user.privacy_settings or {},
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")