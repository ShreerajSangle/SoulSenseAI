"""
Storage layer for SoulSense AI
Handles data persistence and retrieval operations
"""

import json
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from dataclasses import dataclass

from core.database import Database


@dataclass
class Persona:
    id: str
    name: str
    role: str
    specialty: str
    description: str
    avatar_url: str
    color: str


@dataclass
class Conversation:
    id: int
    user_id: str
    persona_id: str
    title: str
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    persona: Optional[Persona] = None


@dataclass
class Message:
    id: int
    conversation_id: int
    content: str
    sender: str
    emotion_detected: Optional[str]
    timestamp: datetime


@dataclass
class DiaryEntry:
    id: int
    user_id: str
    title: str
    content: str
    mood: Optional[str]
    tags: List[str]
    is_private: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class UserGoal:
    id: int
    user_id: str
    title: str
    description: Optional[str]
    category: str
    status: str
    progress: int
    target_date: Optional[date]
    created_at: datetime
    updated_at: datetime


@dataclass
class User:
    id: str
    email: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    name: Optional[str]
    pronouns: Optional[str]
    mood_tagline: Optional[str]
    profile_image_url: Optional[str]
    bio: Optional[str]
    preferences: Dict[str, Any]
    goals: List[str]
    interests: List[str]
    mental_health_focus: List[str]
    privacy_settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class Storage:
    """Main storage interface for SoulSense AI"""
    
    def __init__(self, database: Database):
        self.db = database
    
    # Persona operations
    async def create_persona(self, persona_data: Dict[str, str]) -> Persona:
        """Create a new persona"""
        await self.db.execute(
            """INSERT OR REPLACE INTO personas 
               (id, name, role, specialty, description, avatar_url, color)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                persona_data["id"],
                persona_data["name"],
                persona_data["role"],
                persona_data["specialty"],
                persona_data["description"],
                persona_data["avatar_url"],
                persona_data["color"]
            )
        )
        return Persona(**persona_data)
    
    async def get_personas(self) -> List[Persona]:
        """Get all personas"""
        rows = await self.db.fetchall("SELECT * FROM personas ORDER BY name")
        return [
            Persona(
                id=row["id"],
                name=row["name"],
                role=row["role"],
                specialty=row["specialty"],
                description=row["description"],
                avatar_url=row["avatar_url"],
                color=row["color"]
            )
            for row in rows
        ]
    
    async def get_persona(self, persona_id: str) -> Optional[Persona]:
        """Get persona by ID"""
        row = await self.db.fetchone("SELECT * FROM personas WHERE id = ?", (persona_id,))
        if not row:
            return None
        
        return Persona(
            id=row["id"],
            name=row["name"],
            role=row["role"],
            specialty=row["specialty"],
            description=row["description"],
            avatar_url=row["avatar_url"],
            color=row["color"]
        )
    
    # Conversation operations
    async def create_conversation(self, user_id: str, persona_id: str, title: str = None) -> Conversation:
        """Create a new conversation"""
        cursor = await self.db.execute(
            """INSERT INTO conversations (user_id, persona_id, title, metadata)
               VALUES (?, ?, ?, ?)""",
            (user_id, persona_id, title or f"Chat with {persona_id}", "{}")
        )
        
        conversation_id = cursor.lastrowid
        row = await self.db.fetchone("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
        
        return Conversation(
            id=row["id"],
            user_id=row["user_id"],
            persona_id=row["persona_id"],
            title=row["title"],
            metadata=json.loads(row["metadata"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"])
        )
    
    async def get_user_conversations(self, user_id: str) -> List[Conversation]:
        """Get all conversations for a user"""
        rows = await self.db.fetchall(
            """SELECT c.*, p.name as persona_name, p.role, p.specialty, p.description, p.avatar_url, p.color
               FROM conversations c 
               LEFT JOIN personas p ON c.persona_id = p.id 
               WHERE c.user_id = ? 
               ORDER BY c.updated_at DESC""",
            (user_id,)
        )
        
        conversations = []
        for row in rows:
            persona = None
            if row["persona_name"]:
                persona = Persona(
                    id=row["persona_id"],
                    name=row["persona_name"],
                    role=row["role"],
                    specialty=row["specialty"],
                    description=row["description"],
                    avatar_url=row["avatar_url"],
                    color=row["color"]
                )
            
            conversations.append(Conversation(
                id=row["id"],
                user_id=row["user_id"],
                persona_id=row["persona_id"],
                title=row["title"],
                metadata=json.loads(row["metadata"] or "{}"),
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"]),
                persona=persona
            ))
        
        return conversations
    
    async def get_conversation_messages(self, conversation_id: int) -> List[Message]:
        """Get all messages for a conversation"""
        rows = await self.db.fetchall(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp",
            (conversation_id,)
        )
        
        return [
            Message(
                id=row["id"],
                conversation_id=row["conversation_id"],
                content=row["content"],
                sender=row["sender"],
                emotion_detected=row["emotion_detected"],
                timestamp=datetime.fromisoformat(row["timestamp"])
            )
            for row in rows
        ]
    
    async def create_message(self, conversation_id: int, content: str, sender: str, emotion_detected: str = None) -> Message:
        """Create a new message"""
        cursor = await self.db.execute(
            """INSERT INTO messages (conversation_id, content, sender, emotion_detected)
               VALUES (?, ?, ?, ?)""",
            (conversation_id, content, sender, emotion_detected)
        )
        
        message_id = cursor.lastrowid
        row = await self.db.fetchone("SELECT * FROM messages WHERE id = ?", (message_id,))
        
        return Message(
            id=row["id"],
            conversation_id=row["conversation_id"],
            content=row["content"],
            sender=row["sender"],
            emotion_detected=row["emotion_detected"],
            timestamp=datetime.fromisoformat(row["timestamp"])
        )
    
    # User operations
    async def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        row = await self.db.fetchone("SELECT * FROM users WHERE id = ?", (user_id,))
        if not row:
            return None
        
        return User(
            id=row["id"],
            email=row["email"],
            first_name=row["first_name"],
            last_name=row["last_name"],
            name=row["name"],
            pronouns=row["pronouns"],
            mood_tagline=row["mood_tagline"],
            profile_image_url=row["profile_image_url"],
            bio=row["bio"],
            preferences=json.loads(row["preferences"] or "{}"),
            goals=json.loads(row["goals"] or "[]"),
            interests=json.loads(row["interests"] or "[]"),
            mental_health_focus=json.loads(row["mental_health_focus"] or "[]"),
            privacy_settings=json.loads(row["privacy_settings"] or "{}"),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"])
        )
    
    async def create_or_update_user(self, user_data: Dict[str, Any]) -> User:
        """Create or update user"""
        await self.db.execute(
            """INSERT OR REPLACE INTO users 
               (id, email, first_name, last_name, name, pronouns, mood_tagline, 
                profile_image_url, bio, preferences, goals, interests, 
                mental_health_focus, privacy_settings, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user_data.get("id", "anonymous"),
                user_data.get("email"),
                user_data.get("first_name"),
                user_data.get("last_name"),
                user_data.get("name"),
                user_data.get("pronouns"),
                user_data.get("mood_tagline"),
                user_data.get("profile_image_url"),
                user_data.get("bio"),
                json.dumps(user_data.get("preferences", {})),
                json.dumps(user_data.get("goals", [])),
                json.dumps(user_data.get("interests", [])),
                json.dumps(user_data.get("mental_health_focus", [])),
                json.dumps(user_data.get("privacy_settings", {})),
                datetime.now().isoformat()
            )
        )
        
        return await self.get_user(user_data.get("id", "anonymous"))
    
    # Diary operations
    async def get_diary_entries(self, user_id: str) -> List[DiaryEntry]:
        """Get all diary entries for a user"""
        rows = await self.db.fetchall(
            "SELECT * FROM diary_entries WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        
        return [
            DiaryEntry(
                id=row["id"],
                user_id=row["user_id"],
                title=row["title"],
                content=row["content"],
                mood=row["mood"],
                tags=json.loads(row["tags"] or "[]"),
                is_private=bool(row["is_private"]),
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"])
            )
            for row in rows
        ]
    
    async def create_diary_entry(self, entry_data: Dict[str, Any]) -> DiaryEntry:
        """Create a new diary entry"""
        cursor = await self.db.execute(
            """INSERT INTO diary_entries (user_id, title, content, mood, tags, is_private)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                entry_data["user_id"],
                entry_data.get("title", ""),
                entry_data["content"],
                entry_data.get("mood"),
                json.dumps(entry_data.get("tags", [])),
                entry_data.get("is_private", False)
            )
        )
        
        entry_id = cursor.lastrowid
        row = await self.db.fetchone("SELECT * FROM diary_entries WHERE id = ?", (entry_id,))
        
        return DiaryEntry(
            id=row["id"],
            user_id=row["user_id"],
            title=row["title"],
            content=row["content"],
            mood=row["mood"],
            tags=json.loads(row["tags"] or "[]"),
            is_private=bool(row["is_private"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"])
        )
    
    # Goals operations
    async def get_user_goals(self, user_id: str) -> List[UserGoal]:
        """Get all goals for a user"""
        rows = await self.db.fetchall(
            "SELECT * FROM user_goals WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        
        return [
            UserGoal(
                id=row["id"],
                user_id=row["user_id"],
                title=row["title"],
                description=row["description"],
                category=row["category"],
                status=row["status"],
                progress=row["progress"],
                target_date=date.fromisoformat(row["target_date"]) if row["target_date"] else None,
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"])
            )
            for row in rows
        ]
    
    async def create_goal(self, goal_data: Dict[str, Any]) -> UserGoal:
        """Create a new goal"""
        cursor = await self.db.execute(
            """INSERT INTO user_goals (user_id, title, description, category, status, progress, target_date)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                goal_data["user_id"],
                goal_data["title"],
                goal_data.get("description"),
                goal_data.get("category", "personal"),
                goal_data.get("status", "active"),
                goal_data.get("progress", 0),
                goal_data.get("target_date")
            )
        )
        
        goal_id = cursor.lastrowid
        row = await self.db.fetchone("SELECT * FROM user_goals WHERE id = ?", (goal_id,))
        
        return UserGoal(
            id=row["id"],
            user_id=row["user_id"],
            title=row["title"],
            description=row["description"],
            category=row["category"],
            status=row["status"],
            progress=row["progress"],
            target_date=date.fromisoformat(row["target_date"]) if row["target_date"] else None,
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"])
        )
    
    async def update_goal_progress(self, goal_id: int, progress: int, status: str = None) -> Optional[UserGoal]:
        """Update goal progress"""
        if status:
            await self.db.execute(
                "UPDATE user_goals SET progress = ?, status = ?, updated_at = ? WHERE id = ?",
                (progress, status, datetime.now().isoformat(), goal_id)
            )
        else:
            await self.db.execute(
                "UPDATE user_goals SET progress = ?, updated_at = ? WHERE id = ?",
                (progress, datetime.now().isoformat(), goal_id)
            )
        
        row = await self.db.fetchone("SELECT * FROM user_goals WHERE id = ?", (goal_id,))
        if not row:
            return None
        
        return UserGoal(
            id=row["id"],
            user_id=row["user_id"],
            title=row["title"],
            description=row["description"],
            category=row["category"],
            status=row["status"],
            progress=row["progress"],
            target_date=date.fromisoformat(row["target_date"]) if row["target_date"] else None,
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"])
        )