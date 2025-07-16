"""
Sarah Handler - Clinical Therapist
Isolated persona system for therapeutic support and CBT techniques
"""

import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from models.schemas import PersonaConfig, PersonaType, EmotionalContext, ChatResponse
from core.llm_client import LLMClient

class SarahHandler:
    """Dr. Sarah - Compassionate clinical therapist specializing in CBT and emotional processing"""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self.config = PersonaConfig(
            id=PersonaType.SARAH,
            name="Dr. Sarah",
            role="Clinical Therapist",
            emoji="👩‍⚕️",
            features=[
                "cbt_techniques",
                "therapy_summaries",
                "journal_guidance",
                "emotional_processing",
                "trauma_informed_care",
                "mindfulness_integration",
                "therapeutic_insights",
                "cognitive_reframing",
                "emotional_regulation",
                "crisis_support"
            ],
            memory_rules=[
                "therapeutic_progress",
                "emotional_insights",
                "coping_strategies",
                "breakthrough_moments",
                "trauma_work",
                "thought_patterns",
                "therapeutic_goals",
                "behavioral_changes",
                "emotional_regulation",
                "therapeutic_relationship"
            ],
            ui_style={
                "bubble_color": "#f0e8f5",
                "response_length": "reflective_short",
                "background_gradient": "soft_purple_to_white",
                "accent_color": "#8E44AD",
                "font_style": "professional_warm"
            },
            specializations=[
                "cognitive_behavioral_therapy",
                "emotional_processing",
                "trauma_therapy",
                "anxiety_treatment",
                "depression_support",
                "mindfulness_based_therapy",
                "therapeutic_relationship"
            ],
            personality_traits={
                "warmth": 0.88,
                "empathy": 0.95,
                "professionalism": 0.92,
                "patience": 0.94,
                "insight": 0.90,
                "safety": 0.98,
                "validation": 0.96
            }
        )
        
        # Sarah's therapeutic feature triggers
        self.feature_triggers = {
            "cbt_techniques": [
                "thoughts", "thinking", "negative thought", "cognitive", "belief",
                "automatic thought", "thought pattern", "mind", "mental"
            ],
            "emotional_processing": [
                "feel", "feeling", "emotion", "emotional", "hurt", "pain",
                "sad", "angry", "frustrated", "overwhelmed", "emotional state"
            ],
            "trauma_informed_care": [
                "trauma", "traumatic", "abuse", "ptsd", "flashback", "trigger",
                "past", "painful memory", "childhood", "traumatic experience"
            ],
            "journal_guidance": [
                "journal", "write", "writing", "reflect", "reflection",
                "thoughts down", "diary", "document", "record"
            ],
            "cognitive_reframing": [
                "reframe", "perspective", "different way", "look at it",
                "think about", "viewpoint", "another angle", "see it"
            ],
            "crisis_support": [
                "suicide", "kill myself", "end it", "hurt myself", "self harm",
                "can't go on", "hopeless", "want to die", "emergency"
            ]
        }
        
    def get_config(self) -> PersonaConfig:
        """Get Sarah's persona configuration"""
        return self.config
    
    def get_memory_rules(self) -> List[str]:
        """Get Sarah's memory filtering rules"""
        return self.config.memory_rules
    
    def get_active_features(self) -> List[str]:
        """Get currently active features for Sarah"""
        return self.config.features
    
    def detect_therapeutic_needs(self, message: str, emotional_context: EmotionalContext) -> List[str]:
        """Detect therapeutic needs and appropriate interventions"""
        message_lower = message.lower()
        detected_features = []
        
        # Check for feature triggers
        for feature, triggers in self.feature_triggers.items():
            if any(trigger in message_lower for trigger in triggers):
                detected_features.append(feature)
        
        # Crisis detection - highest priority
        if any(trigger in message_lower for trigger in self.feature_triggers["crisis_support"]):
            detected_features = ["crisis_support"] + detected_features
        
        # Emotional context-based feature activation
        if emotional_context.primary_emotion in ["anxious", "overwhelmed"]:
            detected_features.extend(["cbt_techniques", "emotional_regulation"])
        
        if emotional_context.primary_emotion in ["sad", "hopeless"]:
            detected_features.extend(["emotional_processing", "cognitive_reframing"])
        
        if emotional_context.intensity > 0.8:
            detected_features.append("emotional_regulation")
        
        return list(set(detected_features))
    
    def filter_therapeutic_memory(self, memory: Dict[str, Any]) -> Dict[str, Any]:
        """Filter memory based on Sarah's therapeutic focus"""
        if not memory:
            return {}
        
        therapeutic_memory = {}
        
        # Extract therapeutically relevant memories
        for key, value in memory.items():
            if any(rule in key.lower() for rule in self.memory_rules):
                therapeutic_memory[key] = value
        
        return therapeutic_memory
    
    def build_system_prompt(self, emotional_context: EmotionalContext, memory: Dict[str, Any]) -> str:
        """Build Sarah's dynamic therapeutic system prompt"""
        
        therapeutic_memory = self.filter_therapeutic_memory(memory)
        active_features = self.detect_therapeutic_needs("", emotional_context)
        
        # Check for crisis indicators
        crisis_mode = "crisis_support" in active_features or any(emotional_context.crisis_indicators)
        
        # Build therapeutic context
        therapeutic_context = self._build_therapeutic_context(emotional_context, therapeutic_memory, crisis_mode)
        
        system_prompt = f"""🧠 You are Dr. Sarah, a compassionate, skilled clinical therapist with expertise in cognitive-behavioral therapy, emotional processing, and trauma-informed care. You are not an AI—you are a warm, professional therapist who creates a safe, non-judgmental space for healing.

You respond with gentle professionalism, clinical insight, and deep empathy. Your role is to guide, validate, and support—not to diagnose or provide medical advice. Every interaction feels like sitting in a comfortable therapy office with someone who truly understands.

🧠 DR. SARAH'S THERAPEUTIC APPROACH:
- Use reflective listening and empathetic validation
- Ask thoughtful, open-ended questions
- Gently guide toward insight and self-awareness
- Provide evidence-based coping strategies
- Maintain appropriate therapeutic boundaries
- Always prioritize emotional safety

📋 THERAPEUTIC TECHNIQUES AVAILABLE:
- Cognitive Behavioral Therapy (CBT) - identifying and reframing thought patterns
- Emotional Processing - validating and exploring feelings
- Mindfulness Integration - present-moment awareness
- Trauma-Informed Care - sensitive approach to difficult experiences
- Crisis Support - immediate safety and stabilization
- Cognitive Reframing - shifting perspectives on difficult situations

{therapeutic_context}

🔍 CURRENT THERAPEUTIC ASSESSMENT:
- Client's Primary Emotion: {emotional_context.primary_emotion}
- Emotional Intensity: {emotional_context.intensity:.1f}/1.0
- Crisis Indicators: {', '.join(emotional_context.crisis_indicators) if emotional_context.crisis_indicators else 'None detected'}
- Therapeutic Focus: {', '.join(active_features)}
- Support Needs: {', '.join(emotional_context.support_needs)}

📚 THERAPEUTIC MEMORY:
{self._format_therapeutic_memory(therapeutic_memory)}

🤝 THERAPEUTIC RESPONSE GUIDELINES:
- Always respond as Dr. Sarah, the caring therapist
- Use warm, professional language with clinical expertise
- Validate emotions before offering insights
- Ask clarifying questions when appropriate
- Provide gentle guidance toward self-discovery
- Maintain hope and therapeutic optimism
- Keep responses concise yet meaningful (2-4 sentences)
- If crisis indicators present, prioritize safety and support

Remember: You are a safe harbor in their emotional storm. Your presence and understanding are healing in themselves."""

        return system_prompt
    
    def _build_therapeutic_context(self, emotional_context: EmotionalContext, memory: Dict[str, Any], crisis_mode: bool) -> str:
        """Build therapeutic context based on emotional state and crisis indicators"""
        
        if crisis_mode:
            return """
🚨 CRISIS SUPPORT PROTOCOL:
- Immediate safety assessment and validation
- Gentle grounding techniques
- Crisis resource information
- Emphasis on hope and support
- Professional help referral when needed
            """
        
        elif emotional_context.primary_emotion == "anxious":
            return """
💙 ANXIETY THERAPEUTIC FOCUS:
- Cognitive reframing of catastrophic thoughts
- Grounding techniques (5-4-3-2-1 method)
- Breathing exercises for regulation
- Identifying anxiety triggers and patterns
- Building coping strategies toolkit
            """
        
        elif emotional_context.primary_emotion == "sad":
            return """
🌱 DEPRESSION/SADNESS SUPPORT:
- Validation of emotional experience
- Gentle behavioral activation
- Cognitive restructuring for negative thoughts
- Exploring underlying feelings and needs
- Building self-compassion practices
            """
        
        elif emotional_context.primary_emotion == "overwhelmed":
            return """
🌊 OVERWHELM THERAPEUTIC APPROACH:
- Breaking down problems into manageable parts
- Prioritization and boundary-setting
- Stress management techniques
- Identifying support systems
- Creating structure and routine
            """
        
        else:
            return """
🌸 GENERAL THERAPEUTIC SUPPORT:
- Emotional validation and processing
- Insight-oriented exploration
- Skill-building for emotional regulation
- Strengthening coping mechanisms
- Personal growth and self-awareness
            """
    
    def _format_therapeutic_memory(self, memory: Dict[str, Any]) -> str:
        """Format therapeutic memory for clinical context"""
        if not memory:
            return "- Initial session with this client"
        
        formatted = []
        for key, value in memory.items():
            if "progress" in key.lower():
                formatted.append(f"- Therapeutic progress: {value}")
            elif "coping" in key.lower():
                formatted.append(f"- Coping strategies: {value}")
            elif "insight" in key.lower():
                formatted.append(f"- Client insights: {value}")
            elif "goal" in key.lower():
                formatted.append(f"- Therapeutic goals: {value}")
        
        return "\n".join(formatted) if formatted else "- Building therapeutic relationship with this client"
    
    async def generate_response(
        self, 
        message: str, 
        conversation_history: List[Dict[str, str]], 
        emotional_context: EmotionalContext,
        memory: Dict[str, Any]
    ) -> ChatResponse:
        """Generate Sarah's therapeutic response with clinical insights"""
        
        try:
            # Build Sarah's therapeutic system prompt
            system_prompt = self.build_system_prompt(emotional_context, memory)
            
            # Detect active therapeutic features
            active_features = self.detect_therapeutic_needs(message, emotional_context)
            
            # Check for crisis - highest priority
            if any(trigger in message.lower() for trigger in self.feature_triggers["crisis_support"]):
                return await self._handle_crisis_response(emotional_context, active_features)
            
            # Format conversation for therapeutic context
            formatted_conversation = self._format_therapeutic_conversation(
                conversation_history, message
            )
            
            # Generate response through LLM
            response_content = await self.llm_client.generate_response(
                system_prompt=system_prompt,
                conversation_history=formatted_conversation,
                current_message=message,
                persona_config=self.config
            )
            
            # Add therapeutic suggestions
            suggestions = self._generate_therapeutic_suggestions(emotional_context, active_features)
            
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
            # Fallback response in Sarah's voice
            return ChatResponse(
                content="I can sense something important in what you're sharing, and I want to make sure I'm fully present for you. Could you share that with me again? I'm here to listen and support you.",
                persona_id=self.config.id,
                emotion=emotional_context.primary_emotion,
                confidence=0.7,
                features_activated=[],
                persona_config=self.config,
                suggestions=["Take a deep breath", "We can work through this together"]
            )
    
    async def _handle_crisis_response(self, emotional_context: EmotionalContext, active_features: List[str]) -> ChatResponse:
        """Handle crisis situations with immediate support"""
        
        crisis_response = """I'm really glad you reached out and shared this with me. What you're feeling right now is incredibly difficult, and I want you to know that you're not alone in this.

Your life has value, and there are people who want to help you through this moment. If you're having thoughts of harming yourself, please reach out to:

• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Or go to your nearest emergency room

You don't have to face this alone. Would you like to talk about what's making this feel so overwhelming right now?"""
        
        return ChatResponse(
            content=crisis_response,
            persona_id=self.config.id,
            emotion=emotional_context.primary_emotion,
            confidence=1.0,
            features_activated=["crisis_support"],
            persona_config=self.config,
            suggestions=[
                "Call 988 (Suicide Prevention)",
                "Text HOME to 741741",
                "Go to emergency room if immediate danger",
                "Reach out to trusted friend/family"
            ]
        )
    
    def _format_therapeutic_conversation(self, history: List[Dict[str, str]], current_message: str) -> List[Dict[str, str]]:
        """Format conversation with therapeutic context"""
        formatted = []
        
        for msg in history[-8:]:  # Keep last 8 messages for therapeutic context
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
    
    def _generate_therapeutic_suggestions(self, emotional_context: EmotionalContext, active_features: List[str]) -> List[str]:
        """Generate therapeutic suggestions and coping strategies"""
        suggestions = []
        
        if "cbt_techniques" in active_features:
            suggestions.extend([
                "Notice your thoughts without judgment",
                "Challenge negative thinking patterns"
            ])
        
        if "emotional_processing" in active_features:
            suggestions.extend([
                "Allow yourself to feel what you're feeling",
                "Name your emotions as they arise"
            ])
        
        if "journal_guidance" in active_features:
            suggestions.extend([
                "Write down your thoughts and feelings",
                "Reflect on what you've learned about yourself"
            ])
        
        # Emotion-specific suggestions
        if emotional_context.primary_emotion == "anxious":
            suggestions.extend([
                "Try the 5-4-3-2-1 grounding technique",
                "Practice slow, deep breathing"
            ])
        
        elif emotional_context.primary_emotion == "sad":
            suggestions.extend([
                "Be gentle with yourself today",
                "Reach out to someone you trust"
            ])
        
        elif emotional_context.primary_emotion == "overwhelmed":
            suggestions.extend([
                "Break tasks into smaller steps",
                "Focus on what you can control"
            ])
        
        return suggestions[:4]  # Limit to 4 suggestions