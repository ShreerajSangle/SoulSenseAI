"""
SoulSense AI - Pydantic Models and Schemas
Data validation and serialization for API endpoints
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

class PersonaType(str, Enum):
    MAYA = "maya"
    SARAH = "sarah"
    ALEX = "alex"
    MARCUS = "marcus"

class EmotionType(str, Enum):
    HAPPY = "happy"
    SAD = "sad"
    ANXIOUS = "anxious"
    CALM = "calm"
    EXCITED = "excited"
    FRUSTRATED = "frustrated"
    HOPEFUL = "hopeful"
    OVERWHELMED = "overwhelmed"
    GRATEFUL = "grateful"
    ANGRY = "angry"
    PEACEFUL = "peaceful"
    MOTIVATED = "motivated"

class PersonaConfig(BaseModel):
    """Persona configuration model"""
    id: PersonaType
    name: str
    role: str
    emoji: str
    features: List[str]
    memory_rules: List[str]
    ui_style: Dict[str, str]
    specializations: List[str]
    personality_traits: Dict[str, float]
    
    class Config:
        schema_extra = {
            "example": {
                "id": "maya",
                "name": "Maya",
                "role": "Spiritual Guide & Breathwork Mentor",
                "emoji": "🪷",
                "features": ["yoga_flow_generator", "pranayama_guide", "chakra_scanner"],
                "memory_rules": ["spiritual_practices", "emotional_patterns"],
                "ui_style": {"bubble_color": "#e8d5f0", "response_length": "flowing_paragraphs"},
                "specializations": ["breathwork", "meditation", "spiritual_guidance"],
                "personality_traits": {"warmth": 0.9, "empathy": 0.95, "spirituality": 1.0}
            }
        }

class EmotionalContext(BaseModel):
    """Emotional analysis context"""
    primary_emotion: EmotionType
    secondary_emotions: List[EmotionType] = []
    intensity: float = Field(ge=0.0, le=1.0)
    valence: float = Field(ge=-1.0, le=1.0)  # negative to positive
    arousal: float = Field(ge=0.0, le=1.0)   # calm to excited
    confidence: float = Field(ge=0.0, le=1.0)
    emotional_triggers: List[str] = []
    support_needs: List[str] = []
    crisis_indicators: List[str] = []
    
    class Config:
        schema_extra = {
            "example": {
                "primary_emotion": "anxious",
                "secondary_emotions": ["overwhelmed"],
                "intensity": 0.7,
                "valence": -0.3,
                "arousal": 0.8,
                "confidence": 0.85,
                "emotional_triggers": ["work_stress", "time_pressure"],
                "support_needs": ["grounding_techniques", "reassurance"],
                "crisis_indicators": []
            }
        }

class ChatMessage(BaseModel):
    """Chat message input model"""
    content: str = Field(min_length=1, max_length=2000)
    conversation_history: Optional[List[Dict[str, str]]] = []
    session_id: Optional[str] = None
    user_id: Optional[str] = "anonymous"
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        schema_extra = {
            "example": {
                "content": "I'm feeling really anxious about work today",
                "conversation_history": [
                    {"role": "user", "content": "Hello"},
                    {"role": "assistant", "content": "Hello! How are you feeling today?"}
                ],
                "session_id": "sess_12345",
                "user_id": "user_67890"
            }
        }

class ChatResponse(BaseModel):
    """Chat response output model"""
    content: str
    persona_id: PersonaType
    emotion: EmotionType
    confidence: float
    features_activated: List[str]
    persona_config: PersonaConfig
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    suggestions: Optional[List[str]] = []
    quick_replies: List[Dict[str, Any]] = []
    
    class Config:
        schema_extra = {
            "example": {
                "content": "I can sense that work is weighing heavily on you right now. Let's take a moment to breathe together.",
                "persona_id": "maya",
                "emotion": "anxious",
                "confidence": 0.85,
                "features_activated": ["pranayama_guide", "emotional_grounding"],
                "suggestions": ["Try box breathing", "Take a mindful walk"]
            }
        }

class BreathingSession(BaseModel):
    """Breathing exercise session model"""
    technique: str = Field(..., description="Breathing technique used")
    duration: int = Field(gt=0, description="Duration in seconds")
    rounds_completed: int = Field(ge=0)
    persona_id: PersonaType
    user_notes: Optional[str] = None
    effectiveness_rating: Optional[int] = Field(ge=1, le=5)
    
    class Config:
        schema_extra = {
            "example": {
                "technique": "box_breathing",
                "duration": 300,
                "rounds_completed": 5,
                "persona_id": "maya",
                "user_notes": "Felt very calming",
                "effectiveness_rating": 4
            }
        }

class JournalEntry(BaseModel):
    """Journal entry model"""
    title: Optional[str] = None
    content: str = Field(min_length=1, max_length=5000)
    mood: EmotionType
    persona_id: PersonaType
    tags: List[str] = []
    is_private: bool = True
    reflection_prompts: Optional[List[str]] = []
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Reflecting on today's challenges",
                "content": "Today was difficult but I learned something important about myself...",
                "mood": "hopeful",
                "persona_id": "sarah",
                "tags": ["self_reflection", "growth"],
                "is_private": True,
                "reflection_prompts": ["What did I learn about myself today?"]
            }
        }

class Goal(BaseModel):
    """Wellness goal model"""
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=1000)
    category: str  # wellness, emotional, spiritual, physical
    persona_id: PersonaType
    target_date: Optional[datetime] = None
    action_steps: List[str] = []
    progress_percentage: float = Field(ge=0.0, le=100.0, default=0.0)
    is_completed: bool = False
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Practice daily meditation",
                "description": "Establish a consistent 10-minute daily meditation practice",
                "category": "spiritual",
                "persona_id": "maya",
                "target_date": "2025-02-15T00:00:00Z",
                "action_steps": ["Set daily reminder", "Choose quiet space", "Start with 5 minutes"],
                "progress_percentage": 25.0,
                "is_completed": False
            }
        }

class UserProfile(BaseModel):
    """User profile model"""
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    preferred_persona: PersonaType = PersonaType.SARAH
    bio: Optional[str] = None
    goals: List[str] = []
    interests: List[str] = []
    mental_health_focus: List[str] = []
    preferences: Dict[str, Any] = {}
    privacy_settings: Dict[str, Any] = {}
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user_12345",
                "name": "Alex Johnson",
                "email": "alex@example.com",
                "preferred_persona": "maya",
                "bio": "Seeking inner peace and emotional balance",
                "goals": ["reduce_anxiety", "improve_sleep"],
                "interests": ["meditation", "yoga", "journaling"],
                "mental_health_focus": ["anxiety", "stress_management"],
                "preferences": {
                    "voice_enabled": False,
                    "dark_mode": False,
                    "notifications": True
                },
                "privacy_settings": {
                    "share_analytics": True,
                    "data_retention": "1year"
                }
            }
        }

class SessionData(BaseModel):
    """Session tracking model"""
    session_id: str
    user_id: str
    persona_id: PersonaType
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    message_count: int = 0
    emotions_tracked: List[EmotionType] = []
    features_used: List[str] = []
    session_summary: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "session_id": "sess_67890",
                "user_id": "user_12345",
                "persona_id": "sarah",
                "start_time": "2025-01-15T14:30:00Z",
                "end_time": "2025-01-15T15:00:00Z",
                "duration_minutes": 30,
                "message_count": 12,
                "emotions_tracked": ["anxious", "calm", "hopeful"],
                "features_used": ["cbt_techniques", "emotional_processing"],
                "session_summary": "Productive session focusing on anxiety management"
            }
        }

class AnalyticsData(BaseModel):
    """User analytics and insights model"""
    user_id: str
    total_sessions: int
    total_duration_minutes: int
    favorite_persona: PersonaType
    most_common_emotion: EmotionType
    mood_trends: Dict[str, float]
    goal_completion_rate: float
    streak_current: int
    streak_longest: int
    personas_usage: Dict[PersonaType, int]
    breathing_sessions: int
    journal_entries: int
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user_12345",
                "total_sessions": 45,
                "total_duration_minutes": 1200,
                "favorite_persona": "maya",
                "most_common_emotion": "calm",
                "mood_trends": {
                    "anxious": 0.3,
                    "calm": 0.5,
                    "hopeful": 0.2
                },
                "goal_completion_rate": 0.75,
                "streak_current": 7,
                "streak_longest": 14,
                "personas_usage": {
                    "maya": 20,
                    "sarah": 15,
                    "alex": 5,
                    "marcus": 5
                },
                "breathing_sessions": 30,
                "journal_entries": 18
            }
        }