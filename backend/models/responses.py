"""
Response models for SoulSense AI API
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from .schemas import Persona, User, Goal, DiaryEntry, TherapySession, UserStats


class HealthResponse(BaseModel):
    status: str
    message: str
    version: str


class PersonasResponse(BaseModel):
    personas: List[Persona]


class UserProfileResponse(BaseModel):
    user: User
    stats: Optional[UserStats] = None


class GoalsResponse(BaseModel):
    goals: List[Goal]
    total_count: int
    active_count: int
    completed_count: int


class DiaryResponse(BaseModel):
    entries: List[DiaryEntry]
    total_count: int


class SessionsResponse(BaseModel):
    sessions: List[TherapySession]
    total_count: int


class ChatHistoryResponse(BaseModel):
    conversations: List[Dict[str, Any]]
    total_count: int


class AnalyticsResponse(BaseModel):
    user_stats: UserStats
    recent_sessions: List[TherapySession]
    mood_trends: List[Dict[str, Any]]
    goal_progress: List[Dict[str, Any]]