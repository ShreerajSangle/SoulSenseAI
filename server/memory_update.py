#!/usr/bin/env python3
"""
Dynamic Memory Update System for SoulSense AI
Manages user emotional patterns, conversation history, and personalization data
"""

import json
import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from collections import defaultdict
import numpy as np

@dataclass
class EmotionalPattern:
    emotion: str
    intensity: float
    frequency: int
    context: str
    timestamp: str
    triggers: List[str]

@dataclass
class ConversationMemory:
    session_id: str
    timestamp: str
    user_input: str
    ai_response: str
    emotion_detected: str
    intervention_used: str
    effectiveness_score: float
    user_feedback: Optional[str] = None

@dataclass
class UserPreferences:
    communication_style: str  # formal, casual, empathetic, direct
    preferred_interventions: List[str]
    trigger_words: List[str]
    comfort_topics: List[str]
    avoid_topics: List[str]
    session_length_preference: int
    time_of_day_preference: str

class MemoryUpdateSystem:
    def __init__(self):
        self.emotional_patterns = defaultdict(list)
        self.conversation_history = []
        self.user_preferences = {}
        self.learning_weights = {
            'emotion_frequency': 0.3,
            'intervention_success': 0.4,
            'user_feedback': 0.3
        }
    
    def update_emotional_pattern(self, user_id: str, emotion: str, intensity: float, 
                               context: str, triggers: List[str] = None) -> None:
        """Update user's emotional patterns with new data"""
        pattern = EmotionalPattern(
            emotion=emotion,
            intensity=intensity,
            frequency=1,
            context=context,
            timestamp=datetime.datetime.now().isoformat(),
            triggers=triggers or []
        )
        
        # Check for existing patterns and update frequency
        existing_patterns = self.emotional_patterns[user_id]
        for existing in existing_patterns:
            if existing.emotion == emotion and self._similar_context(existing.context, context):
                existing.frequency += 1
                existing.intensity = (existing.intensity + intensity) / 2  # Running average
                return
        
        # Add new pattern if no similar one exists
        self.emotional_patterns[user_id].append(pattern)
    
    def store_conversation_memory(self, user_id: str, memory: ConversationMemory) -> None:
        """Store conversation for future reference and learning"""
        self.conversation_history.append({
            'user_id': user_id,
            'memory': asdict(memory)
        })
    
    def update_user_preferences(self, user_id: str, preference_updates: Dict[str, Any]) -> None:
        """Update user communication and intervention preferences"""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = UserPreferences(
                communication_style="empathetic",
                preferred_interventions=[],
                trigger_words=[],
                comfort_topics=[],
                avoid_topics=[],
                session_length_preference=30,
                time_of_day_preference="any"
            )
        
        current_prefs = self.user_preferences[user_id]
        for key, value in preference_updates.items():
            if hasattr(current_prefs, key):
                setattr(current_prefs, key, value)
    
    def get_emotional_insights(self, user_id: str) -> Dict[str, Any]:
        """Generate insights from user's emotional patterns"""
        patterns = self.emotional_patterns[user_id]
        if not patterns:
            return {"message": "Insufficient data for insights"}
        
        # Analyze emotion frequency
        emotion_counts = defaultdict(int)
        emotion_intensities = defaultdict(list)
        common_triggers = defaultdict(int)
        
        for pattern in patterns:
            emotion_counts[pattern.emotion] += pattern.frequency
            emotion_intensities[pattern.emotion].append(pattern.intensity)
            for trigger in pattern.triggers:
                common_triggers[trigger] += 1
        
        # Calculate averages and trends
        emotion_averages = {
            emotion: np.mean(intensities) 
            for emotion, intensities in emotion_intensities.items()
        }
        
        most_frequent_emotion = max(emotion_counts, key=emotion_counts.get)
        primary_triggers = sorted(common_triggers.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "most_frequent_emotion": most_frequent_emotion,
            "emotion_averages": emotion_averages,
            "primary_triggers": [trigger for trigger, count in primary_triggers],
            "total_sessions": len(patterns),
            "emotional_volatility": self._calculate_volatility(emotion_intensities),
            "improvement_trends": self._analyze_trends(patterns)
        }
    
    def get_personalized_recommendations(self, user_id: str) -> Dict[str, Any]:
        """Generate personalized intervention recommendations"""
        insights = self.get_emotional_insights(user_id)
        conversation_history = self._get_user_conversations(user_id)
        preferences = self.user_preferences.get(user_id)
        
        if not insights or insights.get("message"):
            return {"recommendations": ["Continue regular check-ins", "Practice mindfulness"]}
        
        recommendations = []
        
        # Based on most frequent emotion
        frequent_emotion = insights["most_frequent_emotion"]
        if frequent_emotion in ["anxiety", "worry", "stress"]:
            recommendations.extend([
                "Practice deep breathing exercises daily",
                "Try progressive muscle relaxation",
                "Consider journaling your worries"
            ])
        elif frequent_emotion in ["sadness", "depression", "low"]:
            recommendations.extend([
                "Engage in physical activity",
                "Practice gratitude exercises",
                "Connect with supportive relationships"
            ])
        
        # Based on triggers
        for trigger in insights["primary_triggers"]:
            if "work" in trigger.lower():
                recommendations.append("Develop work-life balance strategies")
            elif "relationship" in trigger.lower():
                recommendations.append("Practice communication skills")
        
        # Based on successful interventions
        successful_interventions = self._get_successful_interventions(user_id)
        recommendations.extend(successful_interventions[:2])
        
        return {
            "recommendations": list(set(recommendations)),  # Remove duplicates
            "confidence_level": self._calculate_confidence(len(conversation_history)),
            "next_focus_areas": self._suggest_focus_areas(insights)
        }
    
    def _similar_context(self, context1: str, context2: str) -> bool:
        """Check if two contexts are similar"""
        context1_words = set(context1.lower().split())
        context2_words = set(context2.lower().split())
        intersection = context1_words.intersection(context2_words)
        union = context1_words.union(context2_words)
        return len(intersection) / len(union) > 0.5 if union else False
    
    def _calculate_volatility(self, emotion_intensities: Dict[str, List[float]]) -> float:
        """Calculate emotional volatility score"""
        all_intensities = []
        for intensities in emotion_intensities.values():
            all_intensities.extend(intensities)
        return float(np.std(all_intensities)) if all_intensities else 0.0
    
    def _analyze_trends(self, patterns: List[EmotionalPattern]) -> Dict[str, str]:
        """Analyze improvement or decline trends"""
        if len(patterns) < 3:
            return {"trend": "insufficient_data"}
        
        # Sort by timestamp
        sorted_patterns = sorted(patterns, key=lambda x: x.timestamp)
        recent_patterns = sorted_patterns[-5:]  # Last 5 sessions
        early_patterns = sorted_patterns[:5]   # First 5 sessions
        
        recent_avg = np.mean([p.intensity for p in recent_patterns])
        early_avg = np.mean([p.intensity for p in early_patterns])
        
        if recent_avg < early_avg - 0.5:
            return {"trend": "improving", "change": round(early_avg - recent_avg, 2)}
        elif recent_avg > early_avg + 0.5:
            return {"trend": "concerning", "change": round(recent_avg - early_avg, 2)}
        else:
            return {"trend": "stable", "change": round(abs(recent_avg - early_avg), 2)}
    
    def _get_user_conversations(self, user_id: str) -> List[Dict]:
        """Get conversation history for specific user"""
        return [conv for conv in self.conversation_history if conv['user_id'] == user_id]
    
    def _get_successful_interventions(self, user_id: str) -> List[str]:
        """Identify most successful interventions for user"""
        conversations = self._get_user_conversations(user_id)
        intervention_scores = defaultdict(list)
        
        for conv in conversations:
            memory = conv['memory']
            intervention = memory.get('intervention_used')
            effectiveness = memory.get('effectiveness_score', 0)
            if intervention and effectiveness:
                intervention_scores[intervention].append(effectiveness)
        
        # Calculate average effectiveness
        avg_scores = {
            intervention: np.mean(scores)
            for intervention, scores in intervention_scores.items()
        }
        
        # Return top 3 most effective interventions
        sorted_interventions = sorted(avg_scores.items(), key=lambda x: x[1], reverse=True)
        return [intervention for intervention, score in sorted_interventions[:3]]
    
    def _calculate_confidence(self, conversation_count: int) -> float:
        """Calculate confidence level based on data availability"""
        if conversation_count < 3:
            return 0.3
        elif conversation_count < 10:
            return 0.6
        elif conversation_count < 20:
            return 0.8
        else:
            return 0.95
    
    def _suggest_focus_areas(self, insights: Dict[str, Any]) -> List[str]:
        """Suggest areas to focus on based on patterns"""
        focus_areas = []
        
        volatility = insights.get("emotional_volatility", 0)
        if volatility > 1.5:
            focus_areas.append("emotional_regulation")
        
        frequent_emotion = insights.get("most_frequent_emotion", "")
        if frequent_emotion in ["anxiety", "worry"]:
            focus_areas.append("anxiety_management")
        elif frequent_emotion in ["sadness", "depression"]:
            focus_areas.append("mood_enhancement")
        
        trends = insights.get("improvement_trends", {})
        if trends.get("trend") == "concerning":
            focus_areas.append("crisis_prevention")
        
        return focus_areas or ["general_wellness"]

# Global instance
memory_system = MemoryUpdateSystem()