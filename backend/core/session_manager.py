"""
Session Continuity Manager
Handles session persistence, context loading, and smart session resumption
"""

import asyncio
import aiosqlite
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass

@dataclass
class SessionContext:
    session_id: str
    user_id: str
    persona_id: str
    last_activity: datetime
    message_count: int
    key_topics: List[str]
    emotional_tone: str
    unfinished: bool
    last_user_message: str
    last_ai_response: str
    session_summary: str

class SessionManager:
    """Manages session continuity and smart context loading"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self.connection = None
        
    async def initialize(self):
        """Initialize session manager with database connection"""
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        await self._create_session_tables()
        
    async def _create_session_tables(self):
        """Create tables for session management"""
        
        # Session context table
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS session_contexts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                last_activity TIMESTAMP NOT NULL,
                message_count INTEGER DEFAULT 0,
                key_topics TEXT,
                emotional_tone TEXT,
                unfinished BOOLEAN DEFAULT 1,
                last_user_message TEXT,
                last_ai_response TEXT,
                session_summary TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Session threads table for micro-conversations
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS session_threads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                thread_id TEXT NOT NULL,
                topic TEXT,
                start_message_id INTEGER,
                end_message_id INTEGER,
                message_count INTEGER DEFAULT 0,
                thread_summary TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES session_contexts(session_id)
            )
        ''')
        
        # End-of-session summaries
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS session_summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                duration_minutes INTEGER,
                achievements TEXT,
                mood_change TEXT,
                next_steps TEXT,
                save_requested BOOLEAN DEFAULT 0,
                email_requested BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await self.connection.commit()
    
    async def start_session(
        self,
        user_id: str,
        persona_id: str,
        session_id: Optional[str] = None
    ) -> str:
        """Start a new session or resume existing one"""
        
        if not session_id:
            session_id = f"session_{user_id}_{persona_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Check if resuming an existing session
        existing = await self.get_session_context(session_id)
        if existing:
            # Update last activity
            await self.connection.execute('''
                UPDATE session_contexts 
                SET last_activity = ? 
                WHERE session_id = ?
            ''', (datetime.now(), session_id))
            await self.connection.commit()
            return session_id
        
        # Create new session
        await self.connection.execute('''
            INSERT INTO session_contexts 
            (session_id, user_id, persona_id, last_activity, unfinished)
            VALUES (?, ?, ?, ?, 1)
        ''', (session_id, user_id, persona_id, datetime.now()))
        await self.connection.commit()
        
        return session_id
    
    async def update_session_context(
        self,
        session_id: str,
        user_message: str,
        ai_response: str,
        emotional_context: Dict[str, Any],
        key_topics: List[str] = None
    ):
        """Update session with latest conversation context"""
        
        emotional_tone = emotional_context.get('primary_emotion', 'neutral')
        
        await self.connection.execute('''
            UPDATE session_contexts 
            SET last_activity = ?,
                message_count = message_count + 1,
                key_topics = ?,
                emotional_tone = ?,
                last_user_message = ?,
                last_ai_response = ?
            WHERE session_id = ?
        ''', (
            datetime.now(),
            json.dumps(key_topics or []),
            emotional_tone,
            user_message,
            ai_response,
            session_id
        ))
        await self.connection.commit()
    
    async def get_last_unfinished_session(
        self,
        user_id: str,
        persona_id: str
    ) -> Optional[SessionContext]:
        """Get the most recent unfinished session for a user-persona combination"""
        
        cursor = await self.connection.execute('''
            SELECT * FROM session_contexts 
            WHERE user_id = ? AND persona_id = ? AND unfinished = 1
            ORDER BY last_activity DESC 
            LIMIT 1
        ''', (user_id, persona_id))
        
        row = await cursor.fetchone()
        if not row:
            return None
        
        return SessionContext(
            session_id=row['session_id'],
            user_id=row['user_id'],
            persona_id=row['persona_id'],
            last_activity=datetime.fromisoformat(row['last_activity']),
            message_count=row['message_count'],
            key_topics=json.loads(row['key_topics'] or '[]'),
            emotional_tone=row['emotional_tone'] or 'neutral',
            unfinished=bool(row['unfinished']),
            last_user_message=row['last_user_message'] or '',
            last_ai_response=row['last_ai_response'] or '',
            session_summary=row['session_summary'] or ''
        )
    
    async def get_session_context(self, session_id: str) -> Optional[SessionContext]:
        """Get specific session context"""
        
        cursor = await self.connection.execute('''
            SELECT * FROM session_contexts WHERE session_id = ?
        ''', (session_id,))
        
        row = await cursor.fetchone()
        if not row:
            return None
        
        return SessionContext(
            session_id=row['session_id'],
            user_id=row['user_id'],
            persona_id=row['persona_id'],
            last_activity=datetime.fromisoformat(row['last_activity']),
            message_count=row['message_count'],
            key_topics=json.loads(row['key_topics'] or '[]'),
            emotional_tone=row['emotional_tone'] or 'neutral',
            unfinished=bool(row['unfinished']),
            last_user_message=row['last_user_message'] or '',
            last_ai_response=row['last_ai_response'] or '',
            session_summary=row['session_summary'] or ''
        )
    
    async def generate_continuation_prompt(
        self,
        context: SessionContext,
        user_name: str = "there"
    ) -> str:
        """Generate a natural continuation prompt for resuming sessions"""
        
        # Check how recent the last activity was
        time_diff = datetime.now() - context.last_activity
        time_description = self._get_time_description(time_diff)
        
        # Generate context-aware greeting
        if context.key_topics:
            main_topic = context.key_topics[0] if context.key_topics else "our conversation"
            if context.emotional_tone in ['anxiety', 'stress', 'worried']:
                return f"Welcome back, {user_name}. {time_description} we were talking about {main_topic} and you seemed to be working through some challenging feelings. Would you like to continue where we left off?"
            elif context.emotional_tone in ['sad', 'down', 'depressed']:
                return f"Hi {user_name}, good to see you again. {time_description} we were discussing {main_topic} during a difficult moment. How are you feeling now?"
            elif context.emotional_tone in ['excited', 'happy', 'joy']:
                return f"Hello {user_name}! {time_description} we were talking about {main_topic} and you seemed to be in a positive space. Would you like to pick up where we left off?"
            else:
                return f"Welcome back, {user_name}. {time_description} we were exploring {main_topic} together. Shall we continue our conversation?"
        else:
            return f"Hello again, {user_name}. {time_description} we had a meaningful conversation. Would you like to continue where we left off?"
    
    def _get_time_description(self, time_diff: timedelta) -> str:
        """Convert time difference to natural language"""
        
        if time_diff.total_seconds() < 3600:  # Less than 1 hour
            return "Just a little while ago"
        elif time_diff.days < 1:  # Same day
            return "Earlier today"
        elif time_diff.days == 1:  # Yesterday
            return "Yesterday"
        elif time_diff.days < 7:  # This week
            return "A few days ago"
        else:  # Longer ago
            return "Last time we spoke"
    
    async def create_session_thread(
        self,
        session_id: str,
        topic: str,
        start_message_id: int
    ) -> str:
        """Create a new conversation thread within a session"""
        
        thread_id = f"thread_{session_id}_{datetime.now().strftime('%H%M%S')}"
        
        await self.connection.execute('''
            INSERT INTO session_threads 
            (session_id, thread_id, topic, start_message_id)
            VALUES (?, ?, ?, ?)
        ''', (session_id, thread_id, topic, start_message_id))
        await self.connection.commit()
        
        return thread_id
    
    async def finish_session(
        self,
        session_id: str,
        achievements: List[str] = None,
        mood_change: str = '',
        next_steps: List[str] = None
    ) -> Dict[str, Any]:
        """Mark session as finished and generate summary"""
        
        # Mark session as finished
        await self.connection.execute('''
            UPDATE session_contexts 
            SET unfinished = 0 
            WHERE session_id = ?
        ''', (session_id,))
        
        # Get session context for summary
        context = await self.get_session_context(session_id)
        if not context:
            return {"error": "Session not found"}
        
        # Create session summary
        duration_minutes = int((datetime.now() - context.last_activity).total_seconds() / 60)
        
        await self.connection.execute('''
            INSERT INTO session_summaries 
            (session_id, user_id, persona_id, duration_minutes, achievements, mood_change, next_steps)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            session_id,
            context.user_id,
            context.persona_id,
            duration_minutes,
            json.dumps(achievements or []),
            mood_change,
            json.dumps(next_steps or [])
        ))
        await self.connection.commit()
        
        return {
            "session_id": session_id,
            "duration_minutes": duration_minutes,
            "message_count": context.message_count,
            "achievements": achievements or [],
            "mood_change": mood_change,
            "next_steps": next_steps or []
        }
    
    async def get_recent_sessions(
        self,
        user_id: str,
        persona_id: str = None,
        limit: int = 5
    ) -> List[SessionContext]:
        """Get recent sessions for a user"""
        
        if persona_id:
            cursor = await self.connection.execute('''
                SELECT * FROM session_contexts 
                WHERE user_id = ? AND persona_id = ?
                ORDER BY last_activity DESC 
                LIMIT ?
            ''', (user_id, persona_id, limit))
        else:
            cursor = await self.connection.execute('''
                SELECT * FROM session_contexts 
                WHERE user_id = ?
                ORDER BY last_activity DESC 
                LIMIT ?
            ''', (user_id, limit))
        
        rows = await cursor.fetchall()
        sessions = []
        
        for row in rows:
            sessions.append(SessionContext(
                session_id=row['session_id'],
                user_id=row['user_id'],
                persona_id=row['persona_id'],
                last_activity=datetime.fromisoformat(row['last_activity']),
                message_count=row['message_count'],
                key_topics=json.loads(row['key_topics'] or '[]'),
                emotional_tone=row['emotional_tone'] or 'neutral',
                unfinished=bool(row['unfinished']),
                last_user_message=row['last_user_message'] or '',
                last_ai_response=row['last_ai_response'] or '',
                session_summary=row['session_summary'] or ''
            ))
        
        return sessions
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            await self.connection.close()