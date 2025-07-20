"""
Database management for SoulSense AI
Handles SQLite database operations with async support
"""

import os
import sqlite3
import aiosqlite
from typing import Optional, Dict, Any, List
from datetime import datetime


class Database:
    """Async database manager for SoulSense AI"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self._connection: Optional[aiosqlite.Connection] = None
    
    async def initialize(self):
        """Initialize database connection and create tables"""
        self._connection = await aiosqlite.connect(self.db_path)
        self._connection.row_factory = aiosqlite.Row
        await self.create_tables()
    
    async def create_tables(self):
        """Create all necessary tables"""
        await self.execute_script("""
            -- Personas table
            CREATE TABLE IF NOT EXISTS personas (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                specialty TEXT NOT NULL,
                description TEXT NOT NULL,
                avatar_url TEXT NOT NULL,
                color TEXT NOT NULL
            );
            
            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                first_name TEXT,
                last_name TEXT,
                name TEXT,
                pronouns TEXT,
                mood_tagline TEXT,
                profile_image_url TEXT,
                bio TEXT,
                preferences TEXT DEFAULT '{}',
                goals TEXT DEFAULT '[]',
                interests TEXT DEFAULT '[]',
                mental_health_focus TEXT DEFAULT '[]',
                privacy_settings TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Conversations table
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                title TEXT,
                metadata TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (persona_id) REFERENCES personas(id)
            );
            
            -- Messages table
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
                emotion_detected TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id)
            );
            
            -- Sessions table for therapy session tracking
            CREATE TABLE IF NOT EXISTS therapy_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                summary TEXT,
                key_topics TEXT DEFAULT '[]',
                techniques_used TEXT DEFAULT '[]',
                homework TEXT DEFAULT '[]',
                mood_before TEXT,
                mood_after TEXT,
                duration_minutes INTEGER,
                message_count INTEGER,
                emotion_analysis TEXT DEFAULT '{}',
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id),
                FOREIGN KEY (persona_id) REFERENCES personas(id)
            );
            
            -- User memories table
            CREATE TABLE IF NOT EXISTS user_memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                content TEXT,
                metadata TEXT DEFAULT '{}',
                persona_id TEXT,
                conversation_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Diary entries table
            CREATE TABLE IF NOT EXISTS diary_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT,
                content TEXT NOT NULL,
                mood TEXT,
                tags TEXT DEFAULT '[]',
                is_private BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- User goals table
            CREATE TABLE IF NOT EXISTS user_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT DEFAULT 'personal',
                status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
                progress INTEGER DEFAULT 0,
                target_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Analytics tables
            CREATE TABLE IF NOT EXISTS session_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                conversation_id INTEGER,
                persona_id TEXT,
                session_duration INTEGER,
                message_count INTEGER,
                mood_before TEXT,
                mood_after TEXT,
                topics_discussed TEXT DEFAULT '[]',
                techniques_used TEXT DEFAULT '[]',
                emotion_analysis TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS user_streaks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL UNIQUE,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_activity_date DATE,
                streak_type TEXT DEFAULT 'daily_chat',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS persona_usage_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                session_count INTEGER DEFAULT 0,
                total_duration INTEGER DEFAULT 0,
                last_used TIMESTAMP,
                affinity_score REAL DEFAULT 0.0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, persona_id)
            );
            
            -- Indexes for performance
            CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
            CREATE INDEX IF NOT EXISTS idx_conversations_persona_id ON conversations(persona_id);
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
            CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
            CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
            CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
        """)
    
    async def execute_script(self, script: str):
        """Execute SQL script with multiple statements"""
        if not self._connection:
            raise RuntimeError("Database not initialized")
        
        await self._connection.executescript(script)
        await self._connection.commit()
    
    async def execute(self, query: str, params: tuple = ()) -> aiosqlite.Cursor:
        """Execute single SQL query"""
        if not self._connection:
            raise RuntimeError("Database not initialized")
        
        cursor = await self._connection.execute(query, params)
        await self._connection.commit()
        return cursor
    
    async def fetchone(self, query: str, params: tuple = ()) -> Optional[aiosqlite.Row]:
        """Execute query and fetch one result"""
        if not self._connection:
            raise RuntimeError("Database not initialized")
        
        cursor = await self._connection.execute(query, params)
        return await cursor.fetchone()
    
    async def fetchall(self, query: str, params: tuple = ()) -> List[aiosqlite.Row]:
        """Execute query and fetch all results"""
        if not self._connection:
            raise RuntimeError("Database not initialized")
        
        cursor = await self._connection.execute(query, params)
        return await cursor.fetchall()
    
    async def close(self):
        """Close database connection"""
        if self._connection:
            await self._connection.close()
            self._connection = None


# Database dependency for FastAPI
async def get_db() -> Database:
    """FastAPI dependency to get database instance"""
    # This will be replaced by the app.state.database instance
    return None