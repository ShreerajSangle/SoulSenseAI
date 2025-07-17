"""
Quick Reply Engine - Dynamic Context-Aware Suggestion System
Generates persona-specific, emotionally-aligned quick replies based on conversation context
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class IntentType(Enum):
    ANXIETY = "anxiety"
    SADNESS = "sadness"
    STRESS = "stress"
    GOAL_SETTING = "goal_setting"
    REFLECTION = "reflection"
    CRISIS = "crisis"
    CELEBRATION = "celebration"
    CONFUSION = "confusion"
    ANGER = "anger"
    GRATITUDE = "gratitude"
    GENERAL = "general"

class ConversationPhase(Enum):
    START = "start"
    EXPLORATION = "exploration"
    DEEPENING = "deepening"
    RESOLUTION = "resolution"
    CLOSURE = "closure"

@dataclass
class QuickReply:
    text: str
    action_type: str  # "message", "breathing", "journal", "goal", "mantra"
    action_data: Optional[Dict[str, Any]] = None
    emoji: str = ""
    priority: int = 1  # 1-5, higher = more relevant

class QuickReplyEngine:
    def __init__(self):
        self.intent_keywords = {
            IntentType.ANXIETY: [
                "anxious", "worried", "nervous", "panic", "overwhelming", "scared",
                "tense", "restless", "racing thoughts", "can't breathe"
            ],
            IntentType.SADNESS: [
                "sad", "depressed", "down", "hopeless", "empty", "lonely",
                "crying", "tears", "grief", "heartbroken", "low"
            ],
            IntentType.STRESS: [
                "stressed", "pressure", "overwhelmed", "busy", "exhausted",
                "burnt out", "deadline", "too much", "chaos"
            ],
            IntentType.GOAL_SETTING: [
                "goal", "plan", "achieve", "want to", "trying to", "working on",
                "improve", "change", "habit", "progress"
            ],
            IntentType.REFLECTION: [
                "thinking", "wondering", "reflecting", "realize", "understand",
                "insight", "learned", "aware", "notice"
            ],
            IntentType.CRISIS: [
                "hurt myself", "end it", "suicide", "kill myself", "give up",
                "can't go on", "pointless", "better off dead"
            ],
            IntentType.CELEBRATION: [
                "happy", "excited", "proud", "accomplished", "great news",
                "success", "won", "achieved", "breakthrough"
            ],
            IntentType.ANGER: [
                "angry", "mad", "furious", "frustrated", "irritated", "rage",
                "annoyed", "pissed", "hate", "unfair"
            ]
        }

    def classify_intent(self, message: str) -> IntentType:
        """Classify user message intent using keyword matching"""
        message_lower = message.lower()
        
        # Crisis detection has highest priority
        for keyword in self.intent_keywords[IntentType.CRISIS]:
            if keyword in message_lower:
                return IntentType.CRISIS
        
        # Count matches for each intent
        intent_scores = {}
        for intent, keywords in self.intent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                intent_scores[intent] = score
        
        if intent_scores:
            return max(intent_scores.items(), key=lambda x: x[1])[0]
        
        return IntentType.GENERAL

    def determine_phase(self, message_count: int, conversation_duration: int) -> ConversationPhase:
        """Determine conversation phase based on message count and duration"""
        if message_count <= 2:
            return ConversationPhase.START
        elif message_count <= 6:
            return ConversationPhase.EXPLORATION
        elif message_count <= 12:
            return ConversationPhase.DEEPENING
        elif conversation_duration > 20:  # minutes
            return ConversationPhase.CLOSURE
        else:
            return ConversationPhase.RESOLUTION

    def generate_maya_replies(self, intent: IntentType, phase: ConversationPhase) -> List[QuickReply]:
        """Generate Maya's spiritual, mindful quick replies"""
        replies = []
        
        if intent == IntentType.ANXIETY:
            replies = [
                QuickReply("🧘 3-min breathing pause?", "breathing", {"type": "anxiety_relief"}, "🧘", 5),
                QuickReply("📿 Grounding mantra?", "mantra", {"type": "anxiety"}, "📿", 4),
                QuickReply("💬 Share what triggered this?", "message", None, "💬", 3),
                QuickReply("🌿 Body scan meditation?", "breathing", {"type": "body_scan"}, "🌿", 4)
            ]
        elif intent == IntentType.SADNESS:
            replies = [
                QuickReply("🤗 Self-compassion practice?", "mantra", {"type": "self_love"}, "🤗", 5),
                QuickReply("📝 Gentle reflection?", "journal", {"prompt": "What does my heart need today?"}, "📝", 4),
                QuickReply("🌸 Loving-kindness meditation?", "breathing", {"type": "loving_kindness"}, "🌸", 4),
                QuickReply("💫 What would comfort you?", "message", None, "💫", 3)
            ]
        elif intent == IntentType.STRESS:
            replies = [
                QuickReply("🌊 Ocean breathing?", "breathing", {"type": "ocean_breath"}, "🌊", 5),
                QuickReply("🎯 Mindful pause?", "breathing", {"type": "mindful_pause"}, "🎯", 4),
                QuickReply("🌱 What can you release?", "message", None, "🌱", 3)
            ]
        elif intent == IntentType.CELEBRATION:
            replies = [
                QuickReply("🎉 Gratitude moment?", "journal", {"prompt": "What am I most grateful for?"}, "🎉", 4),
                QuickReply("✨ Joy meditation?", "breathing", {"type": "joy_breathing"}, "✨", 4),
                QuickReply("🙏 Share your blessing?", "message", None, "🙏", 3)
            ]
        else:
            replies = [
                QuickReply("🧘 Mindful check-in?", "breathing", {"type": "check_in"}, "🧘", 3),
                QuickReply("💭 What's on your heart?", "message", None, "💭", 2),
                QuickReply("🌟 Present moment?", "breathing", {"type": "presence"}, "🌟", 3)
            ]
        
        return replies[:3]  # Max 3 suggestions

    def generate_sarah_replies(self, intent: IntentType, phase: ConversationPhase) -> List[QuickReply]:
        """Generate Dr. Sarah's clinical, therapeutic quick replies"""
        replies = []
        
        if intent == IntentType.ANXIETY:
            replies = [
                QuickReply("🧠 Reframe this thought?", "message", None, "🧠", 5),
                QuickReply("📊 Rate anxiety 1-10?", "message", None, "📊", 4),
                QuickReply("🔍 What evidence supports this?", "message", None, "🔍", 4),
                QuickReply("📝 Thought record?", "journal", {"prompt": "CBT thought record"}, "📝", 3)
            ]
        elif intent == IntentType.SADNESS:
            replies = [
                QuickReply("💭 Process this feeling?", "message", None, "💭", 5),
                QuickReply("📝 Emotion journal?", "journal", {"prompt": "Emotional processing"}, "📝", 4),
                QuickReply("🎯 What needs attention?", "message", None, "🎯", 3),
                QuickReply("🤝 Validate this experience?", "message", None, "🤝", 4)
            ]
        elif intent == IntentType.CRISIS:
            replies = [
                QuickReply("🆘 Crisis support resources?", "message", None, "🆘", 5),
                QuickReply("📞 Connect with help?", "message", None, "📞", 5),
                QuickReply("🛡️ Safety plan activation?", "message", None, "🛡️", 5)
            ]
        elif intent == IntentType.GOAL_SETTING:
            replies = [
                QuickReply("🎯 SMART goal breakdown?", "goal", {"type": "smart_goal"}, "🎯", 5),
                QuickReply("📈 Track progress?", "goal", {"type": "progress"}, "📈", 4),
                QuickReply("🗺️ Action plan?", "message", None, "🗺️", 3)
            ]
        else:
            replies = [
                QuickReply("🤔 Explore this deeper?", "message", None, "🤔", 3),
                QuickReply("📝 Quick reflection?", "journal", {"prompt": "What's important here?"}, "📝", 2),
                QuickReply("💡 Insight check?", "message", None, "💡", 2)
            ]
        
        return replies[:3]

    def generate_alex_replies(self, intent: IntentType, phase: ConversationPhase) -> List[QuickReply]:
        """Generate Alex's peer support, relatable quick replies"""
        replies = []
        
        if intent == IntentType.ANXIETY:
            replies = [
                QuickReply("😅 Been there too!", "message", None, "😅", 4),
                QuickReply("🤝 Want some solidarity?", "message", None, "🤝", 4),
                QuickReply("💪 Anxiety busting tips?", "message", None, "💪", 3),
                QuickReply("😌 Chill playlist rec?", "message", None, "😌", 2)
            ]
        elif intent == IntentType.SADNESS:
            replies = [
                QuickReply("🫂 Virtual hug?", "message", None, "🫂", 5),
                QuickReply("💙 You're not alone", "message", None, "💙", 4),
                QuickReply("🍿 Comfort movie rec?", "message", None, "🍿", 3),
                QuickReply("☕ Self-care check?", "message", None, "☕", 3)
            ]
        elif intent == IntentType.CELEBRATION:
            replies = [
                QuickReply("🎉 YES! Tell me more!", "message", None, "🎉", 5),
                QuickReply("🥳 Victory dance time?", "message", None, "🥳", 4),
                QuickReply("📸 Capture this moment?", "journal", {"prompt": "Celebration journal"}, "📸", 3)
            ]
        elif intent == IntentType.ANGER:
            replies = [
                QuickReply("😤 Totally get that rage", "message", None, "😤", 4),
                QuickReply("🥊 Healthy outlet ideas?", "message", None, "🥊", 3),
                QuickReply("🔥 Vent it out?", "message", None, "🔥", 4)
            ]
        else:
            replies = [
                QuickReply("😊 What's up?", "message", None, "😊", 2),
                QuickReply("🤗 Here for you", "message", None, "🤗", 3),
                QuickReply("💬 Keep sharing", "message", None, "💬", 2)
            ]
        
        return replies[:3]

    def generate_marcus_replies(self, intent: IntentType, phase: ConversationPhase) -> List[QuickReply]:
        """Generate Marcus's coaching, action-oriented quick replies"""
        replies = []
        
        if intent == IntentType.ANXIETY:
            replies = [
                QuickReply("✅ Mini calm-goal?", "goal", {"type": "anxiety_management"}, "✅", 5),
                QuickReply("🚶‍♂️ Clarity walk plan?", "message", None, "🚶‍♂️", 4),
                QuickReply("📊 Action vs worry ratio?", "message", None, "📊", 3),
                QuickReply("🎯 Control vs influence?", "message", None, "🎯", 4)
            ]
        elif intent == IntentType.GOAL_SETTING:
            replies = [
                QuickReply("🚀 Goal breakdown?", "goal", {"type": "breakdown"}, "🚀", 5),
                QuickReply("📅 Timeline planning?", "goal", {"type": "timeline"}, "📅", 4),
                QuickReply("🏆 Success metrics?", "goal", {"type": "metrics"}, "🏆", 4),
                QuickReply("⚡ First action step?", "message", None, "⚡", 3)
            ]
        elif intent == IntentType.STRESS:
            replies = [
                QuickReply("📝 Priority matrix?", "goal", {"type": "prioritize"}, "📝", 5),
                QuickReply("⏰ Time audit?", "message", None, "⏰", 4),
                QuickReply("🔄 Delegate options?", "message", None, "🔄", 3)
            ]
        elif intent == IntentType.SADNESS:
            replies = [
                QuickReply("📓 Reflection journal?", "journal", {"prompt": "Growth-focused reflection"}, "📓", 4),
                QuickReply("💪 Strength inventory?", "message", None, "💪", 4),
                QuickReply("🌱 Small win today?", "goal", {"type": "small_win"}, "🌱", 3)
            ]
        else:
            replies = [
                QuickReply("🎯 What's the goal?", "message", None, "🎯", 3),
                QuickReply("⚡ Next action?", "message", None, "⚡", 2),
                QuickReply("📊 Progress check?", "goal", {"type": "progress"}, "📊", 2)
            ]
        
        return replies[:3]

    def generate_quick_replies(
        self, 
        persona_id: str, 
        user_message: str, 
        conversation_history: List[Dict],
        conversation_context: Dict
    ) -> List[QuickReply]:
        """
        Main function to generate persona-specific quick replies
        """
        intent = self.classify_intent(user_message)
        phase = self.determine_phase(
            len(conversation_history), 
            conversation_context.get('duration_minutes', 0)
        )
        
        # Generate persona-specific replies
        if persona_id == "maya":
            replies = self.generate_maya_replies(intent, phase)
        elif persona_id == "sarah":
            replies = self.generate_sarah_replies(intent, phase)
        elif persona_id == "alex":
            replies = self.generate_alex_replies(intent, phase)
        elif persona_id == "marcus":
            replies = self.generate_marcus_replies(intent, phase)
        else:
            # Fallback generic replies
            replies = [
                QuickReply("💭 Tell me more", "message", None, "💭", 2),
                QuickReply("🤝 I'm listening", "message", None, "🤝", 2),
                QuickReply("💡 What helps?", "message", None, "💡", 1)
            ]
        
        # Sort by priority and return top 3
        replies.sort(key=lambda x: x.priority, reverse=True)
        return replies[:3]

    def get_fallback_replies(self, persona_id: str) -> List[QuickReply]:
        """Fallback replies when context is unclear"""
        fallbacks = {
            "maya": [
                QuickReply("🧘 Mindful moment?", "breathing", {"type": "mindful"}, "🧘", 2),
                QuickReply("💫 What's present?", "message", None, "💫", 2)
            ],
            "sarah": [
                QuickReply("🤔 Explore further?", "message", None, "🤔", 2),
                QuickReply("📝 Quick check-in?", "journal", {"prompt": "How are you?"}, "📝", 2)
            ],
            "alex": [
                QuickReply("😊 What's happening?", "message", None, "😊", 2),
                QuickReply("🤗 I'm here", "message", None, "🤗", 2)
            ],
            "marcus": [
                QuickReply("🎯 What's the focus?", "message", None, "🎯", 2),
                QuickReply("⚡ Action needed?", "message", None, "⚡", 2)
            ]
        }
        return fallbacks.get(persona_id, [])