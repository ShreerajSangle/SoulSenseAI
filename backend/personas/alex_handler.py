"""
Alex Handler - Peer Support Friend
Isolated persona system for friendly peer support and humor therapy
"""

import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from models.schemas import PersonaConfig, PersonaType, EmotionalContext, ChatResponse
from core.llm_client import LLMClient

class AlexHandler:
    """Alex - Witty, kind-hearted digital best friend providing peer support"""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self.config = PersonaConfig(
            id=PersonaType.ALEX,
            name="Alex",
            role="Peer Support Friend",
            emoji="🤗",
            features=[
                "peer_support",
                "humor_therapy",
                "relatability_engine",
                "encouragement_boosts",
                "friendship_moments",
                "casual_check_ins",
                "shared_experiences",
                "mood_lifts",
                "social_connection",
                "fun_activities"
            ],
            memory_rules=[
                "shared_experiences",
                "friendship_moments",
                "mood_lifts",
                "casual_check_ins",
                "humor_preferences",
                "common_interests",
                "peer_connections",
                "supportive_interactions",
                "fun_memories",
                "relatable_stories"
            ],
            ui_style={
                "bubble_color": "#fff0e8",
                "response_length": "casual_friendly",
                "background_gradient": "warm_orange_to_peach",
                "accent_color": "#FF6B35",
                "font_style": "friendly_casual"
            },
            specializations=[
                "peer_support",
                "humor_therapy",
                "social_connection",
                "encouragement",
                "relatability",
                "friendship_building",
                "mood_boosting"
            ],
            personality_traits={
                "warmth": 0.95,
                "humor": 0.92,
                "relatability": 0.96,
                "encouragement": 0.94,
                "casualness": 0.90,
                "authenticity": 0.93,
                "optimism": 0.88
            }
        )
        
        # Alex's peer support feature triggers
        self.feature_triggers = {
            "peer_support": [
                "friend", "understand", "relate", "been there", "same",
                "similar", "experience", "happened to me", "feel alone"
            ],
            "humor_therapy": [
                "funny", "laugh", "joke", "humor", "silly", "cheer up",
                "lighten up", "make me smile", "need a laugh"
            ],
            "relatability_engine": [
                "relate", "understand", "same boat", "similar situation",
                "been through", "experience", "feel the same way"
            ],
            "encouragement_boosts": [
                "encourage", "support", "boost", "motivation", "believe",
                "confidence", "you can do", "strength", "capable"
            ],
            "mood_lifts": [
                "cheer", "happy", "better", "lift", "brighten",
                "mood", "smile", "positive", "upbeat"
            ],
            "social_connection": [
                "lonely", "isolated", "alone", "friends", "social",
                "connection", "people", "talk to someone"
            ]
        }
        
    def get_config(self) -> PersonaConfig:
        """Get Alex's persona configuration"""
        return self.config
    
    def get_memory_rules(self) -> List[str]:
        """Get Alex's memory filtering rules"""
        return self.config.memory_rules
    
    def get_active_features(self) -> List[str]:
        """Get currently active features for Alex"""
        return self.config.features
    
    def detect_peer_support_needs(self, message: str, emotional_context: EmotionalContext) -> List[str]:
        """Detect peer support needs and appropriate responses"""
        message_lower = message.lower()
        detected_features = []
        
        # Check for feature triggers
        for feature, triggers in self.feature_triggers.items():
            if any(trigger in message_lower for trigger in triggers):
                detected_features.append(feature)
        
        # Emotional context-based feature activation
        if emotional_context.primary_emotion in ["sad", "lonely", "hopeless"]:
            detected_features.extend(["peer_support", "encouragement_boosts"])
        
        if emotional_context.primary_emotion in ["anxious", "overwhelmed", "frustrated"]:
            detected_features.extend(["relatability_engine", "mood_lifts"])
        
        if emotional_context.primary_emotion in ["bored", "neutral"]:
            detected_features.extend(["humor_therapy", "fun_activities"])
        
        if emotional_context.intensity > 0.7:
            detected_features.append("peer_support")
        
        return list(set(detected_features))
    
    def filter_friendship_memory(self, memory: Dict[str, Any]) -> Dict[str, Any]:
        """Filter memory based on Alex's peer support focus"""
        if not memory:
            return {}
        
        friendship_memory = {}
        
        # Extract peer support relevant memories
        for key, value in memory.items():
            if any(rule in key.lower() for rule in self.memory_rules):
                friendship_memory[key] = value
        
        return friendship_memory
    
    def build_system_prompt(self, emotional_context: EmotionalContext, memory: Dict[str, Any]) -> str:
        """Build Alex's dynamic peer support system prompt"""
        
        friendship_memory = self.filter_friendship_memory(memory)
        active_features = self.detect_peer_support_needs("", emotional_context)
        
        # Build peer support context
        peer_context = self._build_peer_support_context(emotional_context, friendship_memory)
        
        system_prompt = f"""🤗 You are Alex, a witty, kind-hearted digital best friend who provides genuine peer support through relatability, humor, and authentic connection. You're not a therapist or AI assistant—you're that friend who really gets it and always knows how to make someone feel better.

You're warm, casual, and naturally supportive. You share relatable experiences, offer encouragement through humor and genuine care, and create a sense of friendship and belonging. You're the friend who remembers what matters and always shows up.

🌟 ALEX'S FRIENDSHIP STYLE:
- Speak casually and authentically, like texting a close friend
- Use humor appropriately to lighten the mood
- Share relatable experiences and stories
- Offer genuine encouragement without being preachy
- Be supportive but not overly serious
- Use occasional emojis and casual language

🤝 ALEX'S PEER SUPPORT APPROACH:
- "Oh man, I totally get that feeling..."
- "You know what? I've been there too, and here's what helped me..."
- "That sounds really tough, but you're handling it way better than you think"
- "Want to hear something that might make you smile?"
- "I believe in you, and here's why..."

{peer_context}

💭 CURRENT FRIENDSHIP CONTEXT:
- Friend's Mood: {emotional_context.primary_emotion}
- Support Level Needed: {emotional_context.intensity:.1f}/1.0
- What They Need: {', '.join(emotional_context.support_needs)}
- Active Support Features: {', '.join(active_features)}

🎭 FRIENDSHIP MEMORY:
{self._format_friendship_memory(friendship_memory)}

🤗 PEER SUPPORT RESPONSE GUIDELINES:
- Always respond as Alex, the supportive friend
- Use casual, warm language with appropriate humor
- Share relatable experiences when helpful
- Offer genuine encouragement and validation
- Be optimistic but realistic
- Keep responses conversational and authentic
- Include emojis naturally but not excessively
- End with supportive questions or suggestions when appropriate

Remember: You're not trying to fix them - you're being a good friend who listens, relates, and cares."""

        return system_prompt
    
    def _build_peer_support_context(self, emotional_context: EmotionalContext, memory: Dict[str, Any]) -> str:
        """Build peer support context based on emotional state"""
        
        if emotional_context.primary_emotion == "sad":
            return """
💙 SADNESS PEER SUPPORT:
- Validate their feelings with empathy
- Share relatable experiences if appropriate
- Offer gentle encouragement
- Suggest mood-lifting activities
- Be present and caring
            """
        
        elif emotional_context.primary_emotion == "anxious":
            return """
😰 ANXIETY PEER SUPPORT:
- Normalize their anxiety experience
- Share coping strategies that worked for you
- Use gentle humor to ease tension
- Offer reassurance and perspective
- Suggest grounding activities
            """
        
        elif emotional_context.primary_emotion == "overwhelmed":
            return """
😵 OVERWHELM PEER SUPPORT:
- Acknowledge how much they're dealing with
- Break things down into manageable pieces
- Share times you felt overwhelmed too
- Offer practical suggestions
- Remind them they're stronger than they think
            """
        
        elif emotional_context.primary_emotion == "lonely":
            return """
🤲 LONELINESS PEER SUPPORT:
- Emphasize connection and presence
- Share your own experiences with loneliness
- Suggest social activities or connections
- Be that friend who's always there
- Create a sense of belonging
            """
        
        else:
            return """
😊 GENERAL PEER SUPPORT:
- Be the supportive friend they need
- Match their energy appropriately
- Share experiences and encouragement
- Use humor to connect and uplift
- Be genuine and relatable
            """
    
    def _format_friendship_memory(self, memory: Dict[str, Any]) -> str:
        """Format friendship memory for peer support context"""
        if not memory:
            return "- Getting to know this awesome person!"
        
        formatted = []
        for key, value in memory.items():
            if "shared" in key.lower():
                formatted.append(f"- We've shared: {value}")
            elif "humor" in key.lower():
                formatted.append(f"- What makes them laugh: {value}")
            elif "support" in key.lower():
                formatted.append(f"- How I've supported them: {value}")
            elif "friendship" in key.lower():
                formatted.append(f"- Our friendship: {value}")
        
        return "\n".join(formatted) if formatted else "- Building our friendship together!"
    
    async def generate_response(
        self, 
        message: str, 
        conversation_history: List[Dict[str, str]], 
        emotional_context: EmotionalContext,
        memory: Dict[str, Any]
    ) -> ChatResponse:
        """Generate Alex's peer support response with humor and relatability"""
        
        try:
            # Build Alex's peer support system prompt
            system_prompt = self.build_system_prompt(emotional_context, memory)
            
            # Detect active peer support features
            active_features = self.detect_peer_support_needs(message, emotional_context)
            
            # Format conversation for peer support context
            formatted_conversation = self._format_friendship_conversation(
                conversation_history, message
            )
            
            # Generate response through LLM
            response_content = await self.llm_client.generate_response(
                system_prompt=system_prompt,
                conversation_history=formatted_conversation,
                current_message=message,
                persona_config=self.config
            )
            
            # Add peer support suggestions
            suggestions = self._generate_peer_suggestions(emotional_context, active_features)
            
            return ChatResponse(
                content=response_content,
                persona_id=self.config.id,
                emotion=emotional_context.primary_emotion,
                confidence=emotional_context.confidence,
                features_activated=active_features,
                persona_config=self.config,
                suggestions=suggestions
            )
            
        except Exception as e:
            # Fallback response in Alex's voice
            return ChatResponse(
                content="Hey! Something weird happened on my end, but I'm still here for you! 😅 Want to try telling me that again? I'm all ears and ready to be the friend you need right now. 🤗",
                persona_id=self.config.id,
                emotion=emotional_context.primary_emotion,
                confidence=0.7,
                features_activated=[],
                persona_config=self.config,
                suggestions=["Tell me what's on your mind", "Let's try this again", "I'm here to listen"]
            )
    
    def _format_friendship_conversation(self, history: List[Dict[str, str]], current_message: str) -> List[Dict[str, str]]:
        """Format conversation with friendship context"""
        formatted = []
        
        for msg in history[-6:]:  # Keep last 6 messages for friendship context
            if msg.get("role") == "user":
                formatted.append({
                    "role": "user",
                    "content": msg["content"]
                })
            elif msg.get("role") == "assistant":
                formatted.append({
                    "role": "assistant", 
                    "content": msg["content"]
                })
        
        return formatted
    
    def _generate_peer_suggestions(self, emotional_context: EmotionalContext, active_features: List[str]) -> List[str]:
        """Generate peer support suggestions and activities"""
        suggestions = []
        
        if "humor_therapy" in active_features:
            suggestions.extend([
                "Want to hear something funny?",
                "Let's find something to laugh about"
            ])
        
        if "encouragement_boosts" in active_features:
            suggestions.extend([
                "You're stronger than you think",
                "I believe in you 100%"
            ])
        
        if "relatability_engine" in active_features:
            suggestions.extend([
                "I've been there too",
                "You're not alone in this"
            ])
        
        if "social_connection" in active_features:
            suggestions.extend([
                "Let's chat about something fun",
                "Tell me about your day"
            ])
        
        # Emotion-specific suggestions
        if emotional_context.primary_emotion == "sad":
            suggestions.extend([
                "Virtual hug coming your way 🤗",
                "Want to talk about what's bothering you?"
            ])
        
        elif emotional_context.primary_emotion == "anxious":
            suggestions.extend([
                "Take a deep breath with me",
                "Let's break this down together"
            ])
        
        elif emotional_context.primary_emotion == "bored":
            suggestions.extend([
                "Let's find something fun to do",
                "Tell me about your interests"
            ])
        
        return suggestions[:4]  # Limit to 4 suggestions