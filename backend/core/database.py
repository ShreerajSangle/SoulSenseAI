"""
Database - SQLite/PostgreSQL Database Management
Handles data persistence for users, conversations, personas, and analytics
"""

import asyncio
import aiosqlite
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from models.schemas import (
    UserProfile, 
    EmotionalContext, 
    BreathingSession, 
    JournalEntry, 
    Goal, 
    SessionData,
    AnalyticsData
)
import os

class Database:
    """Database management for SoulSense AI application"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self.connection = None
        
    async def initialize(self):
        """Initialize database and create tables"""
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        
        await self._create_tables()
        print(f"Database initialized: {self.db_path}")
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            await self.connection.close()
    
    async def _create_tables(self):
        """Create all necessary database tables"""
        
        # Users table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT,
                preferred_persona TEXT DEFAULT 'sarah',
                bio TEXT,
                goals TEXT,
                interests TEXT,
                mental_health_focus TEXT,
                preferences TEXT,
                privacy_settings TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Conversations table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                session_id TEXT,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                emotional_context TEXT,
                features_used TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Sessions table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                duration_minutes INTEGER,
                message_count INTEGER DEFAULT 0,
                emotions_tracked TEXT,
                features_used TEXT,
                session_summary TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Breathing sessions table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS breathing_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                technique TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                rounds_completed INTEGER DEFAULT 0,
                user_notes TEXT,
                effectiveness_rating INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Journal entries table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS journal_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                title TEXT,
                content TEXT NOT NULL,
                mood TEXT NOT NULL,
                tags TEXT,
                is_private BOOLEAN DEFAULT TRUE,
                reflection_prompts TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Goals table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                target_date TIMESTAMP,
                action_steps TEXT,
                progress_percentage REAL DEFAULT 0.0,
                is_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # User analytics table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS user_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                total_sessions INTEGER DEFAULT 0,
                total_duration_minutes INTEGER DEFAULT 0,
                most_common_emotion TEXT,
                mood_trends TEXT,
                goal_completion_rate REAL DEFAULT 0.0,
                streak_current INTEGER DEFAULT 0,
                streak_longest INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Emotional patterns table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS emotional_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                emotion TEXT NOT NULL,
                frequency INTEGER DEFAULT 1,
                average_intensity REAL DEFAULT 0.5,
                last_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        await self.connection.commit()
    
    async def store_conversation(
        self,
        user_id: str,
        persona_id: str,
        user_message: str,
        ai_response: str,
        emotional_context: EmotionalContext,
        features_used: List[str],
        session_id: Optional[str] = None
    ) -> int:
        """Store conversation in database"""
        
        emotional_context_json = json.dumps({
            "primary_emotion": emotional_context.primary_emotion.value,
            "secondary_emotions": [e.value for e in emotional_context.secondary_emotions],
            "intensity": emotional_context.intensity,
            "valence": emotional_context.valence,
            "arousal": emotional_context.arousal,
            "confidence": emotional_context.confidence,
            "triggers": emotional_context.emotional_triggers,
            "support_needs": emotional_context.support_needs,
            "crisis_indicators": emotional_context.crisis_indicators
        })
        
        features_json = json.dumps(features_used)
        
        cursor = await self.connection.execute('''
            INSERT INTO conversations 
            (user_id, persona_id, session_id, user_message, ai_response, emotional_context, features_used)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, persona_id, session_id, user_message, ai_response, emotional_context_json, features_json))
        
        await self.connection.commit()
        
        # Update emotional patterns
        await self._update_emotional_patterns(user_id, persona_id, emotional_context)
        
        return cursor.lastrowid
    
    async def _update_emotional_patterns(self, user_id: str, persona_id: str, emotional_context: EmotionalContext):
        """Update emotional patterns for analytics"""
        
        emotion = emotional_context.primary_emotion.value
        
        # Check if pattern exists
        cursor = await self.connection.execute('''
            SELECT id, frequency, average_intensity FROM emotional_patterns
            WHERE user_id = ? AND persona_id = ? AND emotion = ?
        ''', (user_id, persona_id, emotion))
        
        row = await cursor.fetchone()
        
        if row:
            # Update existing pattern
            new_frequency = row["frequency"] + 1
            new_avg_intensity = ((row["average_intensity"] * row["frequency"]) + emotional_context.intensity) / new_frequency
            
            await self.connection.execute('''
                UPDATE emotional_patterns
                SET frequency = ?, average_intensity = ?, last_occurrence = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (new_frequency, new_avg_intensity, row["id"]))
        else:
            # Create new pattern
            await self.connection.execute('''
                INSERT INTO emotional_patterns (user_id, persona_id, emotion, frequency, average_intensity)
                VALUES (?, ?, ?, 1, ?)
            ''', (user_id, persona_id, emotion, emotional_context.intensity))
        
        await self.connection.commit()
    
    async def store_breathing_session(self, user_id: str, session: BreathingSession) -> int:
        """Store breathing exercise session"""
        
        cursor = await self.connection.execute('''
            INSERT INTO breathing_sessions 
            (user_id, persona_id, technique, duration_seconds, rounds_completed, user_notes, effectiveness_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, session.persona_id.value, session.technique, session.duration, 
              session.rounds_completed, session.user_notes, session.effectiveness_rating))
        
        await self.connection.commit()
        return cursor.lastrowid
    
    async def get_breathing_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's breathing exercise history"""
        
        cursor = await self.connection.execute('''
            SELECT * FROM breathing_sessions
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 50
        ''', (user_id,))
        
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    async def store_journal_entry(self, user_id: str, entry: JournalEntry) -> int:
        """Store journal entry"""
        
        tags_json = json.dumps(entry.tags)
        prompts_json = json.dumps(entry.reflection_prompts or [])
        
        cursor = await self.connection.execute('''
            INSERT INTO journal_entries 
            (user_id, persona_id, title, content, mood, tags, is_private, reflection_prompts)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, entry.persona_id.value, entry.title, entry.content, 
              entry.mood.value, tags_json, entry.is_private, prompts_json))
        
        await self.connection.commit()
        return cursor.lastrowid
    
    async def get_journal_entries(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's journal entries"""
        
        cursor = await self.connection.execute('''
            SELECT * FROM journal_entries
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 100
        ''', (user_id,))
        
        rows = await cursor.fetchall()
        entries = []
        
        for row in rows:
            entry = dict(row)
            entry["tags"] = json.loads(entry["tags"] or "[]")
            entry["reflection_prompts"] = json.loads(entry["reflection_prompts"] or "[]")
            entries.append(entry)
        
        return entries
    
    async def store_goal(self, user_id: str, goal: Goal) -> int:
        """Store wellness goal"""
        
        action_steps_json = json.dumps(goal.action_steps)
        
        cursor = await self.connection.execute('''
            INSERT INTO goals 
            (user_id, persona_id, title, description, category, target_date, action_steps, progress_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, goal.persona_id.value, goal.title, goal.description, 
              goal.category, goal.target_date, action_steps_json, goal.progress_percentage))
        
        await self.connection.commit()
        return cursor.lastrowid
    
    async def get_goals(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's wellness goals"""
        
        cursor = await self.connection.execute('''
            SELECT * FROM goals
            WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (user_id,))
        
        rows = await cursor.fetchall()
        goals = []
        
        for row in rows:
            goal = dict(row)
            goal["action_steps"] = json.loads(goal["action_steps"] or "[]")
            goals.append(goal)
        
        return goals
    
    async def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user analytics"""
        
        # Get total sessions across all personas
        cursor = await self.connection.execute('''
            SELECT COUNT(*) as total_sessions, 
                   COUNT(DISTINCT persona_id) as personas_used
            FROM conversations
            WHERE user_id = ?
        ''', (user_id,))
        
        session_data = await cursor.fetchone()
        
        # Get emotional patterns
        cursor = await self.connection.execute('''
            SELECT emotion, SUM(frequency) as total_frequency, AVG(average_intensity) as avg_intensity
            FROM emotional_patterns
            WHERE user_id = ?
            GROUP BY emotion
            ORDER BY total_frequency DESC
        ''', (user_id,))
        
        emotional_patterns = await cursor.fetchall()
        
        # Get persona usage
        cursor = await self.connection.execute('''
            SELECT persona_id, COUNT(*) as usage_count
            FROM conversations
            WHERE user_id = ?
            GROUP BY persona_id
            ORDER BY usage_count DESC
        ''', (user_id,))
        
        persona_usage = await cursor.fetchall()
        
        # Get breathing sessions count
        cursor = await self.connection.execute('''
            SELECT COUNT(*) as breathing_sessions
            FROM breathing_sessions
            WHERE user_id = ?
        ''', (user_id,))
        
        breathing_data = await cursor.fetchone()
        
        # Get journal entries count
        cursor = await self.connection.execute('''
            SELECT COUNT(*) as journal_entries
            FROM journal_entries
            WHERE user_id = ?
        ''', (user_id,))
        
        journal_data = await cursor.fetchone()
        
        # Get goal completion rate
        cursor = await self.connection.execute('''
            SELECT 
                COUNT(*) as total_goals,
                SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_goals
            FROM goals
            WHERE user_id = ?
        ''', (user_id,))
        
        goal_data = await cursor.fetchone()
        
        # Calculate completion rate
        completion_rate = 0.0
        if goal_data["total_goals"] > 0:
            completion_rate = goal_data["completed_goals"] / goal_data["total_goals"]
        
        # Build analytics response
        analytics = {
            "user_id": user_id,
            "total_sessions": session_data["total_sessions"],
            "personas_used": session_data["personas_used"],
            "emotional_patterns": {
                row["emotion"]: {
                    "frequency": row["total_frequency"],
                    "average_intensity": row["avg_intensity"]
                }
                for row in emotional_patterns
            },
            "persona_usage": {
                row["persona_id"]: row["usage_count"]
                for row in persona_usage
            },
            "breathing_sessions": breathing_data["breathing_sessions"],
            "journal_entries": journal_data["journal_entries"],
            "goal_completion_rate": completion_rate,
            "total_goals": goal_data["total_goals"],
            "completed_goals": goal_data["completed_goals"]
        }
        
        return analytics
    
    async def get_persona_analytics(self, user_id: str, persona_id: str) -> Dict[str, Any]:
        """Get persona-specific analytics"""
        
        # Get conversation count and recent activity
        cursor = await self.connection.execute('''
            SELECT COUNT(*) as conversation_count,
                   MAX(timestamp) as last_conversation
            FROM conversations
            WHERE user_id = ? AND persona_id = ?
        ''', (user_id, persona_id))
        
        conversation_data = await cursor.fetchone()
        
        # Get emotional patterns for this persona
        cursor = await self.connection.execute('''
            SELECT emotion, frequency, average_intensity
            FROM emotional_patterns
            WHERE user_id = ? AND persona_id = ?
            ORDER BY frequency DESC
        ''', (user_id, persona_id))
        
        emotional_patterns = await cursor.fetchall()
        
        # Get features used
        cursor = await self.connection.execute('''
            SELECT features_used
            FROM conversations
            WHERE user_id = ? AND persona_id = ? AND features_used IS NOT NULL
        ''', (user_id, persona_id))
        
        features_data = await cursor.fetchall()
        
        # Process features usage
        feature_usage = {}
        for row in features_data:
            features = json.loads(row["features_used"] or "[]")
            for feature in features:
                feature_usage[feature] = feature_usage.get(feature, 0) + 1
        
        return {
            "user_id": user_id,
            "persona_id": persona_id,
            "conversation_count": conversation_data["conversation_count"],
            "last_conversation": conversation_data["last_conversation"],
            "emotional_patterns": {
                row["emotion"]: {
                    "frequency": row["frequency"],
                    "average_intensity": row["average_intensity"]
                }
                for row in emotional_patterns
            },
            "feature_usage": feature_usage
        }
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile"""
        
        cursor = await self.connection.execute('''
            SELECT * FROM users WHERE id = ?
        ''', (user_id,))
        
        row = await cursor.fetchone()
        
        if row:
            profile = dict(row)
            profile["goals"] = json.loads(profile["goals"] or "[]")
            profile["interests"] = json.loads(profile["interests"] or "[]")
            profile["mental_health_focus"] = json.loads(profile["mental_health_focus"] or "[]")
            profile["preferences"] = json.loads(profile["preferences"] or "{}")
            profile["privacy_settings"] = json.loads(profile["privacy_settings"] or "{}")
            return profile
        
        return None
    
    async def update_user_profile(self, user_id: str, profile: UserProfile) -> bool:
        """Update user profile"""
        
        goals_json = json.dumps(profile.goals)
        interests_json = json.dumps(profile.interests)
        mental_health_focus_json = json.dumps(profile.mental_health_focus)
        preferences_json = json.dumps(profile.preferences)
        privacy_settings_json = json.dumps(profile.privacy_settings)
        
        # Check if user exists
        existing_profile = await self.get_user_profile(user_id)
        
        if existing_profile:
            # Update existing profile
            await self.connection.execute('''
                UPDATE users
                SET name = ?, email = ?, preferred_persona = ?, bio = ?,
                    goals = ?, interests = ?, mental_health_focus = ?,
                    preferences = ?, privacy_settings = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (profile.name, profile.email, profile.preferred_persona.value, profile.bio,
                  goals_json, interests_json, mental_health_focus_json,
                  preferences_json, privacy_settings_json, user_id))
        else:
            # Create new profile
            await self.connection.execute('''
                INSERT INTO users
                (id, name, email, preferred_persona, bio, goals, interests, 
                 mental_health_focus, preferences, privacy_settings)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, profile.name, profile.email, profile.preferred_persona.value, profile.bio,
                  goals_json, interests_json, mental_health_focus_json,
                  preferences_json, privacy_settings_json))
        
        await self.connection.commit()
        return True