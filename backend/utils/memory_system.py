"""
Memory system for conversation context and continuity
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from db.models import MessageModel, ConversationModel


class MemorySystem:
    """Manages conversation memory and context"""
    
    def __init__(self):
        self.max_context_messages = 10
    
    async def get_conversation_context(
        self,
        db: AsyncSession,
        conversation_id: int,
        persona_id: str,
        limit: int = None
    ) -> str:
        """Get recent conversation context"""
        try:
            limit = limit or self.max_context_messages
            
            # Get recent messages
            result = await db.execute(
                select(MessageModel)
                .where(MessageModel.conversation_id == conversation_id)
                .order_by(desc(MessageModel.timestamp))
                .limit(limit)
            )
            messages = result.scalars().all()
            
            if not messages:
                return ""
            
            # Format context
            context_lines = []
            for msg in reversed(messages):
                sender = "User" if msg.sender == "user" else persona_id.title()
                context_lines.append(f"{sender}: {msg.content}")
            
            return "\n".join(context_lines[-5:])  # Last 5 messages
            
        except Exception as e:
            print(f"Memory system error: {e}")
            return ""
    
    async def get_user_patterns(
        self,
        db: AsyncSession,
        user_id: str,
        persona_id: str
    ) -> Dict[str, Any]:
        """Get user interaction patterns with persona"""
        try:
            # Get all conversations with this persona
            result = await db.execute(
                select(ConversationModel)
                .where(
                    ConversationModel.user_id == user_id,
                    ConversationModel.persona_id == persona_id
                )
            )
            conversations = result.scalars().all()
            
            patterns = {
                "total_conversations": len(conversations),
                "common_topics": [],
                "typical_session_length": 0,
                "preferred_interaction_style": "casual"
            }
            
            return patterns
            
        except Exception as e:
            print(f"Pattern analysis error: {e}")
            return {}
    
    async def save_session_summary(
        self,
        db: AsyncSession,
        conversation_id: int,
        summary: str,
        key_topics: List[str],
        emotion_analysis: Dict[str, Any]
    ):
        """Save session summary for future reference"""
        try:
            # Implementation would save to session summaries table
            pass
        except Exception as e:
            print(f"Summary save error: {e}")