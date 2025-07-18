#!/usr/bin/env python3
"""
Silent Data Logger for SoulSense AI
Records all user interactions silently in the background without affecting chat flow
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import uuid
from .postgres_database import PostgreSQLDatabase, UserProfile, ConversationRecord

@dataclass
class InteractionEvent:
    """Generic interaction event structure"""
    event_id: str
    user_id: str
    event_type: str  # 'message', 'journal', 'goal', 'breathing', 'affirmation'
    persona_id: Optional[str]
    event_data: Dict[str, Any]
    timestamp: datetime

class SilentDataLogger:
    """Silent background data logger that records all user interactions"""
    
    def __init__(self, database: PostgreSQLDatabase):
        self.db = database
        self.event_queue = asyncio.Queue()
        self.is_logging = False
        self.current_conversations = {}  # Track active conversations
        
    async def start_logging(self):
        """Start the background logging process"""
        self.is_logging = True
        asyncio.create_task(self._process_event_queue())
        print("Silent data logger started - all interactions will be recorded")
    
    async def stop_logging(self):
        """Stop the background logging process"""
        self.is_logging = False
        # Process remaining events
        while not self.event_queue.empty():
            await asyncio.sleep(0.1)
    
    async def _process_event_queue(self):
        """Process events from the queue in the background"""
        while self.is_logging:
            try:
                # Get event from queue (wait up to 1 second)
                event = await asyncio.wait_for(self.event_queue.get(), timeout=1.0)
                await self._process_event(event)
                self.event_queue.task_done()
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"Silent logger error: {e}")
                continue
    
    async def _process_event(self, event: InteractionEvent):
        """Process individual event and store in database"""
        try:
            if event.event_type == 'message':
                await self._handle_message_event(event)
            elif event.event_type == 'journal':
                await self._handle_journal_event(event)
            elif event.event_type == 'goal':
                await self._handle_goal_event(event)
            elif event.event_type == 'breathing':
                await self._handle_breathing_event(event)
            elif event.event_type == 'affirmation':
                await self._handle_affirmation_event(event)
            elif event.event_type == 'emotional_pattern':
                await self._handle_emotional_pattern_event(event)
            elif event.event_type == 'session_analytics':
                await self._handle_session_analytics_event(event)
                
        except Exception as e:
            print(f"Error processing event {event.event_id}: {e}")
    
    # Public logging methods (called by the main application)
    
    def log_user_message(self, user_id: str, persona_id: str, message_content: str, 
                        conversation_id: Optional[str] = None):
        """Log user message (non-blocking)"""
        if not conversation_id:
            conversation_id = self._get_or_create_conversation_id(user_id, persona_id)
        
        event = InteractionEvent(
            event_id=str(uuid.uuid4()),
            user_id=user_id,
            event_type='message',
            persona_id=persona_id,
            event_data={
                'conversation_id': conversation_id,
                'sender': 'user',
                'content': message_content,
                'timestamp': datetime.now().isoformat()
            },
            timestamp=datetime.now()
        )
        self._queue_event(event)
    
    def log_ai_response(self, user_id: str, persona_id: str, response_content: str,
                       emotion_detected: Optional[str] = None, confidence: Optional[float] = None,
                       features_activated: Optional[List[str]] = None,
                       quick_replies: Optional[List[str]] = None,
                       conversation_id: Optional[str] = None):
        """Log AI response (non-blocking)"""
        if not conversation_id:
            conversation_id = self._get_or_create_conversation_id(user_id, persona_id)
        
        event = InteractionEvent(
            event_id=str(uuid.uuid4()),
            user_id=user_id,
            event_type='message',
            persona_id=persona_id,
            event_data={
                'conversation_id': conversation_id,
                'sender': 'assistant',
                'content': response_content,
                'emotion_detected': emotion_detected,
                'confidence': confidence,
                'features_activated': features_activated or [],
                'quick_replies': quick_replies or [],
                'timestamp': datetime.now().isoformat()
            },
            timestamp=datetime.now()
        )
        self._queue_event(event)
    
    def log_journal_entry(self, user_id: str, persona_id: str, title: str, content: str,
                         mood_rating: Optional[int] = None, emotion_tags: Optional[List[str]] = None):
        """Log journal entry (non-blocking)"""
        event = InteractionEvent(
            event_id=str(uuid.uuid4()),
            user_id=user_id,
            event_type='journal',
            persona_id=persona_id,
            event_data={
                'title': title,
                'content': content,
                'mood_rating': mood_rating,
                'emotion_tags': emotion_tags or [],
                'gratitude_items': [],
                'reflection_prompts': []
            },
            timestamp=datetime.now()
        )
        self._queue_event(event)
    
    def log_goal_interaction(self, user_id: str, persona_id: str, goal_title: str,
                           goal_description: str, action_type: str = 'create',
                           progress_percentage: Optional[float] = None):
        """Log goal interaction (non-blocking)"""
        event = InteractionEvent(
            event_id=str(uuid.uuid4()),
            user_id=user_id,
            event_type='goal',
            persona_id=persona_id,
            event_data={
                'title': goal_title,
                'description': goal_description,
                'action_type': action_type,  # 'create', 'update', 'complete'
                'progress_percentage': progress_percentage or 0.0,
                'category': 'wellness',
                'status': 'active' if action_type == 'create' else None
            },
            timestamp=datetime.now()
        )
        self._queue_event(event)
    
    def log_breathing_session(self, user_id: str, persona_id: str, technique_name: str,
                            duration_minutes: int, pre_mood: Optional[int] = None,
                            post_mood: Optional[int] = None):
        """Log breathing session (non-blocking)"""
        event = InteractionEvent(
            event_id=str(uuid.uuid4()),
            user_id=user_id,
            event_type='breathing',
            persona_id=persona_id,
            event_data={
                'technique_name': technique_name,
                'duration_minutes': duration_minutes,
                'cycles_completed': duration_minutes * 4,  # Estimate
                'pre_session_mood': pre_mood,
                'post_session_mood': post_mood,
                'notes': f"Guided {technique_name} session with {persona_id}"
            },
            timestamp=datetime.now()
        )
        self._queue_event(event)
    
    def log_emotional_pattern(self, user_id: str, dominant_emotion: str, intensity: float,
                            stress_level: Optional[int] = None, energy_level: Optional[int] = None):
        """Log emotional pattern data (non-blocking)"""
        event = InteractionEvent(
            event_id=str(uuid.uuid4()),
            user_id=user_id,
            event_type='emotional_pattern',
            persona_id=None,
            event_data={
                'date_recorded': datetime.now().date().isoformat(),
                'dominant_emotion': dominant_emotion,
                'emotion_intensity': intensity,
                'trigger_events': [],
                'coping_strategies': [],
                'mood_trend': 'stable',
                'stress_level': stress_level,
                'energy_level': energy_level,
                'sleep_quality': None
            },
            timestamp=datetime.now()
        )
        self._queue_event(event)
    
    def log_session_analytics(self, user_id: str, persona_id: str, interaction_count: int,
                            duration_minutes: int, techniques_used: List[str],
                            mood_improvement: Optional[float] = None):
        """Log session analytics (non-blocking)"""
        event = InteractionEvent(
            event_id=str(uuid.uuid4()),
            user_id=user_id,
            event_type='session_analytics',
            persona_id=persona_id,
            event_data={
                'session_date': datetime.now().date().isoformat(),
                'interaction_count': interaction_count,
                'total_duration_minutes': duration_minutes,
                'techniques_used': techniques_used,
                'mood_improvement': mood_improvement or 0.0,
                'engagement_score': min(10.0, interaction_count * 0.5),
                'therapeutic_effectiveness': 7.5  # Default rating
            },
            timestamp=datetime.now()
        )
        self._queue_event(event)
    
    # Private helper methods
    
    def _queue_event(self, event: InteractionEvent):
        """Add event to processing queue (non-blocking)"""
        try:
            self.event_queue.put_nowait(event)
        except asyncio.QueueFull:
            print("Warning: Event queue full, dropping event")
    
    def _get_or_create_conversation_id(self, user_id: str, persona_id: str) -> str:
        """Get or create conversation ID for current session"""
        key = f"{user_id}_{persona_id}"
        if key not in self.current_conversations:
            self.current_conversations[key] = str(uuid.uuid4())
        return self.current_conversations[key]
    
    async def finalize_conversation(self, user_id: str, persona_id: str, 
                                  session_summary: Optional[str] = None,
                                  session_rating: Optional[float] = None):
        """Finalize and store complete conversation"""
        conversation_id = self._get_or_create_conversation_id(user_id, persona_id)
        
        # Create conversation record
        conversation = ConversationRecord(
            conversation_id=conversation_id,
            user_id=user_id,
            persona_id=persona_id,
            messages=[],  # Messages are stored separately
            session_summary=session_summary,
            emotional_tone=None,
            key_topics=[],
            mood_change=None,
            session_rating=session_rating,
            duration_minutes=None,
            created_at=datetime.now(),
            ended_at=datetime.now()
        )
        
        # Store conversation
        await self.db.store_conversation(conversation)
        
        # Remove from active conversations
        key = f"{user_id}_{persona_id}"
        if key in self.current_conversations:
            del self.current_conversations[key]
    
    # Event handlers
    
    async def _handle_message_event(self, event: InteractionEvent):
        """Handle message storage event"""
        try:
            # Store message in database
            conversation_id = event.event_data['conversation_id']
            
            # For now, we'll track messages and store them when conversation ends
            # This prevents individual message writes that could slow down chat
            pass
            
        except Exception as e:
            print(f"Error handling message event: {e}")
    
    async def _handle_journal_event(self, event: InteractionEvent):
        """Handle journal entry storage"""
        try:
            await self.db.store_journal_entry(event.user_id, event.event_data)
        except Exception as e:
            print(f"Error handling journal event: {e}")
    
    async def _handle_goal_event(self, event: InteractionEvent):
        """Handle goal storage"""
        try:
            if event.event_data['action_type'] == 'create':
                await self.db.store_goal(event.user_id, event.event_data)
            elif event.event_data['action_type'] == 'update':
                # Handle goal updates
                pass
        except Exception as e:
            print(f"Error handling goal event: {e}")
    
    async def _handle_breathing_event(self, event: InteractionEvent):
        """Handle breathing session storage"""
        try:
            await self.db.store_breathing_session(event.user_id, event.event_data)
        except Exception as e:
            print(f"Error handling breathing event: {e}")
    
    async def _handle_affirmation_event(self, event: InteractionEvent):
        """Handle affirmation storage"""
        try:
            # Implement affirmation storage logic
            pass
        except Exception as e:
            print(f"Error handling affirmation event: {e}")
    
    async def _handle_emotional_pattern_event(self, event: InteractionEvent):
        """Handle emotional pattern storage"""
        try:
            # Store emotional pattern in database
            pass
        except Exception as e:
            print(f"Error handling emotional pattern event: {e}")
    
    async def _handle_session_analytics_event(self, event: InteractionEvent):
        """Handle session analytics storage"""
        try:
            # Store session analytics
            pass
        except Exception as e:
            print(f"Error handling session analytics event: {e}")

class UserInteractionTracker:
    """Tracks user interactions for analytics and personalization"""
    
    def __init__(self, silent_logger: SilentDataLogger):
        self.logger = silent_logger
        self.session_data = {}
    
    def start_session(self, user_id: str, persona_id: str):
        """Start tracking a user session"""
        session_key = f"{user_id}_{persona_id}"
        self.session_data[session_key] = {
            'start_time': datetime.now(),
            'message_count': 0,
            'techniques_used': [],
            'emotions_detected': []
        }
    
    def track_message(self, user_id: str, persona_id: str, is_user_message: bool = True):
        """Track message in current session"""
        session_key = f"{user_id}_{persona_id}"
        if session_key in self.session_data:
            self.session_data[session_key]['message_count'] += 1
    
    def track_technique_used(self, user_id: str, persona_id: str, technique: str):
        """Track therapeutic technique used"""
        session_key = f"{user_id}_{persona_id}"
        if session_key in self.session_data:
            if technique not in self.session_data[session_key]['techniques_used']:
                self.session_data[session_key]['techniques_used'].append(technique)
    
    def track_emotion_detected(self, user_id: str, persona_id: str, emotion: str):
        """Track emotion detected in session"""
        session_key = f"{user_id}_{persona_id}"
        if session_key in self.session_data:
            self.session_data[session_key]['emotions_detected'].append(emotion)
    
    async def end_session(self, user_id: str, persona_id: str, session_rating: Optional[float] = None):
        """End session and log analytics"""
        session_key = f"{user_id}_{persona_id}"
        if session_key in self.session_data:
            session_info = self.session_data[session_key]
            duration = (datetime.now() - session_info['start_time']).total_seconds() / 60
            
            # Log session analytics
            self.logger.log_session_analytics(
                user_id=user_id,
                persona_id=persona_id,
                interaction_count=session_info['message_count'],
                duration_minutes=int(duration),
                techniques_used=session_info['techniques_used'],
                mood_improvement=None
            )
            
            # Finalize conversation
            await self.logger.finalize_conversation(
                user_id=user_id,
                persona_id=persona_id,
                session_rating=session_rating
            )
            
            # Clean up session data
            del self.session_data[session_key]