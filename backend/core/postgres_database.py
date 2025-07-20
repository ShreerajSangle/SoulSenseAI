#!/usr/bin/env python3
"""
PostgreSQL Database Integration for SoulSense AI
Comprehensive database layer with persistent storage for all user interactions
"""

import asyncio
import asyncpg
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import uuid

@dataclass
class UserProfile:
    """User profile data structure"""
    user_id: str
    name: str
    email: Optional[str] = None
    preferred_persona: Optional[str] = None
    bio: Optional[str] = None
    goals: List[str] = None
    interests: List[str] = None
    mental_health_focus: List[str] = None
    preferences: Dict[str, Any] = None
    privacy_settings: Dict[str, Any] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class ConversationRecord:
    """Complete conversation record"""
    conversation_id: str
    user_id: str
    persona_id: str
    messages: List[Dict[str, Any]]
    session_summary: Optional[str] = None
    emotional_tone: Optional[str] = None
    key_topics: List[str] = None
    mood_change: Optional[str] = None
    session_rating: Optional[float] = None
    duration_minutes: Optional[int] = None
    created_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

class PostgreSQLDatabase:
    """Advanced PostgreSQL database integration for SoulSense AI"""
    
    def __init__(self):
        self.pool = None
        self.database_url = os.getenv('DATABASE_URL')
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
    
    async def initialize(self):
        """Initialize database connection pool and create tables"""
        try:
            # Create connection pool
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            
            # Create all required tables
            await self._create_database_schema()
            print("PostgreSQL database initialized successfully")
            
        except Exception as e:
            print(f"Error initializing PostgreSQL database: {e}")
            raise
    
    async def _create_database_schema(self):
        """Create comprehensive database schema for SoulSense"""
        async with self.pool.acquire() as conn:
            # Start a transaction
            await conn.execute("BEGIN")
            
            try:
                # Create tables without foreign keys first
                
                # Users table (adapt to existing Replit Auth schema)
                # The table already exists with 'id' as primary key, so we'll add our columns
                try:
                    await conn.execute("""
                        ALTER TABLE users 
                        ADD COLUMN IF NOT EXISTS preferred_persona VARCHAR(50)
                    """)
                    
                    # Add our additional columns if they don't exist
                    additional_columns = [
                        "ADD COLUMN IF NOT EXISTS mood_tagline VARCHAR(255)",
                        "ADD COLUMN IF NOT EXISTS pronouns VARCHAR(50)"
                    ]
                    
                    for column_sql in additional_columns:
                        try:
                            await conn.execute(f"ALTER TABLE users {column_sql}")
                        except Exception as e:
                            pass  # Column might already exist
                            
                except Exception as e:
                    # If users table doesn't exist, create it with proper schema
                    await conn.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            id VARCHAR(255) PRIMARY KEY,
                            name VARCHAR(255),
                            email VARCHAR(255) UNIQUE,
                            first_name VARCHAR(255),
                            last_name VARCHAR(255),
                            profile_image_url VARCHAR(255),
                            preferred_persona VARCHAR(50),
                            bio TEXT,
                            goals TEXT[] DEFAULT '{}',
                            interests TEXT[] DEFAULT '{}',
                            mental_health_focus TEXT[] DEFAULT '{}',
                            preferences JSONB DEFAULT '{}',
                            privacy_settings JSONB DEFAULT '{}',
                            mood_tagline VARCHAR(255),
                            pronouns VARCHAR(50),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """)
                
                # Conversations table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS conversations (
                        id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        persona_id VARCHAR(50) NOT NULL,
                        session_summary TEXT,
                        emotional_tone VARCHAR(100),
                        key_topics JSONB DEFAULT '[]',
                        mood_change TEXT,
                        session_rating DECIMAL(3,2),
                        duration_minutes INTEGER,
                        message_count INTEGER DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        ended_at TIMESTAMP
                    )
                """)
                
                # Messages table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS messages (
                        id VARCHAR(255) PRIMARY KEY,
                        conversation_id VARCHAR(255),
                        sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
                        content TEXT NOT NULL,
                        emotion_detected VARCHAR(50),
                        confidence_score DECIMAL(3,2),
                        features_activated JSONB DEFAULT '[]',
                        quick_replies JSONB DEFAULT '[]',
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Journal entries table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS journal_entries (
                        entry_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        persona_id VARCHAR(50),
                        title VARCHAR(255),
                        content TEXT NOT NULL,
                        mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
                        emotion_tags JSONB DEFAULT '[]',
                        gratitude_items JSONB DEFAULT '[]',
                        reflection_prompts JSONB DEFAULT '[]',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Goals table  
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS goals (
                        id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        persona_id VARCHAR(50),
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        category VARCHAR(100),
                        target_date DATE,
                        progress_percentage DECIMAL(5,2) DEFAULT 0.00,
                        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
                        milestones JSONB DEFAULT '[]',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        completed_at TIMESTAMP
                    )
                """)
                
                # Breathing sessions table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS breathing_sessions (
                        session_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        persona_id VARCHAR(50),
                        technique_name VARCHAR(100) NOT NULL,
                        duration_minutes INTEGER NOT NULL,
                        cycles_completed INTEGER,
                        pre_session_mood INTEGER CHECK (pre_session_mood >= 1 AND pre_session_mood <= 10),
                        post_session_mood INTEGER CHECK (post_session_mood >= 1 AND post_session_mood <= 10),
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Affirmations table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS affirmations (
                        affirmation_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        persona_id VARCHAR(50),
                        affirmation_text TEXT NOT NULL,
                        category VARCHAR(100),
                        frequency_used INTEGER DEFAULT 0,
                        effectiveness_rating DECIMAL(3,2),
                        personal_notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_used TIMESTAMP
                    )
                """)
                
                # Emotional patterns table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS emotional_patterns (
                        pattern_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        date_recorded DATE NOT NULL,
                        dominant_emotion VARCHAR(50),
                        emotion_intensity DECIMAL(3,2),
                        trigger_events JSONB DEFAULT '[]',
                        coping_strategies JSONB DEFAULT '[]',
                        mood_trend VARCHAR(20) CHECK (mood_trend IN ('improving', 'stable', 'declining')),
                        stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
                        energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
                        sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Session analytics table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS session_analytics (
                        analytics_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        persona_id VARCHAR(50),
                        session_date DATE NOT NULL,
                        interaction_count INTEGER DEFAULT 0,
                        total_duration_minutes INTEGER DEFAULT 0,
                        techniques_used JSONB DEFAULT '[]',
                        mood_improvement DECIMAL(3,2),
                        engagement_score DECIMAL(3,2),
                        therapeutic_effectiveness DECIMAL(3,2),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # User streaks table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS user_streaks (
                        streak_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        streak_type VARCHAR(50) NOT NULL,
                        current_streak INTEGER DEFAULT 0,
                        longest_streak INTEGER DEFAULT 0,
                        last_activity_date DATE,
                        streak_start_date DATE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Session recaps table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS session_recaps (
                        recap_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        session_id VARCHAR(255),
                        persona_id VARCHAR(50),
                        conversation_summary TEXT,
                        key_topics JSONB DEFAULT '[]',
                        emotional_journey TEXT,
                        insights_gained JSONB DEFAULT '[]',
                        therapeutic_techniques_used JSONB DEFAULT '[]',
                        progress_notes TEXT,
                        next_session_suggestions JSONB DEFAULT '[]',
                        mood_change TEXT,
                        session_rating DECIMAL(3,2),
                        duration_minutes INTEGER,
                        message_count INTEGER,
                        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Create indexes for performance
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user_id ON breathing_sessions(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_emotional_patterns_user_id ON emotional_patterns(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_session_analytics_user_id ON session_analytics(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_session_recaps_user_id ON session_recaps(user_id)")
                
                # Commit the transaction
                await conn.execute("COMMIT")
                print("✅ Database schema created successfully")
                
            except Exception as e:
                await conn.execute("ROLLBACK")
                print(f"❌ Error creating schema: {e}")
                raise
            
            # Create indexes for better performance
            await self._create_indexes(conn)
    
    async def _create_indexes(self, conn):
        """Create database indexes for improved query performance"""
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_conversations_persona_id ON conversations(persona_id)",
            "CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)",
            "CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)",
            "CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status)",
            "CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user_id ON breathing_sessions(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_emotional_patterns_user_id ON emotional_patterns(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_emotional_patterns_date ON emotional_patterns(date_recorded)",
            "CREATE INDEX IF NOT EXISTS idx_session_analytics_user_id ON session_analytics(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_session_analytics_date ON session_analytics(session_date)"
        ]
        
        for index_sql in indexes:
            try:
                await conn.execute(index_sql)
            except Exception as e:
                print(f"Warning: Could not create index - {e}")
    
    # User Management
    async def create_or_update_user(self, profile: UserProfile) -> bool:
        """Create or update user profile"""
        async with self.pool.acquire() as conn:
            try:
                await conn.execute("""
                    INSERT INTO users (
                        id, name, email, preferred_persona, bio, goals, 
                        interests, mental_health_focus, preferences, privacy_settings
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        email = EXCLUDED.email,
                        preferred_persona = EXCLUDED.preferred_persona,
                        bio = EXCLUDED.bio,
                        goals = EXCLUDED.goals,
                        interests = EXCLUDED.interests,
                        mental_health_focus = EXCLUDED.mental_health_focus,
                        preferences = EXCLUDED.preferences,
                        privacy_settings = EXCLUDED.privacy_settings,
                        updated_at = CURRENT_TIMESTAMP
                """, 
                    profile.user_id, profile.name, profile.email, profile.preferred_persona,
                    profile.bio, profile.goals or [], 
                    profile.interests or [], 
                    profile.mental_health_focus or [],
                    json.dumps(profile.preferences or {}),
                    json.dumps(profile.privacy_settings or {})
                )
                return True
            except Exception as e:
                print(f"Error creating/updating user: {e}")
                return False
    
    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Retrieve user profile"""
        async with self.pool.acquire() as conn:
            try:
                row = await conn.fetchrow(
                    "SELECT * FROM users WHERE id = $1", user_id
                )
                if row:
                    return UserProfile(
                        user_id=row['id'],
                        name=row['name'],
                        email=row['email'],
                        preferred_persona=row['preferred_persona'],
                        bio=row['bio'],
                        goals=row['goals'] if row['goals'] else [],
                        interests=row['interests'] if row['interests'] else [],
                        mental_health_focus=row['mental_health_focus'] if row['mental_health_focus'] else [],
                        preferences=json.loads(row['preferences']) if row['preferences'] else {},
                        privacy_settings=json.loads(row['privacy_settings']) if row['privacy_settings'] else {},
                        created_at=row['created_at'],
                        updated_at=row['updated_at']
                    )
                return None
            except Exception as e:
                print(f"Error getting user profile: {e}")
                return None
    
    # Conversation Management
    async def store_conversation(self, conversation: ConversationRecord) -> bool:
        """Store complete conversation with all messages"""
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                try:
                    # Store conversation record
                    await conn.execute("""
                        INSERT INTO conversations (
                            conversation_id, user_id, persona_id, session_summary,
                            emotional_tone, key_topics, mood_change, session_rating,
                            duration_minutes, message_count, ended_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT (conversation_id) DO UPDATE SET
                            session_summary = EXCLUDED.session_summary,
                            emotional_tone = EXCLUDED.emotional_tone,
                            key_topics = EXCLUDED.key_topics,
                            mood_change = EXCLUDED.mood_change,
                            session_rating = EXCLUDED.session_rating,
                            duration_minutes = EXCLUDED.duration_minutes,
                            message_count = EXCLUDED.message_count,
                            ended_at = EXCLUDED.ended_at
                    """, 
                        conversation.conversation_id, conversation.user_id, conversation.persona_id,
                        conversation.session_summary, conversation.emotional_tone,
                        json.dumps(conversation.key_topics or []), conversation.mood_change,
                        conversation.session_rating, conversation.duration_minutes,
                        len(conversation.messages), conversation.ended_at
                    )
                    
                    # Store individual messages
                    for message in conversation.messages:
                        message_id = message.get('id', str(uuid.uuid4()))
                        await conn.execute("""
                            INSERT INTO messages (
                                message_id, conversation_id, sender, content,
                                emotion_detected, confidence_score, features_activated,
                                quick_replies, timestamp
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                            ON CONFLICT (message_id) DO NOTHING
                        """,
                            message_id, conversation.conversation_id,
                            message.get('sender', 'user'), message.get('content', ''),
                            message.get('emotion'), message.get('confidence'),
                            json.dumps(message.get('features', [])),
                            json.dumps(message.get('quick_replies', [])),
                            message.get('timestamp', datetime.now())
                        )
                    
                    return True
                except Exception as e:
                    print(f"Error storing conversation: {e}")
                    return False
    
    async def get_user_conversations(self, user_id: str, persona_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's conversation history"""
        async with self.pool.acquire() as conn:
            try:
                if persona_id:
                    rows = await conn.fetch("""
                        SELECT c.*, 
                               COUNT(m.message_id) as message_count,
                               MIN(m.timestamp) as first_message,
                               MAX(m.timestamp) as last_message
                        FROM conversations c
                        LEFT JOIN messages m ON c.conversation_id = m.conversation_id
                        WHERE c.user_id = $1 AND c.persona_id = $2
                        GROUP BY c.conversation_id
                        ORDER BY c.created_at DESC
                        LIMIT $3
                    """, user_id, persona_id, limit)
                else:
                    rows = await conn.fetch("""
                        SELECT c.*, 
                               COUNT(m.message_id) as message_count,
                               MIN(m.timestamp) as first_message,
                               MAX(m.timestamp) as last_message
                        FROM conversations c
                        LEFT JOIN messages m ON c.conversation_id = m.conversation_id
                        WHERE c.user_id = $1
                        GROUP BY c.conversation_id
                        ORDER BY c.created_at DESC
                        LIMIT $2
                    """, user_id, limit)
                
                return [dict(row) for row in rows]
            except Exception as e:
                print(f"Error getting conversations: {e}")
                return []
    
    # Journal Management
    async def store_journal_entry(self, user_id: str, entry_data: Dict[str, Any]) -> str:
        """Store journal entry and return entry ID"""
        async with self.pool.acquire() as conn:
            try:
                entry_id = str(uuid.uuid4())
                await conn.execute("""
                    INSERT INTO journal_entries (
                        entry_id, user_id, persona_id, title, content,
                        mood_rating, emotion_tags, gratitude_items, reflection_prompts
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """, 
                    entry_id, user_id, entry_data.get('persona_id'),
                    entry_data.get('title', ''), entry_data.get('content', ''),
                    entry_data.get('mood_rating'), 
                    json.dumps(entry_data.get('emotion_tags', [])),
                    json.dumps(entry_data.get('gratitude_items', [])),
                    json.dumps(entry_data.get('reflection_prompts', []))
                )
                return entry_id
            except Exception as e:
                print(f"Error storing journal entry: {e}")
                return ""
    
    async def get_journal_entries(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get user's journal entries"""
        async with self.pool.acquire() as conn:
            try:
                rows = await conn.fetch("""
                    SELECT * FROM journal_entries 
                    WHERE user_id = $1 
                    ORDER BY created_at DESC 
                    LIMIT $2
                """, user_id, limit)
                return [dict(row) for row in rows]
            except Exception as e:
                print(f"Error getting journal entries: {e}")
                return []
    
    # Goals Management
    async def store_goal(self, user_id: str, goal_data: Dict[str, Any]) -> str:
        """Store wellness goal and return goal ID"""
        async with self.pool.acquire() as conn:
            try:
                goal_id = str(uuid.uuid4())
                await conn.execute("""
                    INSERT INTO goals (
                        goal_id, user_id, persona_id, title, description,
                        category, target_date, progress_percentage, status, milestones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, 
                    goal_id, user_id, goal_data.get('persona_id'),
                    goal_data.get('title', ''), goal_data.get('description', ''),
                    goal_data.get('category', ''), goal_data.get('target_date'),
                    goal_data.get('progress_percentage', 0.0),
                    goal_data.get('status', 'active'),
                    json.dumps(goal_data.get('milestones', []))
                )
                return goal_id
            except Exception as e:
                print(f"Error storing goal: {e}")
                return ""
    
    async def update_goal_progress(self, goal_id: str, progress_percentage: float, status: Optional[str] = None) -> bool:
        """Update goal progress"""
        async with self.pool.acquire() as conn:
            try:
                if status:
                    await conn.execute("""
                        UPDATE goals 
                        SET progress_percentage = $1, status = $2,
                            completed_at = CASE WHEN $2 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
                        WHERE goal_id = $3
                    """, progress_percentage, status, goal_id)
                else:
                    await conn.execute("""
                        UPDATE goals 
                        SET progress_percentage = $1
                        WHERE goal_id = $2
                    """, progress_percentage, goal_id)
                return True
            except Exception as e:
                print(f"Error updating goal progress: {e}")
                return False
    
    async def get_user_goals(self, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get user's goals"""
        async with self.pool.acquire() as conn:
            try:
                if status:
                    rows = await conn.fetch("""
                        SELECT * FROM goals 
                        WHERE user_id = $1 AND status = $2 
                        ORDER BY created_at DESC
                    """, user_id, status)
                else:
                    rows = await conn.fetch("""
                        SELECT * FROM goals 
                        WHERE user_id = $1 
                        ORDER BY created_at DESC
                    """, user_id)
                return [dict(row) for row in rows]
            except Exception as e:
                print(f"Error getting goals: {e}")
                return []
    
    # Breathing Sessions
    async def store_breathing_session(self, user_id: str, session_data: Dict[str, Any]) -> str:
        """Store breathing session"""
        async with self.pool.acquire() as conn:
            try:
                session_id = str(uuid.uuid4())
                await conn.execute("""
                    INSERT INTO breathing_sessions (
                        session_id, user_id, persona_id, technique_name,
                        duration_minutes, cycles_completed, pre_session_mood,
                        post_session_mood, notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """, 
                    session_id, user_id, session_data.get('persona_id'),
                    session_data.get('technique_name', ''), session_data.get('duration_minutes', 0),
                    session_data.get('cycles_completed', 0), session_data.get('pre_session_mood'),
                    session_data.get('post_session_mood'), session_data.get('notes', '')
                )
                return session_id
            except Exception as e:
                print(f"Error storing breathing session: {e}")
                return ""
    
    # Comprehensive Analytics
    async def get_user_analytics_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user analytics for dashboard"""
        async with self.pool.acquire() as conn:
            try:
                analytics = {}
                
                # Total sessions per persona
                persona_stats = await conn.fetch("""
                    SELECT persona_id, 
                           COUNT(*) as total_sessions,
                           AVG(session_rating) as avg_rating,
                           SUM(duration_minutes) as total_duration
                    FROM conversations 
                    WHERE user_id = $1 AND session_rating IS NOT NULL
                    GROUP BY persona_id
                """, user_id)
                analytics['persona_stats'] = [dict(row) for row in persona_stats]
                
                # Goals summary
                goals_summary = await conn.fetchrow("""
                    SELECT 
                        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_goals,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_goals,
                        AVG(progress_percentage) as avg_progress
                    FROM goals WHERE user_id = $1
                """, user_id)
                analytics['goals_summary'] = dict(goals_summary) if goals_summary else {}
                
                # Journal activity
                journal_stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(*) as total_entries,
                        AVG(mood_rating) as avg_mood,
                        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_entries
                    FROM journal_entries WHERE user_id = $1
                """, user_id)
                analytics['journal_stats'] = dict(journal_stats) if journal_stats else {}
                
                # Emotional patterns (last 30 days)
                emotional_trends = await conn.fetch("""
                    SELECT date_recorded, dominant_emotion, emotion_intensity, stress_level
                    FROM emotional_patterns 
                    WHERE user_id = $1 AND date_recorded >= CURRENT_DATE - INTERVAL '30 days'
                    ORDER BY date_recorded DESC
                """, user_id)
                analytics['emotional_trends'] = [dict(row) for row in emotional_trends]
                
                # Breathing sessions summary
                breathing_stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(*) as total_sessions,
                        SUM(duration_minutes) as total_minutes,
                        AVG(post_session_mood - pre_session_mood) as avg_mood_improvement
                    FROM breathing_sessions 
                    WHERE user_id = $1 AND pre_session_mood IS NOT NULL AND post_session_mood IS NOT NULL
                """, user_id)
                analytics['breathing_stats'] = dict(breathing_stats) if breathing_stats else {}
                
                # Recent activity
                recent_activity = await conn.fetch("""
                    SELECT 'conversation' as activity_type, persona_id, created_at, 
                           conversation_id as activity_id
                    FROM conversations WHERE user_id = $1
                    UNION ALL
                    SELECT 'journal' as activity_type, persona_id, created_at,
                           entry_id as activity_id
                    FROM journal_entries WHERE user_id = $1
                    UNION ALL
                    SELECT 'breathing' as activity_type, persona_id, created_at,
                           session_id as activity_id
                    FROM breathing_sessions WHERE user_id = $1
                    ORDER BY created_at DESC
                    LIMIT 20
                """, user_id)
                analytics['recent_activity'] = [dict(row) for row in recent_activity]
                
                return analytics
                
            except Exception as e:
                print(f"Error getting user analytics: {e}")
                return {}
    
    # Session Recap Storage (maintaining compatibility)
    async def store_session_recap(self, user_id: str, recap_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store session recap for future reference"""
        async with self.pool.acquire() as conn:
            try:
                recap_id = str(uuid.uuid4())
                await conn.execute("""
                    INSERT INTO session_recaps (
                        recap_id, user_id, session_id, persona_id, conversation_summary,
                        key_topics, emotional_journey, insights_gained,
                        therapeutic_techniques_used, progress_notes,
                        next_session_suggestions, mood_change, session_rating,
                        duration_minutes, message_count, generated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                """, 
                    recap_id, user_id, recap_data.get('session_id'),
                    recap_data.get('persona_id'), recap_data.get('conversation_summary'),
                    json.dumps(recap_data.get('key_topics', [])),
                    recap_data.get('emotional_journey'),
                    json.dumps(recap_data.get('insights_gained', [])),
                    json.dumps(recap_data.get('therapeutic_techniques_used', [])),
                    recap_data.get('progress_notes'),
                    json.dumps(recap_data.get('next_session_suggestions', [])),
                    recap_data.get('mood_change'), recap_data.get('session_rating', 7.0),
                    recap_data.get('duration_minutes', 15), recap_data.get('message_count', 0),
                    recap_data.get('generated_at')
                )
                return {"status": "success", "recap_id": recap_id}
            except Exception as e:
                print(f"Error storing session recap: {e}")
                return {"status": "error", "message": str(e)}
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()