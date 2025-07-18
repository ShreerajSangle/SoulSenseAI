"""
Profile API endpoints for SoulSense AI
"""

from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class UserProfile(BaseModel):
    userId: str
    name: str
    email: str
    bio: str
    pronouns: str
    moodTagline: str
    preferences: Dict[str, Any]
    goals: List[str]
    interests: List[str]
    mentalHealthFocus: List[str]
    privacySettings: Dict[str, Any]
    createdAt: str
    updatedAt: str


class UpdateProfileRequest(BaseModel):
    name: str = None
    bio: str = None
    pronouns: str = None
    moodTagline: str = None
    preferences: Dict[str, Any] = None
    goals: List[str] = None
    interests: List[str] = None
    mentalHealthFocus: List[str] = None
    privacySettings: Dict[str, Any] = None


@router.get("/profile", response_model=UserProfile)
async def get_profile(request: Request):
    """Get user profile"""
    try:
        storage = request.app.state.storage
        user_id = "anonymous"  # In production, get from auth
        
        user = await storage.get_user(user_id)
        
        if not user:
            # Create default user profile
            default_user_data = {
                "id": user_id,
                "name": "Anonymous User",
                "email": "",
                "bio": "",
                "pronouns": "",
                "mood_tagline": "Taking it one day at a time",
                "preferences": {
                    "preferredPersona": "sarah",
                    "darkMode": False,
                    "notifications": {
                        "dailyCheckins": True,
                        "sessionReminders": True
                    }
                },
                "goals": ["Practice self-care"],
                "interests": ["Mental wellness"],
                "mental_health_focus": ["Stress management"],
                "privacy_settings": {
                    "shareAnalytics": True,
                    "dataRetention": "1year"
                }
            }
            
            user = await storage.create_or_update_user(default_user_data)
        
        return UserProfile(
            userId=user.id,
            name=user.name or "Anonymous User",
            email=user.email or "",
            bio=user.bio or "",
            pronouns=user.pronouns or "",
            moodTagline=user.mood_tagline or "Taking it one day at a time",
            preferences=user.preferences,
            goals=user.goals,
            interests=user.interests,
            mentalHealthFocus=user.mental_health_focus,
            privacySettings=user.privacy_settings,
            createdAt=user.created_at.isoformat(),
            updatedAt=user.updated_at.isoformat()
        )
        
    except Exception as e:
        print(f"Error in get_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile", response_model=UserProfile)
async def update_profile(profile_data: UpdateProfileRequest, request: Request):
    """Update user profile"""
    try:
        storage = request.app.state.storage
        user_id = "anonymous"  # In production, get from auth
        
        # Get existing user
        existing_user = await storage.get_user(user_id)
        
        # Prepare update data
        update_data = {"id": user_id}
        
        if profile_data.name is not None:
            update_data["name"] = profile_data.name
        if profile_data.bio is not None:
            update_data["bio"] = profile_data.bio
        if profile_data.pronouns is not None:
            update_data["pronouns"] = profile_data.pronouns
        if profile_data.moodTagline is not None:
            update_data["mood_tagline"] = profile_data.moodTagline
        if profile_data.preferences is not None:
            # Merge with existing preferences
            current_prefs = existing_user.preferences if existing_user else {}
            current_prefs.update(profile_data.preferences)
            update_data["preferences"] = current_prefs
        if profile_data.goals is not None:
            update_data["goals"] = profile_data.goals
        if profile_data.interests is not None:
            update_data["interests"] = profile_data.interests
        if profile_data.mentalHealthFocus is not None:
            update_data["mental_health_focus"] = profile_data.mentalHealthFocus
        if profile_data.privacySettings is not None:
            update_data["privacy_settings"] = profile_data.privacySettings
        
        # Update user
        user = await storage.create_or_update_user(update_data)
        
        return UserProfile(
            userId=user.id,
            name=user.name or "Anonymous User",
            email=user.email or "",
            bio=user.bio or "",
            pronouns=user.pronouns or "",
            moodTagline=user.mood_tagline or "Taking it one day at a time",
            preferences=user.preferences,
            goals=user.goals,
            interests=user.interests,
            mentalHealthFocus=user.mental_health_focus,
            privacySettings=user.privacy_settings,
            createdAt=user.created_at.isoformat(),
            updatedAt=user.updated_at.isoformat()
        )
        
    except Exception as e:
        print(f"Error in update_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))