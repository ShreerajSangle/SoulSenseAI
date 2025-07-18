"""
Memory System - Conversation Memory and Context Management
Handles persona-specific memory storage, retrieval, and filtering
"""

import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from models.schemas import EmotionalContext, PersonaType

class MemorySystem:
    """Advanced memory system for persona-specific conversation context"""
    
    def __init__(self):
        # In-memory storage for conversation context
        self.user_memories: Dict[str, Dict[str, Any]] = {}
        self.conversation_summaries: Dict[str, List[Dict[str, Any]]] = {}
        self.emotional_patterns: Dict[str, List[Dict[str, Any]]] = {}
        
        # Memory retention settings
        self.max_memory_items = 100
        self.memory_retention_days = 30
        
        # Persona-specific memory weights
        self.persona_memory_weights = {
            PersonaType.MAYA: {
                "spiritual_practices": 1.0,
                "breathing_sessions": 0.9,
                "meditation_experiences": 0.8,
                "chakra_work": 0.7,
                "emotional_patterns": 0.6
            },
            PersonaType.SARAH: {
                "therapeutic_progress": 1.0,
                "breakthrough_moments": 0.9,
                "coping_strategies": 0.8,
                "emotional_insights": 0.7,
                "thought_patterns": 0.6
            },
            PersonaType.ALEX: {
                "friendship_moments": 1.0,
                "shared_experiences": 0.9,
                "humor_preferences": 0.8,
                "mood_lifts": 0.7,
                "supportive_interactions": 0.6
            },
            PersonaType.MARCUS: {
                "achievement_goals": 1.0,
                "progress_milestones": 0.9,
                "action_steps": 0.8,
                "motivation_triggers": 0.7,
                "habit_formation": 0.6
            }
        }
    
    async def get_conversation_memory(self, user_id: str, persona_id: str) -> Dict[str, Any]:
        """Get persona-specific conversation memory for user"""
        
        memory_key = f"{user_id}_{persona_id}"
        
        if memory_key not in self.user_memories:
            self.user_memories[memory_key] = {
                "user_id": user_id,
                "persona_id": persona_id,
                "created_at": datetime.now().isoformat(),
                "last_accessed": datetime.now().isoformat(),
                "memory_items": {},
                "conversation_context": [],
                "emotional_history": [],
                "key_insights": [],
                "persona_specific_data": {}
            }
        
        # Update last accessed
        self.user_memories[memory_key]["last_accessed"] = datetime.now().isoformat()
        
        # Clean old memories
        await self._cleanup_old_memories(memory_key)
        
        return self.user_memories[memory_key]
    
    async def update_memory(
        self,
        user_id: str,
        persona_id: str,
        user_message: str,
        ai_response: str,
        emotional_context: EmotionalContext,
        memory_rules: List[str]
    ):
        """Update persona-specific memory with conversation data"""
        
        memory_key = f"{user_id}_{persona_id}"
        memory = await self.get_conversation_memory(user_id, persona_id)
        
        # Create memory item
        memory_item = {
            "timestamp": datetime.now().isoformat(),
            "user_message": user_message,
            "ai_response": ai_response,
            "emotional_context": {
                "primary_emotion": emotional_context.primary_emotion.value,
                "intensity": emotional_context.intensity,
                "valence": emotional_context.valence,
                "arousal": emotional_context.arousal,
                "triggers": emotional_context.emotional_triggers,
                "support_needs": emotional_context.support_needs
            },
            "memory_type": "conversation",
            "importance_score": self._calculate_importance_score(
                emotional_context, user_message, ai_response
            )
        }
        
        # Add to conversation context
        memory["conversation_context"].append(memory_item)
        
        # Update emotional history
        memory["emotional_history"].append({
            "timestamp": datetime.now().isoformat(),
            "emotion": emotional_context.primary_emotion.value,
            "intensity": emotional_context.intensity,
            "context": user_message[:100]  # First 100 chars for context
        })
        
        # Extract and store persona-specific memories
        await self._extract_persona_memories(memory, user_message, ai_response, persona_id, memory_rules)
        
        # Update memory statistics
        await self._update_memory_stats(memory_key, emotional_context)
        
        # Maintain memory size limits
        await self._maintain_memory_limits(memory_key)
    
    async def _extract_persona_memories(
        self,
        memory: Dict[str, Any],
        user_message: str,
        ai_response: str,
        persona_id: str,
        memory_rules: List[str]
    ):
        """Extract persona-specific memories based on memory rules"""
        
        try:
            persona_type = PersonaType(persona_id)
        except ValueError:
            return
        
        message_lower = user_message.lower()
        response_lower = ai_response.lower()
        
        # Get persona-specific memory patterns
        if persona_type not in self.persona_memory_weights:
            return
        
        memory_weights = self.persona_memory_weights[persona_type]
        
        # Extract memories based on rules
        for rule in memory_rules:
            if rule in memory_weights:
                extracted_memory = self._extract_memory_by_rule(
                    rule, user_message, ai_response, message_lower, response_lower
                )
                
                if extracted_memory:
                    if rule not in memory["memory_items"]:
                        memory["memory_items"][rule] = []
                    
                    memory["memory_items"][rule].append({
                        "timestamp": datetime.now().isoformat(),
                        "content": extracted_memory,
                        "weight": memory_weights[rule],
                        "source": "conversation"
                    })
    
    def _extract_memory_by_rule(
        self,
        rule: str,
        user_message: str,
        ai_response: str,
        message_lower: str,
        response_lower: str
    ) -> Optional[str]:
        """Extract memory content based on specific rule"""
        
        rule_patterns = {
            "spiritual_practices": [
                "meditation", "yoga", "breathe", "chakra", "mantra", "spiritual"
            ],
            "breathing_sessions": [
                "breath", "breathing", "inhale", "exhale", "pranayama"
            ],
            "therapeutic_progress": [
                "better", "improvement", "progress", "healing", "breakthrough"
            ],
            "coping_strategies": [
                "cope", "manage", "handle", "deal with", "strategy", "technique"
            ],
            "friendship_moments": [
                "friend", "support", "understand", "relate", "care", "help"
            ],
            "achievement_goals": [
                "goal", "achieve", "accomplish", "target", "objective", "success"
            ],
            "emotional_patterns": [
                "feel", "emotion", "mood", "anxiety", "sad", "happy", "stressed"
            ]
        }
        
        if rule in rule_patterns:
            patterns = rule_patterns[rule]
            for pattern in patterns:
                if pattern in message_lower or pattern in response_lower:
                    # Extract relevant context
                    context_parts = []
                    if pattern in message_lower:
                        context_parts.append(f"User: {user_message}")
                    if pattern in response_lower:
                        context_parts.append(f"AI: {ai_response}")
                    
                    return " | ".join(context_parts)[:200]  # Limit length
        
        return None
    
    def _calculate_importance_score(
        self,
        emotional_context: EmotionalContext,
        user_message: str,
        ai_response: str
    ) -> float:
        """Calculate importance score for memory item"""
        
        base_score = 0.5
        
        # Emotional intensity affects importance
        base_score += emotional_context.intensity * 0.3
        
        # Crisis indicators make memories very important
        if emotional_context.crisis_indicators:
            base_score += 0.4
        
        # Breakthrough moments or insights
        breakthrough_keywords = ["realize", "understand", "breakthrough", "insight", "clarity"]
        if any(keyword in user_message.lower() or keyword in ai_response.lower() 
               for keyword in breakthrough_keywords):
            base_score += 0.3
        
        # Strong emotional states
        if emotional_context.primary_emotion in ["hopeful", "grateful", "breakthrough"]:
            base_score += 0.2
        
        return min(base_score, 1.0)
    
    async def _update_memory_stats(self, memory_key: str, emotional_context: EmotionalContext):
        """Update memory statistics and patterns"""
        
        if memory_key not in self.user_memories:
            return
        
        memory = self.user_memories[memory_key]
        
        # Update emotional patterns
        if "emotional_patterns" not in memory:
            memory["emotional_patterns"] = {}
        
        emotion = emotional_context.primary_emotion.value
        if emotion not in memory["emotional_patterns"]:
            memory["emotional_patterns"][emotion] = {"count": 0, "total_intensity": 0.0}
        
        memory["emotional_patterns"][emotion]["count"] += 1
        memory["emotional_patterns"][emotion]["total_intensity"] += emotional_context.intensity
        
        # Update session count
        if "session_stats" not in memory:
            memory["session_stats"] = {"total_sessions": 0, "last_session": None}
        
        memory["session_stats"]["total_sessions"] += 1
        memory["session_stats"]["last_session"] = datetime.now().isoformat()
    
    async def _cleanup_old_memories(self, memory_key: str):
        """Remove old memories beyond retention period"""
        
        if memory_key not in self.user_memories:
            return
        
        memory = self.user_memories[memory_key]
        cutoff_date = datetime.now() - timedelta(days=self.memory_retention_days)
        
        # Clean conversation context
        memory["conversation_context"] = [
            item for item in memory["conversation_context"]
            if datetime.fromisoformat(item["timestamp"]) > cutoff_date
        ]
        
        # Clean emotional history
        memory["emotional_history"] = [
            item for item in memory["emotional_history"]
            if datetime.fromisoformat(item["timestamp"]) > cutoff_date
        ]
    
    async def _maintain_memory_limits(self, memory_key: str):
        """Maintain memory within size limits"""
        
        if memory_key not in self.user_memories:
            return
        
        memory = self.user_memories[memory_key]
        
        # Limit conversation context
        if len(memory["conversation_context"]) > self.max_memory_items:
            # Keep most important memories
            memory["conversation_context"].sort(
                key=lambda x: x.get("importance_score", 0.5), reverse=True
            )
            memory["conversation_context"] = memory["conversation_context"][:self.max_memory_items]
        
        # Limit emotional history
        if len(memory["emotional_history"]) > self.max_memory_items:
            memory["emotional_history"] = memory["emotional_history"][-self.max_memory_items:]
    
    async def get_memory_summary(self, user_id: str, persona_id: str) -> Dict[str, Any]:
        """Get summary of user's memory with persona"""
        
        memory = await self.get_conversation_memory(user_id, persona_id)
        
        # Calculate emotional patterns
        emotional_summary = {}
        if "emotional_patterns" in memory:
            for emotion, data in memory["emotional_patterns"].items():
                emotional_summary[emotion] = {
                    "frequency": data["count"],
                    "average_intensity": data["total_intensity"] / data["count"] if data["count"] > 0 else 0
                }
        
        # Get recent key insights
        recent_insights = []
        for item in memory["conversation_context"][-10:]:  # Last 10 conversations
            if item.get("importance_score", 0) > 0.7:
                recent_insights.append({
                    "timestamp": item["timestamp"],
                    "insight": item["ai_response"][:100],
                    "importance": item["importance_score"]
                })
        
        return {
            "user_id": user_id,
            "persona_id": persona_id,
            "total_conversations": len(memory["conversation_context"]),
            "emotional_patterns": emotional_summary,
            "recent_insights": recent_insights,
            "session_stats": memory.get("session_stats", {}),
            "memory_created": memory.get("created_at"),
            "last_interaction": memory.get("last_accessed")
        }
    
    async def clear_user_memory(self, user_id: str, persona_id: Optional[str] = None):
        """Clear user memory for specific persona or all personas"""
        
        if persona_id:
            memory_key = f"{user_id}_{persona_id}"
            if memory_key in self.user_memories:
                del self.user_memories[memory_key]
        else:
            # Clear all memories for user
            keys_to_remove = [key for key in self.user_memories.keys() 
                            if key.startswith(f"{user_id}_")]
            for key in keys_to_remove:
                del self.user_memories[key]
    
    async def get_all_user_memories(self, user_id: str) -> Dict[str, Any]:
        """Get all memories for a user across all personas"""
        
        user_memories = {}
        
        for persona in PersonaType:
            memory = await self.get_conversation_memory(user_id, persona.value)
            if memory["conversation_context"]:  # Only include if has conversations
                user_memories[persona.value] = await self.get_memory_summary(user_id, persona.value)
        
        return user_memories