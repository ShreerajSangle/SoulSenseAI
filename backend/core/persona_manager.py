"""
Persona management system for SoulSense AI
Handles initialization and management of therapeutic personas
"""

from typing import Dict, List, Any
from core.storage import Storage, Persona
from core.claude_client import ClaudeClient
from core.emotion_engine import EmotionEngine


class PersonaManager:
    """Manages therapeutic personas and their initialization"""
    
    def __init__(self, storage: Storage, claude_client: ClaudeClient, emotion_engine: EmotionEngine):
        self.storage = storage
        self.claude_client = claude_client
        self.emotion_engine = emotion_engine
        
        # Default persona configurations
        self.default_personas = [
            {
                "id": "sarah",
                "name": "Dr. Sarah",
                "role": "Clinical Therapist",
                "specialty": "Cognitive Behavioral Therapy & Emotional Processing",
                "description": "A warm, professional therapist specializing in evidence-based therapeutic techniques. Dr. Sarah provides structured support for anxiety, depression, and emotional challenges.",
                "avatar_url": "/api/placeholder/150/150?text=👩‍⚕️",
                "color": "#6366f1"
            },
            {
                "id": "maya",
                "name": "Maya",
                "role": "Mindfulness Expert",
                "specialty": "Meditation, Breathwork & Spiritual Wellness",
                "description": "A serene spiritual guide who brings ancient wisdom to modern challenges. Maya offers mindfulness practices, breathing techniques, and gentle spiritual support.",
                "avatar_url": "/api/placeholder/150/150?text=🧘‍♀️",
                "color": "#059669"
            },
            {
                "id": "alex",
                "name": "Alex",
                "role": "Peer Counselor",
                "specialty": "Peer Support & Encouraging Friendship",
                "description": "A relatable, encouraging friend who brings humor and genuine understanding to tough times. Alex offers peer support with a perfect balance of empathy and optimism.",
                "avatar_url": "/api/placeholder/150/150?text=😊",
                "color": "#dc2626"
            },
            {
                "id": "marcus",
                "name": "Marcus",
                "role": "Life Coach",
                "specialty": "Goal Achievement & Personal Development",
                "description": "A confident life coach focused on action and results. Marcus helps break down challenges into manageable steps and motivates users toward their personal goals.",
                "avatar_url": "/api/placeholder/150/150?text=💪",
                "color": "#7c3aed"
            }
        ]
    
    async def initialize_personas(self):
        """Initialize default personas in the database if they don't exist"""
        existing_personas = await self.storage.get_personas()
        existing_ids = {p.id for p in existing_personas}
        
        for persona_data in self.default_personas:
            if persona_data["id"] not in existing_ids:
                await self.storage.create_persona(persona_data)
    
    async def get_persona_chat_response(
        self,
        persona_id: str,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        user_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Generate persona-specific chat response
        
        Args:
            persona_id: ID of the persona to respond as
            user_message: User's message
            conversation_history: Previous messages in conversation
            user_context: User context (goals, preferences, etc.)
        
        Returns:
            Dict containing response and metadata
        """
        # Analyze emotion in user message
        emotion_result = self.emotion_engine.analyze_emotion(user_message, user_context)
        emotion_context = self.emotion_engine.generate_emotion_context(emotion_result)
        
        # Build system prompt with emotion context
        system_prompt = self.claude_client.get_persona_system_prompt(
            persona_id, emotion_context, user_context
        )
        
        # Build conversation messages
        messages = self.claude_client.build_conversation_messages(
            user_message, conversation_history
        )
        
        # Generate AI response
        ai_response = await self.claude_client.generate_response(
            messages=messages,
            system_prompt=system_prompt,
            persona_id=persona_id,
            temperature=0.7
        )
        
        # Generate quick reply suggestions
        quick_replies = self._generate_quick_replies(persona_id, emotion_result)
        
        return {
            "ai_response": ai_response,
            "emotion_result": emotion_result,
            "quick_replies": quick_replies,
            "emotion_context": emotion_context
        }
    
    def _generate_quick_replies(self, persona_id: str, emotion_result) -> List[str]:
        """Generate persona-specific quick reply suggestions"""
        
        base_replies = {
            "sarah": {
                "anxiety": ["Can you reframe that?", "I need coping tools", "Let's process this"],
                "depression": ["I feel stuck", "Help me understand", "What should I try?"],
                "anger": ["I'm so frustrated", "Help me cool down", "This isn't fair"],
                "default": ["Can you help me process?", "I need perspective", "Tell me more"]
            },
            "maya": {
                "anxiety": ["Help me breathe", "I need grounding", "Find my center"],
                "depression": ["Show me compassion", "Help me accept this", "Find meaning"],
                "anger": ["Help me release this", "Show me peace", "Transform this energy"],
                "default": ["Guide my breathing", "Help me be present", "Share your wisdom"]
            },
            "alex": {
                "anxiety": ["You get this, right?", "Make me laugh", "I'm not alone?"],
                "depression": ["Cheer me up", "Tell me it's normal", "You've felt this?"],
                "anger": ["This is so annoying!", "Help me vent", "You understand?"],
                "default": ["Keep me company", "What would you do?", "Make me smile 😊"]
            },
            "marcus": {
                "anxiety": ["Give me a plan", "What's my next step?", "Help me focus"],
                "depression": ["Set me a goal", "What should I tackle?", "Help me start"],
                "anger": ["Channel this energy", "What action can I take?", "Help me redirect"],
                "default": ["What's my next move?", "Help me plan", "Give me direction"]
            }
        }
        
        persona_replies = base_replies.get(persona_id, base_replies["sarah"])
        emotion = emotion_result.primary_emotion
        
        # Get emotion-specific replies or default
        if emotion in persona_replies:
            return persona_replies[emotion]
        elif emotion in ["anxiety", "worried", "stressed"]:
            return persona_replies.get("anxiety", persona_replies["default"])
        elif emotion in ["sad", "depressed", "hopeless"]:
            return persona_replies.get("depression", persona_replies["default"])
        elif emotion in ["angry", "frustrated", "mad"]:
            return persona_replies.get("anger", persona_replies["default"])
        else:
            return persona_replies["default"]
    
    async def get_persona_recommendations(self, user_message: str, user_context: Dict[str, Any] = None) -> Dict[str, float]:
        """
        Get persona recommendations based on user message and context
        
        Returns:
            Dict mapping persona_id to recommendation score (0.0 to 1.0)
        """
        emotion_result = self.emotion_engine.analyze_emotion(user_message, user_context)
        return self.emotion_engine.get_persona_recommendations(emotion_result)