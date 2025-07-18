"""
Data Pipeline - Comprehensive User Interaction Storage
Handles complete data persistence for AI learning and fine-tuning
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from core.database import Database
from core.llm_client import LLMClient

class DataPipeline:
    """Complete data pipeline for SoulSense user interactions"""
    
    def __init__(self, database: Database, llm_client: LLMClient):
        self.database = database
        self.llm_client = llm_client
        
    async def log_conversation(
        self,
        user_id: str,
        persona_id: str,
        session_id: str,
        user_message: str,
        ai_response: str,
        emotional_context: Dict[str, Any],
        quick_replies: List[Dict[str, Any]],
        features_used: List[str]
    ) -> int:
        """Log complete conversation with all context"""
        
        # Store primary conversation
        conversation_id = await self.database.store_conversation(
            user_id=user_id,
            persona_id=persona_id,
            user_message=user_message,
            ai_response=ai_response,
            emotional_context=emotional_context,
            features_used=features_used,
            session_id=session_id
        )
        
        # Store interaction training data
        await self._store_interaction_training_data(
            user_id=user_id,
            persona_id=persona_id,
            session_id=session_id,
            user_message=user_message,
            ai_response=ai_response,
            emotional_context=emotional_context,
            quick_replies=quick_replies
        )
        
        return conversation_id
    
    async def log_quick_reply_interaction(
        self,
        user_id: str,
        persona_id: str,
        session_id: str,
        user_message: str,
        suggested_replies: List[Dict[str, Any]],
        selected_reply: Optional[Dict[str, Any]] = None,
        time_to_select: Optional[float] = None
    ):
        """Log quick reply interactions for AI learning"""
        
        suggested_replies_json = json.dumps(suggested_replies)
        selected_reply_text = selected_reply.get('text', '') if selected_reply else None
        selected_action_type = selected_reply.get('action_type', '') if selected_reply else None
        selected_action_data = json.dumps(selected_reply.get('action_data', {})) if selected_reply else None
        
        await self.database.connection.execute('''
            INSERT INTO quick_reply_interactions 
            (user_id, persona_id, session_id, user_message, suggested_replies, 
             selected_reply, reply_action_type, reply_action_data, time_to_select_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, persona_id, session_id, user_message, suggested_replies_json,
            selected_reply_text, selected_action_type, selected_action_data, time_to_select
        ))
        
        await self.database.connection.commit()
    
    async def log_mood_checkin(
        self,
        user_id: str,
        persona_id: str,
        session_id: str,
        mood_rating: int,
        emotion_tags: List[str],
        energy_level: int,
        stress_level: int,
        additional_notes: str = "",
        context_activity: str = ""
    ):
        """Log mood check-in data"""
        
        emotion_tags_json = json.dumps(emotion_tags)
        
        await self.database.connection.execute('''
            INSERT INTO mood_checkins 
            (user_id, persona_id, session_id, mood_rating, emotion_tags, 
             energy_level, stress_level, additional_notes, context_activity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, persona_id, session_id, mood_rating, emotion_tags_json,
            energy_level, stress_level, additional_notes, context_activity
        ))
        
        await self.database.connection.commit()
    
    async def generate_and_store_session_summary(
        self,
        session_id: str,
        user_id: str,
        persona_id: str
    ) -> Dict[str, Any]:
        """Generate AI-powered session summary and store it"""
        
        # Get session conversations
        conversations = await self.database.connection.execute('''
            SELECT user_message, ai_response, emotional_context, timestamp 
            FROM conversations 
            WHERE session_id = ? AND user_id = ? AND persona_id = ?
            ORDER BY timestamp ASC
        ''', (session_id, user_id, persona_id))
        
        conversations = await conversations.fetchall()
        
        if not conversations:
            return {}
        
        # Prepare conversation text for summarization
        conversation_text = ""
        emotions_tracked = []
        
        for conv in conversations:
            conversation_text += f"User: {conv['user_message']}\nAI: {conv['ai_response']}\n\n"
            if conv['emotional_context']:
                emotion_data = json.loads(conv['emotional_context'])
                emotions_tracked.append(emotion_data.get('primary_emotion', 'unknown'))
        
        # Generate summary using LLM
        summary_prompt = f"""
        Please provide a therapeutic session summary for this conversation between a user and {persona_id}:

        {conversation_text}

        Include:
        1. Key topics discussed (3-5 bullet points)
        2. Emotional journey (how emotions evolved)
        3. Insights gained by the user
        4. Follow-up suggestions for next session
        5. Overall session effectiveness (1-10 scale)

        Format as JSON with keys: key_topics, emotional_journey, insights_gained, follow_up_suggestions, effectiveness_score
        """
        
        try:
            summary_response = await self.llm_client.generate_response(
                prompt=summary_prompt,
                persona_context={'role': 'session_summarizer'},
                max_tokens=500
            )
            
            summary_data = json.loads(summary_response)
        except:
            # Fallback summary if LLM fails
            summary_data = {
                "key_topics": ["Conversation analysis", "Emotional check-in"],
                "emotional_journey": f"Primary emotions: {', '.join(set(emotions_tracked))}",
                "insights_gained": "Session provided therapeutic support",
                "follow_up_suggestions": "Continue regular check-ins",
                "effectiveness_score": 7.0
            }
        
        # Calculate session metrics
        session_duration = (
            datetime.fromisoformat(conversations[-1]['timestamp']) - 
            datetime.fromisoformat(conversations[0]['timestamp'])
        ).total_seconds() / 60
        
        message_count = len(conversations)
        dominant_emotions = json.dumps(list(set(emotions_tracked)))
        
        # Store session summary
        await self.database.connection.execute('''
            INSERT INTO conversation_summaries 
            (session_id, user_id, persona_id, summary_text, key_topics, 
             emotional_journey, insights_gained, follow_up_suggestions,
             session_duration_minutes, message_count, dominant_emotions, ai_confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            session_id, user_id, persona_id,
            json.dumps(summary_data),
            json.dumps(summary_data.get('key_topics', [])),
            summary_data.get('emotional_journey', ''),
            summary_data.get('insights_gained', ''),
            json.dumps(summary_data.get('follow_up_suggestions', [])),
            int(session_duration),
            message_count,
            dominant_emotions,
            summary_data.get('effectiveness_score', 7.0)
        ))
        
        await self.database.connection.commit()
        
        return summary_data
    
    async def log_journal_with_ai_reflection(
        self,
        user_id: str,
        persona_id: str,
        journal_entry_id: int,
        raw_user_input: str,
        mood: str
    ):
        """Generate and store AI reflection for journal entry"""
        
        reflection_prompt = f"""
        As {persona_id}, provide a compassionate reflection on this journal entry:
        
        Entry: {raw_user_input}
        Mood: {mood}
        
        Provide:
        1. Empathetic reflection (2-3 sentences)
        2. Follow-up questions to encourage deeper reflection
        3. Emotional insights observed
        4. Growth patterns or positive observations
        
        Format as JSON with keys: reflection, follow_up_questions, emotional_insights, growth_indicators
        """
        
        try:
            reflection_response = await self.llm_client.generate_response(
                prompt=reflection_prompt,
                persona_context={'role': persona_id},
                max_tokens=300
            )
            
            reflection_data = json.loads(reflection_response)
        except:
            # Fallback reflection
            reflection_data = {
                "reflection": "Thank you for sharing your thoughts. Your willingness to reflect shows self-awareness.",
                "follow_up_questions": ["How did writing this make you feel?"],
                "emotional_insights": f"Expressing {mood} emotions through writing",
                "growth_indicators": "Engaging in reflective practice"
            }
        
        # Store AI reflection
        await self.database.connection.execute('''
            INSERT INTO journal_reflections 
            (journal_entry_id, user_id, persona_id, raw_user_input, 
             ai_generated_reflection, follow_up_questions, emotional_insights, pattern_observations)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            journal_entry_id, user_id, persona_id, raw_user_input,
            reflection_data.get('reflection', ''),
            json.dumps(reflection_data.get('follow_up_questions', [])),
            reflection_data.get('emotional_insights', ''),
            reflection_data.get('growth_indicators', '')
        ))
        
        await self.database.connection.commit()
        
        return reflection_data
    
    async def _store_interaction_training_data(
        self,
        user_id: str,
        persona_id: str,
        session_id: str,
        user_message: str,
        ai_response: str,
        emotional_context: Dict[str, Any],
        quick_replies: List[Dict[str, Any]]
    ):
        """Store interaction data for AI training and fine-tuning"""
        
        training_context = {
            "user_message_length": len(user_message),
            "ai_response_length": len(ai_response),
            "emotional_intensity": emotional_context.get('intensity', 0.5),
            "emotional_valence": emotional_context.get('valence', 0.0),
            "quick_replies_count": len(quick_replies),
            "quick_reply_types": [r.get('action_type', '') for r in quick_replies],
            "session_context": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.database.connection.execute('''
            INSERT INTO interaction_training_data 
            (user_id, persona_id, session_id, interaction_type, context_data,
             user_input, ai_response, emotional_state_before, emotional_state_after, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, persona_id, session_id, 'conversation',
            json.dumps(training_context),
            user_message, ai_response,
            emotional_context.get('primary_emotion', 'unknown'),
            emotional_context.get('primary_emotion', 'unknown'),  # Updated after response
            json.dumps(quick_replies)
        ))
        
        await self.database.connection.commit()
    
    async def get_user_interaction_history(
        self,
        user_id: str,
        persona_id: Optional[str] = None,
        days_back: int = 30
    ) -> Dict[str, Any]:
        """Get comprehensive user interaction history for AI adaptation"""
        
        date_threshold = datetime.now() - timedelta(days=days_back)
        
        where_clause = "WHERE user_id = ? AND created_at >= ?"
        params = [user_id, date_threshold.isoformat()]
        
        if persona_id:
            where_clause += " AND persona_id = ?"
            params.append(persona_id)
        
        # Get conversation patterns
        conversations = await self.database.connection.execute(f'''
            SELECT * FROM conversations {where_clause} ORDER BY timestamp DESC
        ''', params)
        conversations = await conversations.fetchall()
        
        # Get quick reply patterns
        quick_replies = await self.database.connection.execute(f'''
            SELECT * FROM quick_reply_interactions {where_clause} ORDER BY created_at DESC
        ''', params)
        quick_replies = await quick_replies.fetchall()
        
        # Get mood patterns
        moods = await self.database.connection.execute(f'''
            SELECT * FROM mood_checkins {where_clause} ORDER BY created_at DESC
        ''', params)
        moods = await moods.fetchall()
        
        return {
            "user_id": user_id,
            "persona_id": persona_id,
            "date_range": f"{days_back} days",
            "conversations": [dict(row) for row in conversations],
            "quick_reply_interactions": [dict(row) for row in quick_replies],
            "mood_checkins": [dict(row) for row in moods],
            "summary": {
                "total_conversations": len(conversations),
                "total_quick_replies": len(quick_replies),
                "total_mood_checkins": len(moods),
                "engagement_score": min(10, (len(conversations) + len(quick_replies)) / 10)
            }
        }