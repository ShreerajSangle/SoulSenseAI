"""
Pydantic models for SoulSense AI
Data validation and serialization schemas
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class PersonaEnum(str, Enum):
    SARAH = "sarah"
    ALEX = "alex" 
    MARCUS = "marcus"
    MAYA = "maya"


class MessageSender(str, Enum):
    USER = "user"
    AI = "ai"


class GoalStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"


# Base Models
class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# User Models
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    pronouns: Optional[str] = None
    mood_tagline: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    id: str


class UserUpdate(UserBase):
    preferences: Optional[Dict[str, Any]] = {}
    goals: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    mental_health_focus: Optional[List[str]] = []
    privacy_settings: Optional[Dict[str, Any]] = {}


class User(UserBase, TimestampMixin):
    id: str
    preferences: Dict[str, Any] = {}
    goals: List[str] = []
    interests: List[str] = []
    mental_health_focus: List[str] = []
    privacy_settings: Dict[str, Any] = {}


# Persona Models
class PersonaBase(BaseModel):
    name: str
    role: str
    specialty: str
    description: str
    avatar_url: str = ""
    color: str


class Persona(PersonaBase):
    id: str


# Chat Models
class ChatMessage(BaseModel):
    content: str
    persona_id: PersonaEnum


class ChatResponse(BaseModel):
    message: str
    persona_id: str
    emotion_detected: Optional[str] = None
    quick_replies: Optional[List[str]] = []
    suggested_actions: Optional[List[str]] = []


class Message(BaseModel, TimestampMixin):
    id: int
    conversation_id: int
    content: str
    sender: MessageSender
    emotion_detected: Optional[str] = None


class Conversation(BaseModel, TimestampMixin):
    id: int
    user_id: str
    persona_id: str
    title: Optional[str] = None
    metadata: Dict[str, Any] = {}


# Diary Models
class DiaryEntryBase(BaseModel):
    title: Optional[str] = None
    content: str
    mood: Optional[str] = None
    tags: List[str] = []
    is_private: bool = False


class DiaryEntryCreate(DiaryEntryBase):
    user_id: str


class DiaryEntryUpdate(DiaryEntryBase):
    pass


class DiaryEntry(DiaryEntryBase, TimestampMixin):
    id: int
    user_id: str


# Goals Models
class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "personal"
    target_date: Optional[datetime] = None


class GoalCreate(GoalBase):
    user_id: str


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[GoalStatus] = None
    progress: Optional[int] = None
    target_date: Optional[datetime] = None


class Goal(GoalBase, TimestampMixin):
    id: int
    user_id: str
    status: GoalStatus = GoalStatus.ACTIVE
    progress: int = 0


# Session Models
class SessionSummary(BaseModel):
    conversation_id: int
    summary: str
    key_topics: List[str] = []
    techniques_used: List[str] = []
    homework: List[str] = []
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    duration_minutes: Optional[int] = None
    message_count: Optional[int] = None
    emotion_analysis: Dict[str, Any] = {}


class TherapySession(BaseModel, TimestampMixin):
    id: int
    conversation_id: int
    user_id: str
    persona_id: str
    summary: Optional[str] = None
    key_topics: List[str] = []
    techniques_used: List[str] = []
    homework: List[str] = []
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    duration_minutes: Optional[int] = None
    message_count: Optional[int] = None
    emotion_analysis: Dict[str, Any] = {}
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


# Analytics Models
class UserStats(BaseModel):
    total_sessions: int
    current_streak: int
    longest_streak: int
    total_goals: int
    completed_goals: int
    total_diary_entries: int
    favorite_persona: Optional[str] = None
    avg_session_duration: Optional[float] = None


class SessionAnalytics(BaseModel, TimestampMixin):
    id: int
    user_id: str
    conversation_id: Optional[int] = None
    persona_id: Optional[str] = None
    session_duration: Optional[int] = None
    message_count: Optional[int] = None
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    topics_discussed: List[str] = []
    techniques_used: List[str] = []
    emotion_analysis: Dict[str, Any] = {}