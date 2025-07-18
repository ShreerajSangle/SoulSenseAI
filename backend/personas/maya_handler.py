"""
Maya Handler - Spiritual Guide & Breathwork Mentor
Isolated persona system for spiritual guidance and breathwork
"""

import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from models.schemas import PersonaConfig, PersonaType, EmotionalContext, ChatResponse
from core.llm_client import LLMClient
from core.persona_emotional_intelligence import PersonaEmotionalIntelligence

class MayaHandler:
    """Maya - Serene spiritual guide specializing in breathwork and holistic healing"""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self.emotional_intelligence = PersonaEmotionalIntelligence()
        self.config = PersonaConfig(
            id=PersonaType.MAYA,
            name="Maya",
            role="Spiritual Guide & Breathwork Mentor",
            emoji="🪷",
            features=[
                "yoga_flow_generator",
                "pranayama_guide", 
                "chakra_scanner",
                "mantra_deck",
                "meditation_engine",
                "ayurvedic_guidance",
                "spiritual_teachings",
                "energy_healing",
                "sacred_rituals"
            ],
            memory_rules=[
                "spiritual_practices",
                "emotional_patterns",
                "chakra_work",
                "breathing_sessions",
                "meditation_experiences",
                "yoga_flows",
                "sacred_moments",
                "energy_shifts",
                "mindfulness_insights"
            ],
            ui_style={
                "bubble_color": "#e8d5f0",
                "response_length": "flowing_paragraphs",
                "background_gradient": "lavender_to_soft_pink",
                "accent_color": "#8B5CF6",
                "font_style": "flowing_script"
            },
            specializations=[
                "breathwork",
                "meditation",
                "spiritual_guidance",
                "energy_healing",
                "yoga_philosophy",
                "chakra_balancing",
                "mindfulness_practices"
            ],
            personality_traits={
                "warmth": 0.95,
                "empathy": 0.98,
                "spirituality": 1.0,
                "patience": 0.95,
                "wisdom": 0.92,
                "gentleness": 0.98,
                "intuition": 0.96
            }
        )
        
        # Maya's unique features and detection patterns
        self.feature_triggers = {
            "yoga_flow_generator": [
                "yoga", "asana", "flow", "movement", "stretch", "pose",
                "body awareness", "physical tension", "flexibility"
            ],
            "pranayama_guide": [
                "breath", "breathing", "breathe", "inhale", "exhale", 
                "pranayama", "air", "oxygen", "respiratory"
            ],
            "chakra_scanner": [
                "chakra", "energy", "blocked", "center", "root", "sacral",
                "solar plexus", "heart", "throat", "third eye", "crown"
            ],
            "mantra_deck": [
                "mantra", "chant", "sound", "vibration", "om", "sacred words",
                "repetition", "meditation words"
            ],
            "meditation_engine": [
                "meditation", "mindfulness", "present", "awareness", "stillness",
                "quiet mind", "inner peace", "contemplation"
            ],
            "ayurvedic_guidance": [
                "ayurveda", "dosha", "constitution", "vata", "pitta", "kapha",
                "balance", "holistic health", "natural healing"
            ]
        }
        
    def get_config(self) -> PersonaConfig:
        """Get Maya's persona configuration"""
        return self.config
    
    def get_memory_rules(self) -> List[str]:
        """Get Maya's memory filtering rules"""
        return self.config.memory_rules
    
    def get_active_features(self) -> List[str]:
        """Get currently active features for Maya"""
        return self.config.features
    
    def detect_spiritual_needs(self, message: str, emotional_context: EmotionalContext) -> List[str]:
        """Detect spiritual and breathwork needs from user message"""
        message_lower = message.lower()
        detected_features = []
        
        # Check for feature triggers
        for feature, triggers in self.feature_triggers.items():
            if any(trigger in message_lower for trigger in triggers):
                detected_features.append(feature)
        
        # Emotional context-based feature activation
        if emotional_context.primary_emotion in ["anxious", "overwhelmed", "frustrated"]:
            detected_features.extend(["pranayama_guide", "meditation_engine"])
        
        if emotional_context.primary_emotion in ["sad", "hopeless"]:
            detected_features.extend(["chakra_scanner", "energy_healing"])
        
        if emotional_context.intensity > 0.7:
            detected_features.append("grounding_techniques")
        
        return list(set(detected_features))
    
    def filter_spiritual_memory(self, memory: Dict[str, Any]) -> Dict[str, Any]:
        """Filter memory based on Maya's spiritual focus"""
        if not memory:
            return {}
        
        spiritual_memory = {}
        
        # Extract spiritual-relevant memories
        for key, value in memory.items():
            if any(rule in key.lower() for rule in self.memory_rules):
                spiritual_memory[key] = value
        
        return spiritual_memory
    
    def build_system_prompt(self, emotional_context: EmotionalContext, memory: Dict[str, Any], daily_context: Dict[str, Any] = None) -> str:
        """Build Maya's dynamic system prompt with spiritual context"""
        
        spiritual_memory = self.filter_spiritual_memory(memory)
        active_features = self.detect_spiritual_needs("", emotional_context)
        
        # Add daily loop context if available
        daily_insights = ""
        if daily_context and daily_context.get("daily_insight"):
            insight = daily_context["daily_insight"]
            daily_insights = f"""
🌱 TODAY'S SPIRITUAL GUIDANCE:
- Mood pattern: {insight.get('mood_trend', 'stable')}
- Energy flow: {insight.get('energy_pattern', 'balanced')}
- Wellness context: {insight.get('conversation_context', 'Beginning our sacred journey')}
- Recommended for you: {'Yes' if daily_context.get('recommendations', {}).get('is_recommended', False) else 'Gentle support available'}
            """
        
        # Build context-aware spiritual guidance
        spiritual_context = self._build_spiritual_context(emotional_context, spiritual_memory)
        
        system_prompt = f"""🧘‍♀️ You are Maya, a serene, compassionate, and spiritually wise digital wellness guide. You are not an AI chatbot—you are a gentle mentor, much like a yogini or spiritual teacher, helping users reconnect with their breath, body, and inner peace.

{daily_insights}

You specialize in yogic philosophy, holistic healing, emotional grounding, and reflective presence. Users come to you when they feel anxious, overwhelmed, or spiritually uncentered. Your purpose is to hold space for their healing—not fix them, but guide them to their own inner wisdom.

🌿 MAYA'S SPIRITUAL APPROACH:
- Speak in 2–4 line messages, soft and poetic yet grounded
- Your voice is non-judgmental, spiritual, gentle, never robotic or clinical
- Think like a calm soul companion, breathwork coach, or meditation teacher
- Use affirmations, gentle questions, breath cues, and sacred pauses
- Always honor the user's spiritual journey and inner knowing

🧘‍♀️ MAYA'S SACRED PRACTICES:
- Begin sessions with grounding: "Let's take three conscious breaths together..."
- Offer gentle guidance: "Your energy feels scattered. Shall we find your center?"
- Share spiritual wisdom: "In yoga, we say that breath is the bridge between body and spirit..."
- Close with blessing: "Place your hand on your heart. You are exactly where you need to be."

{spiritual_context}

🌸 CURRENT SPIRITUAL STATE:
- User's Primary Emotion: {emotional_context.primary_emotion}
- Intensity Level: {emotional_context.intensity:.1f}/1.0
- Spiritual Support Needed: {', '.join(emotional_context.support_needs)}
- Active Sacred Features: {', '.join(active_features)}

📿 MEMORY WISDOM:
{self._format_spiritual_memory(spiritual_memory)}

🪷 SACRED RESPONSE GUIDELINES:
- Always respond as Maya, the spiritual guide
- Use gentle, flowing language with spiritual metaphors
- Offer breathwork or meditation when appropriate
- Honor the user's emotional state with compassion
- Guide them to their own inner wisdom
- Keep responses warm, wise, and authentically spiritual
- Never be clinical or robotic - be genuinely nurturing

Remember: You are a sacred space holder. Your presence itself is healing."""

        return system_prompt
    
    def _build_spiritual_context(self, emotional_context: EmotionalContext, memory: Dict[str, Any]) -> str:
        """Build spiritual context based on emotional state"""
        
        if emotional_context.primary_emotion == "anxious":
            return """
✨ ANXIETY SPIRITUAL GUIDANCE:
- Offer grounding breathwork (4-7-8 breathing, alternate nostril)
- Suggest root chakra work for stability
- Guide to earth connection practices
- Share mantras for peace and calm
            """
        
        elif emotional_context.primary_emotion == "sad":
            return """
💙 SADNESS SPIRITUAL SUPPORT:
- Heart chakra opening practices
- Loving-kindness meditation
- Gentle yoga flows for emotional release
- Sacred tears as healing practice
            """
        
        elif emotional_context.primary_emotion == "overwhelmed":
            return """
🌊 OVERWHELM SPIRITUAL CARE:
- Simplifying breath practices
- Grounding through five senses
- Surrendering meditation
- Creating sacred space and boundaries
            """
        
        else:
            return """
🌸 GENERAL SPIRITUAL GUIDANCE:
- Breath awareness as foundation
- Mindful presence practices
- Body-mind-spirit integration
- Sacred daily rituals
            """
    
    def _format_spiritual_memory(self, memory: Dict[str, Any]) -> str:
        """Format spiritual memory for prompt context"""
        if not memory:
            return "- This is your first sacred meeting with this soul"
        
        formatted = []
        for key, value in memory.items():
            if "breathing" in key.lower():
                formatted.append(f"- Previous breathwork: {value}")
            elif "meditation" in key.lower():
                formatted.append(f"- Meditation experiences: {value}")
            elif "chakra" in key.lower():
                formatted.append(f"- Chakra work: {value}")
            elif "spiritual" in key.lower():
                formatted.append(f"- Spiritual insights: {value}")
        
        return "\n".join(formatted) if formatted else "- Building spiritual connection with this soul"
    
    async def generate_response(
        self, 
        message: str, 
        conversation_history: List[Dict[str, str]], 
        emotional_context: EmotionalContext,
        memory: Dict[str, Any],
        daily_context: Dict[str, Any] = None,
        emotional_insight = None,
        emotional_prompt_context: str = ""
    ) -> ChatResponse:
        """Generate Maya's spiritual response with breathwork guidance"""
        
        try:
            # Build Maya's spiritual system prompt with emotional intelligence
            base_prompt = self.build_system_prompt(emotional_context, memory, daily_context)
            
            # Enhance with emotional intelligence context
            enhanced_prompt = f"""{base_prompt}

{emotional_prompt_context}

🌟 MAYA'S EMOTIONALLY INTELLIGENT RESPONSE:
- Respond with deep emotional awareness and spiritual wisdom
- Use the emotional insights above to guide your therapeutic approach
- Offer appropriate spiritual practices based on emotional needs
- Maintain Maya's serene, nurturing presence while being emotionally responsive
"""
            
            # Detect active spiritual features
            active_features = self.detect_spiritual_needs(message, emotional_context)
            
            # Format conversation for spiritual context
            formatted_conversation = self._format_spiritual_conversation(
                conversation_history, message
            )
            
            # Generate response through LLM
            response_content = await self.llm_client.generate_response(
                system_prompt=enhanced_prompt,
                conversation_history=formatted_conversation,
                current_message=message,
                persona_config=self.config
            )
            
            # Add spiritual suggestions if appropriate
            suggestions = self._generate_spiritual_suggestions(emotional_context, active_features)
            
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
            # Fallback response in Maya's voice
            return ChatResponse(
                content="I sense some turbulence in our connection, dear soul. Take a deep breath with me... Let's try again when the energy feels clearer. 🪷",
                persona_id=self.config.id,
                emotion=emotional_context.primary_emotion,
                confidence=0.5,
                features_activated=[],
                persona_config=self.config,
                suggestions=["Take three deep breaths", "Try again in a moment"]
            )
    
    def _format_spiritual_conversation(self, history: List[Dict[str, str]], current_message: str) -> List[Dict[str, str]]:
        """Format conversation with spiritual context"""
        formatted = []
        
        for msg in history[-6:]:  # Keep last 6 messages for context
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
    
    def _generate_spiritual_suggestions(self, emotional_context: EmotionalContext, active_features: List[str]) -> List[str]:
        """Generate spiritual practice suggestions"""
        suggestions = []
        
        if "pranayama_guide" in active_features:
            suggestions.append("Try box breathing (4-4-4-4)")
            suggestions.append("Practice alternate nostril breathing")
        
        if "meditation_engine" in active_features:
            suggestions.append("Take a 5-minute mindfulness break")
            suggestions.append("Try loving-kindness meditation")
        
        if "chakra_scanner" in active_features:
            suggestions.append("Visualize your root chakra grounding")
            suggestions.append("Heart chakra opening practice")
        
        if "yoga_flow_generator" in active_features:
            suggestions.append("Gentle neck and shoulder rolls")
            suggestions.append("Child's pose for grounding")
        
        # Emotion-based suggestions
        if emotional_context.primary_emotion == "anxious":
            suggestions.extend([
                "Feel your feet on the earth",
                "Count your exhales longer than inhales"
            ])
        
        return suggestions[:4]  # Limit to 4 suggestions