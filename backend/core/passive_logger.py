"""
Passive Logger - Silent Background Data Capture
Logs all user interactions without affecting the real-time chat experience
"""

import asyncio
import aiosqlite
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import os

class PassiveLogger:
    """Silent background logger for SoulSense AI interactions"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self.connection = None
        self.log_queue = asyncio.Queue()
        self.is_running = False
        
    async def initialize(self):
        """Initialize passive logging system"""
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        
        await self._create_logging_tables()
        
        # Start background logging task
        self.is_running = True
        asyncio.create_task(self._background_logger())
        
    async def _create_logging_tables(self):
        """Create tables for passive data logging"""
        
        # Conversation logs - every message exchange
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS conversation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id TEXT,
                persona_id TEXT NOT NULL,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                emotional_context TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message_index INTEGER
            )
        ''')
        
        # Session summary logs - auto-generated after sessions
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS summary_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id TEXT,
                persona_id TEXT NOT NULL,
                summary_text TEXT,
                key_topics TEXT,
                emotional_tone TEXT,
                message_count INTEGER,
                session_duration_minutes INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Diary/Journal logs - all journal entries
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS diary_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                persona_id TEXT,
                entry_content TEXT NOT NULL,
                mood_rating TEXT,
                emotion_tags TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Goal tracking logs - all goal interactions
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS goal_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                persona_id TEXT,
                goal_title TEXT,
                goal_description TEXT,
                goal_category TEXT,
                action_type TEXT,
                progress_value REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Breathing/Wellness logs - all wellness activities
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS wellness_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                persona_id TEXT,
                activity_type TEXT NOT NULL,
                activity_data TEXT,
                duration_seconds INTEGER,
                effectiveness_rating INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Quick interaction logs - all quick replies and UI interactions
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS interaction_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                persona_id TEXT,
                session_id TEXT,
                interaction_type TEXT NOT NULL,
                interaction_data TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await self.connection.commit()
    
    async def _background_logger(self):
        """Background task that processes the logging queue"""
        while self.is_running:
            try:
                # Process queued log entries
                log_entry = await asyncio.wait_for(self.log_queue.get(), timeout=1.0)
                await self._process_log_entry(log_entry)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                # Silent failure - don't disrupt user experience
                pass
    
    async def _process_log_entry(self, log_entry: Dict[str, Any]):
        """Process individual log entry"""
        try:
            table = log_entry['table']
            data = log_entry['data']
            
            if table == 'conversation_logs':
                await self._log_conversation(data)
            elif table == 'summary_logs':
                await self._log_summary(data)
            elif table == 'diary_logs':
                await self._log_diary(data)
            elif table == 'goal_logs':
                await self._log_goal(data)
            elif table == 'wellness_logs':
                await self._log_wellness(data)
            elif table == 'interaction_logs':
                await self._log_interaction(data)
                
        except Exception:
            # Silent failure
            pass
    
    async def _log_conversation(self, data: Dict[str, Any]):
        """Log conversation exchange"""
        await self.connection.execute('''
            INSERT INTO conversation_logs 
            (session_id, user_id, persona_id, user_message, ai_response, emotional_context, message_index)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('session_id'),
            data.get('user_id'),
            data.get('persona_id'),
            data.get('user_message'),
            data.get('ai_response'),
            json.dumps(data.get('emotional_context', {})),
            data.get('message_index', 0)
        ))
        await self.connection.commit()
    
    async def _log_summary(self, data: Dict[str, Any]):
        """Log session summary"""
        await self.connection.execute('''
            INSERT INTO summary_logs 
            (session_id, user_id, persona_id, summary_text, key_topics, emotional_tone, message_count, session_duration_minutes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('session_id'),
            data.get('user_id'),
            data.get('persona_id'),
            data.get('summary_text'),
            json.dumps(data.get('key_topics', [])),
            data.get('emotional_tone'),
            data.get('message_count', 0),
            data.get('session_duration_minutes', 0)
        ))
        await self.connection.commit()
    
    async def _log_diary(self, data: Dict[str, Any]):
        """Log diary/journal entry"""
        await self.connection.execute('''
            INSERT INTO diary_logs 
            (user_id, persona_id, entry_content, mood_rating, emotion_tags)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data.get('user_id'),
            data.get('persona_id'),
            data.get('entry_content'),
            data.get('mood_rating'),
            json.dumps(data.get('emotion_tags', []))
        ))
        await self.connection.commit()
    
    async def _log_goal(self, data: Dict[str, Any]):
        """Log goal interaction"""
        await self.connection.execute('''
            INSERT INTO goal_logs 
            (user_id, persona_id, goal_title, goal_description, goal_category, action_type, progress_value)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('user_id'),
            data.get('persona_id'),
            data.get('goal_title'),
            data.get('goal_description'),
            data.get('goal_category'),
            data.get('action_type'),
            data.get('progress_value', 0.0)
        ))
        await self.connection.commit()
    
    async def _log_wellness(self, data: Dict[str, Any]):
        """Log wellness activity"""
        await self.connection.execute('''
            INSERT INTO wellness_logs 
            (user_id, persona_id, activity_type, activity_data, duration_seconds, effectiveness_rating)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data.get('user_id'),
            data.get('persona_id'),
            data.get('activity_type'),
            json.dumps(data.get('activity_data', {})),
            data.get('duration_seconds', 0),
            data.get('effectiveness_rating', 0)
        ))
        await self.connection.commit()
    
    async def _log_interaction(self, data: Dict[str, Any]):
        """Log UI interaction"""
        await self.connection.execute('''
            INSERT INTO interaction_logs 
            (user_id, persona_id, session_id, interaction_type, interaction_data)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data.get('user_id'),
            data.get('persona_id'),
            data.get('session_id'),
            data.get('interaction_type'),
            json.dumps(data.get('interaction_data', {}))
        ))
        await self.connection.commit()
    
    # Public methods for logging (non-blocking)
    
    def log_conversation_async(
        self,
        session_id: str,
        user_id: str,
        persona_id: str,
        user_message: str,
        ai_response: str,
        emotional_context: Dict[str, Any] = None,
        message_index: int = 0
    ):
        """Queue conversation for logging (non-blocking)"""
        log_entry = {
            'table': 'conversation_logs',
            'data': {
                'session_id': session_id,
                'user_id': user_id,
                'persona_id': persona_id,
                'user_message': user_message,
                'ai_response': ai_response,
                'emotional_context': emotional_context or {},
                'message_index': message_index
            }
        }
        try:
            self.log_queue.put_nowait(log_entry)
        except:
            pass  # Silent failure
    
    def log_session_summary_async(
        self,
        session_id: str,
        user_id: str,
        persona_id: str,
        summary_text: str,
        key_topics: List[str] = None,
        emotional_tone: str = '',
        message_count: int = 0,
        session_duration_minutes: int = 0
    ):
        """Queue session summary for logging (non-blocking)"""
        log_entry = {
            'table': 'summary_logs',
            'data': {
                'session_id': session_id,
                'user_id': user_id,
                'persona_id': persona_id,
                'summary_text': summary_text,
                'key_topics': key_topics or [],
                'emotional_tone': emotional_tone,
                'message_count': message_count,
                'session_duration_minutes': session_duration_minutes
            }
        }
        try:
            self.log_queue.put_nowait(log_entry)
        except:
            pass
    
    def log_diary_entry_async(
        self,
        user_id: str,
        persona_id: str,
        entry_content: str,
        mood_rating: str = '',
        emotion_tags: List[str] = None
    ):
        """Queue diary entry for logging (non-blocking)"""
        log_entry = {
            'table': 'diary_logs',
            'data': {
                'user_id': user_id,
                'persona_id': persona_id,
                'entry_content': entry_content,
                'mood_rating': mood_rating,
                'emotion_tags': emotion_tags or []
            }
        }
        try:
            self.log_queue.put_nowait(log_entry)
        except:
            pass
    
    def log_goal_interaction_async(
        self,
        user_id: str,
        persona_id: str,
        goal_title: str,
        goal_description: str = '',
        goal_category: str = '',
        action_type: str = 'create',
        progress_value: float = 0.0
    ):
        """Queue goal interaction for logging (non-blocking)"""
        log_entry = {
            'table': 'goal_logs',
            'data': {
                'user_id': user_id,
                'persona_id': persona_id,
                'goal_title': goal_title,
                'goal_description': goal_description,
                'goal_category': goal_category,
                'action_type': action_type,
                'progress_value': progress_value
            }
        }
        try:
            self.log_queue.put_nowait(log_entry)
        except:
            pass
    
    def log_wellness_activity_async(
        self,
        user_id: str,
        persona_id: str,
        activity_type: str,
        activity_data: Dict[str, Any] = None,
        duration_seconds: int = 0,
        effectiveness_rating: int = 0
    ):
        """Queue wellness activity for logging (non-blocking)"""
        log_entry = {
            'table': 'wellness_logs',
            'data': {
                'user_id': user_id,
                'persona_id': persona_id,
                'activity_type': activity_type,
                'activity_data': activity_data or {},
                'duration_seconds': duration_seconds,
                'effectiveness_rating': effectiveness_rating
            }
        }
        try:
            self.log_queue.put_nowait(log_entry)
        except:
            pass
    
    def log_interaction_async(
        self,
        user_id: str,
        persona_id: str,
        session_id: str,
        interaction_type: str,
        interaction_data: Dict[str, Any] = None
    ):
        """Queue UI interaction for logging (non-blocking)"""
        log_entry = {
            'table': 'interaction_logs',
            'data': {
                'user_id': user_id,
                'persona_id': persona_id,
                'session_id': session_id,
                'interaction_type': interaction_type,
                'interaction_data': interaction_data or {}
            }
        }
        try:
            self.log_queue.put_nowait(log_entry)
        except:
            pass
    
    async def close(self):
        """Clean shutdown"""
        self.is_running = False
        if self.connection:
            await self.connection.close()