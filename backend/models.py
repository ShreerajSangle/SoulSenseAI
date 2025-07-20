from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from database import Base

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    pronouns: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mood_tagline: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    profile_image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferences: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    goals: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    interests: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    mental_health_focus: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    privacy_settings: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    conversations: Mapped[List["Conversation"]] = relationship("Conversation", back_populates="user")
    memories: Mapped[List["UserMemory"]] = relationship("UserMemory", back_populates="user")
    mood_entries: Mapped[List["MoodEntry"]] = relationship("MoodEntry", back_populates="user")
    diary_entries: Mapped[List["DiaryEntry"]] = relationship("DiaryEntry", back_populates="user")
    goals_rel: Mapped[List["Goal"]] = relationship("Goal", back_populates="user")

class Persona(Base):
    __tablename__ = "personas"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    specialty: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    avatar_url: Mapped[str] = mapped_column(String, nullable=False)
    color: Mapped[str] = mapped_column(String, nullable=False)
    
    # Relationships
    conversations: Mapped[List["Conversation"]] = relationship("Conversation", back_populates="persona")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    persona_id: Mapped[str] = mapped_column(String, ForeignKey("personas.id"), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="conversations")
    persona: Mapped["Persona"] = relationship("Persona", back_populates="conversations")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="conversation")
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(Integer, ForeignKey("conversations.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sender: Mapped[str] = mapped_column(String, nullable=False)  # 'user' or 'ai'
    emotion_detected: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    
    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")

class Session(Base):
    __tablename__ = "therapy_sessions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(Integer, ForeignKey("conversations.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    persona_id: Mapped[str] = mapped_column(String, ForeignKey("personas.id"), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    key_topics: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    techniques_used: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    homework: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    mood_before: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mood_after: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="sessions")

class UserMemory(Base):
    __tablename__ = "user_memories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    memory_metadata: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    persona_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    conversation_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="memories")

class MoodEntry(Base):
    __tablename__ = "mood_entries"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    mood_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    energy_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    stress_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String, default="general")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mood_entries")

class DiaryEntry(Base):
    __tablename__ = "diary_entries"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    mood_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    persona_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="diary_entries")

class Goal(Base):
    __tablename__ = "goals"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="active")
    target_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    priority: Mapped[str] = mapped_column(String, default="medium")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="goals_rel")

class SessionAnalytic(Base):
    __tablename__ = "session_analytics"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    session_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    conversation_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    persona_id: Mapped[str] = mapped_column(String, nullable=False)
    session_type: Mapped[str] = mapped_column(String, default="chat")
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    mood_before: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mood_after: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    emotion_analysis: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    techniques_used: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    crisis_indicators: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    satisfaction_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

# Pydantic Models for API
class UserCreate(BaseModel):
    id: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    pronouns: Optional[str] = None
    mood_tagline: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[Dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PersonaResponse(BaseModel):
    id: str
    name: str
    role: str
    specialty: str
    description: str
    avatar_url: str
    color: str
    
    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    user_id: str
    persona_id: str
    title: Optional[str] = None

class ConversationResponse(BaseModel):
    id: int
    user_id: str
    persona_id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    persona: Optional[PersonaResponse] = None
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    conversation_id: int
    content: str
    sender: str
    emotion_detected: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    content: str
    sender: str
    emotion_detected: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    persona_id: str
    conversation_id: Optional[int] = None
    user_id: str = "anonymous"
    is_first_message: bool = False
    user_mood: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    persona_id: str
    conversation_id: int
    quick_replies: Optional[List[str]] = None
    emotion_detected: Optional[str] = None
    suggestions: Optional[List[str]] = None

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    target_date: Optional[datetime] = None
    priority: str = "medium"

class GoalResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str] = None
    category: str
    status: str
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    priority: str
    progress: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class MoodEntryCreate(BaseModel):
    mood_rating: int = Field(..., ge=1, le=5)
    energy_level: Optional[int] = Field(None, ge=1, le=5)
    stress_level: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None
    type: str = "general"

class MoodEntryResponse(BaseModel):
    id: int
    user_id: str
    mood_rating: int
    energy_level: Optional[int] = None
    stress_level: Optional[int] = None
    notes: Optional[str] = None
    type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class DiaryEntryCreate(BaseModel):
    title: str
    content: str
    mood_rating: Optional[int] = Field(None, ge=1, le=5)
    tags: Optional[List[str]] = None
    persona_id: Optional[str] = None
    is_private: bool = False

class DiaryEntryResponse(BaseModel):
    id: int
    user_id: str
    title: str
    content: str
    mood_rating: Optional[int] = None
    tags: Optional[List[str]] = None
    persona_id: Optional[str] = None
    is_private: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True