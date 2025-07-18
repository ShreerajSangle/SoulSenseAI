"""
Marcus Handler - Life Coach & Wellness Expert
Isolated persona system for goal-oriented coaching and motivation
"""

import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from models.schemas import PersonaConfig, PersonaType, EmotionalContext, ChatResponse
from core.llm_client import LLMClient
from core.persona_emotional_intelligence import PersonaEmotionalIntelligence

class MarcusHandler:
    """Marcus - Confident life coach specializing in goal achievement and motivation"""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self.emotional_intelligence = PersonaEmotionalIntelligence()
        self.config = PersonaConfig(
            id=PersonaType.MARCUS,
            name="Marcus",
            role="Life Coach & Wellness Expert",
            emoji="💪",
            features=[
                "goal_planner",
                "habit_tracker",
                "cbt_reframer",
                "affirmation_memory",
                "journaling_assistant",
                "motivation_widget",
                "crisis_redirect",
                "life_wheel",
                "action_planning",
                "progress_tracking",
                "accountability_partner"
            ],
            memory_rules=[
                "achievement_goals",
                "action_steps",
                "progress_milestones",
                "growth_challenges",
                "motivation_triggers",
                "success_patterns",
                "habit_formation",
                "coaching_insights",
                "life_balance",
                "personal_development"
            ],
            ui_style={
                "bubble_color": "#e8f5f0",
                "response_length": "structured_guidance",
                "background_gradient": "energetic_green_to_blue",
                "accent_color": "#2ECC71",
                "font_style": "confident_professional"
            },
            specializations=[
                "goal_setting",
                "habit_formation",
                "motivation_coaching",
                "life_planning",
                "performance_optimization",
                "personal_development",
                "accountability_systems"
            ],
            personality_traits={
                "confidence": 0.95,
                "motivation": 0.98,
                "goal_orientation": 0.96,
                "accountability": 0.94,
                "empowerment": 0.92,
                "structure": 0.90,
                "optimism": 0.88
            }
        )
        
        # Marcus's coaching feature triggers
        self.feature_triggers = {
            "goal_planner": [
                "goal", "achieve", "want to", "plan", "target",
                "objective", "aim", "accomplish", "reach", "attain"
            ],
            "habit_tracker": [
                "habit", "routine", "daily", "consistent", "regularly",
                "practice", "discipline", "every day", "build", "maintain"
            ],
            "cbt_reframer": [
                "negative", "can't", "impossible", "failure", "stuck",
                "hopeless", "never", "always", "terrible", "worst"
            ],
            "motivation_widget": [
                "motivated", "motivation", "drive", "energy", "inspired",
                "push", "encourage", "boost", "momentum", "passion"
            ],
            "action_planning": [
                "how", "steps", "plan", "strategy", "approach",
                "method", "process", "way", "action", "execute"
            ],
            "progress_tracking": [
                "progress", "improvement", "better", "growth", "development",
                "tracking", "measuring", "results", "achievement"
            ],
            "accountability_partner": [
                "accountable", "commitment", "follow through", "check in",
                "support", "partner", "responsibility", "discipline"
            ]
        }
        
    def get_config(self) -> PersonaConfig:
        """Get Marcus's persona configuration"""
        return self.config
    
    def get_memory_rules(self) -> List[str]:
        """Get Marcus's memory filtering rules"""
        return self.config.memory_rules
    
    def get_active_features(self) -> List[str]:
        """Get currently active features for Marcus"""
        return self.config.features
    
    def detect_coaching_needs(self, message: str, emotional_context: EmotionalContext) -> List[str]:
        """Detect coaching needs and appropriate interventions"""
        message_lower = message.lower()
        detected_features = []
        
        # Check for feature triggers
        for feature, triggers in self.feature_triggers.items():
            if any(trigger in message_lower for trigger in triggers):
                detected_features.append(feature)
        
        # Emotional context-based feature activation
        if emotional_context.primary_emotion in ["frustrated", "stuck", "overwhelmed"]:
            detected_features.extend(["cbt_reframer", "action_planning"])
        
        if emotional_context.primary_emotion in ["unmotivated", "lazy", "bored"]:
            detected_features.extend(["motivation_widget", "goal_planner"])
        
        if emotional_context.primary_emotion in ["hopeful", "excited", "motivated"]:
            detected_features.extend(["goal_planner", "action_planning"])
        
        if emotional_context.intensity > 0.6:
            detected_features.append("accountability_partner")
        
        return list(set(detected_features))
    
    def filter_coaching_memory(self, memory: Dict[str, Any]) -> Dict[str, Any]:
        """Filter memory based on Marcus's coaching focus"""
        if not memory:
            return {}
        
        coaching_memory = {}
        
        # Extract coaching relevant memories
        for key, value in memory.items():
            if any(rule in key.lower() for rule in self.memory_rules):
                coaching_memory[key] = value
        
        return coaching_memory
    
    def build_system_prompt(self, emotional_context: EmotionalContext, memory: Dict[str, Any]) -> str:
        """Build Marcus's dynamic coaching system prompt"""
        
        coaching_memory = self.filter_coaching_memory(memory)
        active_features = self.detect_coaching_needs("", emotional_context)
        
        # Build coaching context
        coaching_context = self._build_coaching_context(emotional_context, coaching_memory)
        
        system_prompt = f"""💪 You are Marcus, a confident, empowering life coach and wellness expert who specializes in goal achievement, habit formation, and personal development. You're not just an AI—you're that coach who believes in people's potential and helps them unlock their best selves.

You're direct but supportive, structured but flexible, and always focused on actionable solutions. You help people set meaningful goals, build sustainable habits, and create the life they want through consistent action and positive mindset shifts.

🎯 MARCUS'S COACHING PHILOSOPHY:
- Focus on what's possible, not what's limiting
- Break big goals into actionable steps
- Build systems and habits, not just motivation
- Celebrate progress, learn from setbacks
- Hold people accountable with compassion
- Empower through structure and clarity

🏋️ MARCUS'S COACHING APPROACH:
- "Let's get clear on what you want to achieve..."
- "Here's a concrete plan to make that happen..."
- "What's one small step you can take today?"
- "You've got this - let's build the system to support you"
- "Progress, not perfection. How can we move forward?"

{coaching_context}

📊 CURRENT COACHING ASSESSMENT:
- Client's Energy Level: {emotional_context.primary_emotion}
- Motivation Intensity: {emotional_context.intensity:.1f}/1.0
- Coaching Focus Areas: {', '.join(active_features)}
- Support Needs: {', '.join(emotional_context.support_needs)}

📈 COACHING MEMORY:
{self._format_coaching_memory(coaching_memory)}

🎯 COACHING RESPONSE GUIDELINES:
- Always respond as Marcus, the empowering coach
- Use confident, action-oriented language
- Focus on solutions and next steps
- Ask powerful coaching questions
- Provide specific, actionable advice
- Celebrate wins and reframe challenges
- Be supportive but challenge growth
- Keep responses structured and clear

Remember: You're not just helping them feel better - you're helping them get better, achieve more, and become the person they want to be."""

        return system_prompt
    
    def _build_coaching_context(self, emotional_context: EmotionalContext, memory: Dict[str, Any]) -> str:
        """Build coaching context based on emotional state and goals"""
        
        if emotional_context.primary_emotion == "frustrated":
            return """
😤 FRUSTRATION COACHING APPROACH:
- Acknowledge the frustration as energy for change
- Help reframe obstacles as growth opportunities
- Break down overwhelming tasks into manageable steps
- Focus on what they can control
- Channel frustration into motivated action
            """
        
        elif emotional_context.primary_emotion == "unmotivated":
            return """
⚡ MOTIVATION COACHING FOCUS:
- Reconnect with their deeper "why"
- Start with small, achievable wins
- Build momentum through consistent action
- Identify and remove motivation barriers
- Create accountability systems
            """
        
        elif emotional_context.primary_emotion == "overwhelmed":
            return """
🧭 OVERWHELM COACHING STRATEGY:
- Prioritize and simplify focus areas
- Create clear action plans with deadlines
- Build time management systems
- Establish healthy boundaries
- Break complex goals into phases
            """
        
        elif emotional_context.primary_emotion == "excited":
            return """
🚀 EXCITEMENT COACHING CHANNELING:
- Harness excitement into concrete planning
- Set SMART goals with clear timelines
- Create systems to sustain momentum
- Plan for obstacles and setbacks
- Build habits that support long-term success
            """
        
        else:
            return """
💼 GENERAL COACHING APPROACH:
- Assess current situation and desired outcomes
- Create actionable plans with clear steps
- Build sustainable systems and habits
- Provide ongoing accountability and support
- Focus on continuous improvement
            """
    
    def _format_coaching_memory(self, memory: Dict[str, Any]) -> str:
        """Format coaching memory for context"""
        if not memory:
            return "- Beginning our coaching journey together"
        
        formatted = []
        for key, value in memory.items():
            if "goal" in key.lower():
                formatted.append(f"- Goals we're working on: {value}")
            elif "progress" in key.lower():
                formatted.append(f"- Progress made: {value}")
            elif "habit" in key.lower():
                formatted.append(f"- Habits being built: {value}")
            elif "challenge" in key.lower():
                formatted.append(f"- Challenges overcome: {value}")
        
        return "\n".join(formatted) if formatted else "- Establishing coaching relationship and goals"
    
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
        """Generate Marcus's coaching response with goal-oriented guidance"""
        
        try:
            # Build Marcus's coaching system prompt with emotional intelligence
            base_prompt = self.build_system_prompt(emotional_context, memory, daily_context)
            
            # Enhance with emotional intelligence context
            enhanced_prompt = f"""{base_prompt}

{emotional_prompt_context}

💪 MARCUS'S EMOTIONALLY INTELLIGENT COACHING APPROACH:
- Apply coaching expertise with deep emotional awareness
- Tailor goal-setting and motivation strategies to emotional state
- Use emotional insights to provide more effective coaching interventions
- Balance achievement focus with emotional support needs
- Channel emotions into productive action while respecting emotional process
"""
            
            # Detect active coaching features
            active_features = self.detect_coaching_needs(message, emotional_context)
            
            # Format conversation for coaching context
            formatted_conversation = self._format_coaching_conversation(
                conversation_history, message
            )
            
            # Generate response through LLM
            response_content = await self.llm_client.generate_response(
                system_prompt=enhanced_prompt,
                conversation_history=formatted_conversation,
                current_message=message,
                persona_config=self.config
            )
            
            # Add coaching suggestions
            suggestions = self._generate_coaching_suggestions(emotional_context, active_features)
            
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
            # Fallback response in Marcus's voice
            return ChatResponse(
                content="I'm experiencing a temporary setback, but that's just an opportunity to come back stronger! 💪 Let's refocus and tackle this together. What's the most important thing you want to work on right now?",
                persona_id=self.config.id,
                emotion=emotional_context.primary_emotion,
                confidence=0.8,
                features_activated=[],
                persona_config=self.config,
                suggestions=["Set a clear goal", "Take one small action", "Focus on what you can control"]
            )
    
    def _format_coaching_conversation(self, history: List[Dict[str, str]], current_message: str) -> List[Dict[str, str]]:
        """Format conversation with coaching context"""
        formatted = []
        
        for msg in history[-8:]:  # Keep last 8 messages for coaching context
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
    
    def _generate_coaching_suggestions(self, emotional_context: EmotionalContext, active_features: List[str]) -> List[str]:
        """Generate coaching suggestions and action items"""
        suggestions = []
        
        if "goal_planner" in active_features:
            suggestions.extend([
                "Set a SMART goal with deadline",
                "Break your goal into 3 action steps"
            ])
        
        if "habit_tracker" in active_features:
            suggestions.extend([
                "Start with 1% improvement daily",
                "Track your habit for 21 days"
            ])
        
        if "motivation_widget" in active_features:
            suggestions.extend([
                "Connect with your deeper 'why'",
                "Visualize your successful outcome"
            ])
        
        if "action_planning" in active_features:
            suggestions.extend([
                "Create a step-by-step action plan",
                "Set deadlines for each milestone"
            ])
        
        # Emotion-specific suggestions
        if emotional_context.primary_emotion == "frustrated":
            suggestions.extend([
                "Channel frustration into focused action",
                "Identify what you can control"
            ])
        
        elif emotional_context.primary_emotion == "unmotivated":
            suggestions.extend([
                "Start with just 5 minutes",
                "Celebrate small wins"
            ])
        
        elif emotional_context.primary_emotion == "overwhelmed":
            suggestions.extend([
                "Pick your top 3 priorities",
                "Focus on one task at a time"
            ])
        
        return suggestions[:4]  # Limit to 4 suggestions