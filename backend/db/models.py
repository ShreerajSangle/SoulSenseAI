"""
SQLAlchemy models for SoulSense AI
Database table definitions
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class PersonaModel(Base):
    __tablename__ = "personas"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    avatar_url = Column(String, default="")
    color = Column(String, nullable=False)
    
    # Relationships
    conversations = relationship("ConversationModel", back_populates="persona")


class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    name = Column(String, nullable=True)
    pronouns = Column(String, nullable=True)
    mood_tagline = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    preferences = Column(JSON, default=lambda: {})
    goals = Column(JSON, default=lambda: [])
    interests = Column(JSON, default=lambda: [])
    mental_health_focus = Column(JSON, default=lambda: [])
    privacy_settings = Column(JSON, default=lambda: {})
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    conversations = relationship("ConversationModel", back_populates="user")
    diary_entries = relationship("DiaryEntryModel", back_populates="user")
    user_goals = relationship("GoalModel", back_populates="user")


class ConversationModel(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    persona_id = Column(String, ForeignKey("personas.id"), nullable=False)
    title = Column(String, nullable=True)
    conversation_metadata = Column(JSON, default=lambda: {})
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("UserModel", back_populates="conversations")
    persona = relationship("PersonaModel", back_populates="conversations")
    messages = relationship("MessageModel", back_populates="conversation")


class MessageModel(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    content = Column(Text, nullable=False)
    sender = Column(String, nullable=False)  # 'user' or 'ai'
    emotion_detected = Column(String, nullable=True)
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    conversation = relationship("ConversationModel", back_populates="messages")


class DiaryEntryModel(Base):
    __tablename__ = "diary_entries"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    mood = Column(String, nullable=True)
    tags = Column(JSON, default=lambda: [])
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("UserModel", back_populates="diary_entries")


class GoalModel(Base):
    __tablename__ = "user_goals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, default="personal")
    status = Column(String, default="active")  # active, completed, paused
    progress = Column(Integer, default=0)
    target_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("UserModel", back_populates="user_goals")


class TherapySessionModel(Base):
    __tablename__ = "therapy_sessions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    persona_id = Column(String, ForeignKey("personas.id"), nullable=False)
    summary = Column(Text, nullable=True)
    key_topics = Column(JSON, default=lambda: [])
    techniques_used = Column(JSON, default=lambda: [])
    homework = Column(JSON, default=lambda: [])
    mood_before = Column(String, nullable=True)
    mood_after = Column(String, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    message_count = Column(Integer, nullable=True)
    emotion_analysis = Column(JSON, default=lambda: {})
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())


class SessionAnalyticsModel(Base):
    __tablename__ = "session_analytics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    conversation_id = Column(Integer, nullable=True)
    persona_id = Column(String, nullable=True)
    session_duration = Column(Integer, nullable=True)
    message_count = Column(Integer, nullable=True)
    mood_before = Column(String, nullable=True)
    mood_after = Column(String, nullable=True)
    topics_discussed = Column(JSON, default=lambda: [])
    techniques_used = Column(JSON, default=lambda: [])
    emotion_analysis = Column(JSON, default=lambda: {})
    created_at = Column(DateTime, default=func.now())


class UserStreakModel(Base):
    __tablename__ = "user_streaks"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    streak_type = Column(String, default="daily_chat")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class PersonaUsageStatsModel(Base):
    __tablename__ = "persona_usage_stats"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    persona_id = Column(String, ForeignKey("personas.id"), nullable=False)
    session_count = Column(Integer, default=0)
    total_duration = Column(Integer, default=0)
    last_used = Column(DateTime, nullable=True)
    affinity_score = Column(Integer, default=0)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())