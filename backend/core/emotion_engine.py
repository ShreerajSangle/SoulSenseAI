"""
Emotion Engine - Advanced Emotional Intelligence System
Detects and analyzes emotions from text input with crisis detection
"""

import re
import asyncio
import json
from typing import Dict, List, Any, Optional, Tuple
from models.schemas import EmotionalContext, EmotionType
from datetime import datetime

class EmotionEngine:
    """Advanced emotion detection and analysis system"""
    
    def __init__(self):
        # Emotion detection patterns and keywords
        self.emotion_patterns = {
            "happy": [
                "happy", "joy", "excited", "thrilled", "delighted", "cheerful",
                "glad", "pleased", "content", "elated", "euphoric", "upbeat",
                "bright", "wonderful", "amazing", "fantastic", "great"
            ],
            "sad": [
                "sad", "depressed", "down", "blue", "melancholy", "gloomy",
                "sorrowful", "dejected", "despondent", "heartbroken", "tearful",
                "crying", "weeping", "miserable", "unhappy", "mournful"
            ],
            "anxious": [
                "anxious", "worried", "nervous", "stressed", "tense", "panic",
                "fear", "scared", "frightened", "uneasy", "apprehensive",
                "restless", "agitated", "jittery", "on edge", "overwhelmed"
            ],
            "angry": [
                "angry", "mad", "furious", "irritated", "annoyed", "frustrated",
                "rage", "livid", "pissed", "enraged", "outraged", "hostile",
                "aggressive", "bitter", "resentful", "indignant"
            ],
            "calm": [
                "calm", "peaceful", "serene", "tranquil", "relaxed", "zen",
                "centered", "balanced", "still", "quiet", "composed", "settled",
                "grounded", "stable", "untroubled", "at ease"
            ],
            "hopeful": [
                "hopeful", "optimistic", "positive", "confident", "encouraged",
                "inspired", "motivated", "determined", "faith", "belief",
                "trust", "looking forward", "excited about", "anticipating"
            ],
            "overwhelmed": [
                "overwhelmed", "swamped", "buried", "drowning", "too much",
                "can't handle", "stressed out", "overloaded", "exhausted",
                "burned out", "at capacity", "breaking point", "maxed out"
            ],
            "lonely": [
                "lonely", "alone", "isolated", "disconnected", "abandoned",
                "solitary", "friendless", "empty", "hollow", "cut off",
                "separated", "alienated", "withdrawn", "by myself"
            ],
            "grateful": [
                "grateful", "thankful", "appreciative", "blessed", "fortunate",
                "glad", "acknowledge", "recognition", "gratitude", "thanks",
                "appreciate", "value", "treasure", "cherish"
            ],
            "frustrated": [
                "frustrated", "stuck", "blocked", "hindered", "thwarted",
                "impeded", "stalled", "hitting wall", "can't progress",
                "roadblock", "obstacle", "barrier", "difficulty"
            ]
        }
        
        # Crisis detection patterns - high priority
        self.crisis_patterns = [
            "suicide", "kill myself", "end it all", "want to die", "better off dead",
            "hurt myself", "self harm", "cut myself", "overdose", "jump off",
            "can't go on", "no point", "hopeless", "give up", "end the pain",
            "not worth living", "everyone would be better", "permanent solution",
            "razor", "pills", "bridge", "gun", "rope", "knife"
        ]
        
        # Support need indicators
        self.support_patterns = {
            "grounding_techniques": [
                "panic", "anxiety attack", "can't breathe", "hyperventilating",
                "dizzy", "shaking", "racing heart", "out of control"
            ],
            "validation": [
                "no one understands", "feel alone", "isolated", "misunderstood",
                "invalidated", "dismissed", "not heard", "ignored"
            ],
            "coping_strategies": [
                "don't know how", "can't handle", "overwhelmed", "breaking down",
                "falling apart", "losing it", "can't cope", "too much"
            ],
            "crisis_support": [
                "emergency", "crisis", "breaking point", "can't take it",
                "desperate", "help me", "urgent", "immediate"
            ]
        }
        
        # Emotional intensity indicators
        self.intensity_modifiers = {
            "very": 0.8,
            "extremely": 0.9,
            "incredibly": 0.9,
            "really": 0.7,
            "so": 0.7,
            "totally": 0.8,
            "completely": 0.9,
            "absolutely": 0.9,
            "utterly": 0.9,
            "super": 0.7,
            "quite": 0.6,
            "somewhat": 0.4,
            "a bit": 0.3,
            "slightly": 0.2,
            "mildly": 0.3
        }
        
        # Valence scoring (negative to positive)
        self.valence_scores = {
            "happy": 0.8,
            "excited": 0.7,
            "grateful": 0.6,
            "hopeful": 0.5,
            "calm": 0.3,
            "peaceful": 0.4,
            "sad": -0.6,
            "angry": -0.5,
            "anxious": -0.4,
            "frustrated": -0.3,
            "overwhelmed": -0.7,
            "lonely": -0.6
        }
        
        # Arousal scoring (calm to excited)
        self.arousal_scores = {
            "excited": 0.9,
            "anxious": 0.8,
            "angry": 0.7,
            "frustrated": 0.6,
            "overwhelmed": 0.8,
            "happy": 0.6,
            "sad": 0.3,
            "calm": 0.1,
            "peaceful": 0.1,
            "grateful": 0.4
        }
    
    async def analyze_emotion(self, text: str) -> EmotionalContext:
        """Analyze emotional context from text input"""
        
        if not text or not text.strip():
            return self._default_emotional_context()
        
        text_lower = text.lower()
        
        # Detect primary and secondary emotions
        detected_emotions = self._detect_emotions(text_lower)
        
        # Calculate emotional intensity
        intensity = self._calculate_intensity(text_lower, detected_emotions)
        
        # Calculate valence and arousal
        valence = self._calculate_valence(detected_emotions)
        arousal = self._calculate_arousal(detected_emotions)
        
        # Detect crisis indicators
        crisis_indicators = self._detect_crisis_indicators(text_lower)
        
        # Detect support needs
        support_needs = self._detect_support_needs(text_lower)
        
        # Detect emotional triggers
        emotional_triggers = self._detect_emotional_triggers(text_lower)
        
        # Calculate confidence score
        confidence = self._calculate_confidence(detected_emotions, text_lower)
        
        return EmotionalContext(
            primary_emotion=detected_emotions[0] if detected_emotions else EmotionType.CALM,
            secondary_emotions=detected_emotions[1:3] if len(detected_emotions) > 1 else [],
            intensity=intensity,
            valence=valence,
            arousal=arousal,
            confidence=confidence,
            emotional_triggers=emotional_triggers,
            support_needs=support_needs,
            crisis_indicators=crisis_indicators
        )
    
    def _detect_emotions(self, text: str) -> List[EmotionType]:
        """Detect emotions from text using pattern matching"""
        emotion_scores = {}
        
        for emotion, patterns in self.emotion_patterns.items():
            score = 0
            for pattern in patterns:
                if pattern in text:
                    score += 1
                    # Boost score for exact matches
                    if f" {pattern} " in f" {text} ":
                        score += 0.5
            
            if score > 0:
                emotion_scores[emotion] = score
        
        # Sort by score and return top emotions
        sorted_emotions = sorted(emotion_scores.items(), key=lambda x: x[1], reverse=True)
        
        detected = []
        for emotion, score in sorted_emotions:
            if score >= 0.5:  # Threshold for emotion detection
                try:
                    detected.append(EmotionType(emotion))
                except ValueError:
                    pass  # Skip invalid emotion types
        
        return detected[:3]  # Return top 3 emotions
    
    def _calculate_intensity(self, text: str, emotions: List[EmotionType]) -> float:
        """Calculate emotional intensity based on modifiers and context"""
        base_intensity = 0.5
        
        # Check for intensity modifiers
        for modifier, multiplier in self.intensity_modifiers.items():
            if modifier in text:
                base_intensity = max(base_intensity, multiplier)
        
        # Check for exclamation marks and caps
        exclamation_count = text.count('!')
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        
        # Adjust intensity based on punctuation and formatting
        if exclamation_count > 0:
            base_intensity += min(exclamation_count * 0.1, 0.3)
        
        if caps_ratio > 0.3:
            base_intensity += 0.2
        
        # Emotional context adjustments
        if any(emotion in ["anxious", "angry", "overwhelmed"] for emotion in emotions):
            base_intensity += 0.1
        
        return min(base_intensity, 1.0)
    
    def _calculate_valence(self, emotions: List[EmotionType]) -> float:
        """Calculate emotional valence (negative to positive)"""
        if not emotions:
            return 0.0
        
        total_valence = 0.0
        count = 0
        
        for emotion in emotions:
            if emotion.value in self.valence_scores:
                total_valence += self.valence_scores[emotion.value]
                count += 1
        
        return total_valence / count if count > 0 else 0.0
    
    def _calculate_arousal(self, emotions: List[EmotionType]) -> float:
        """Calculate emotional arousal (calm to excited)"""
        if not emotions:
            return 0.3
        
        total_arousal = 0.0
        count = 0
        
        for emotion in emotions:
            if emotion.value in self.arousal_scores:
                total_arousal += self.arousal_scores[emotion.value]
                count += 1
        
        return total_arousal / count if count > 0 else 0.3
    
    def _detect_crisis_indicators(self, text: str) -> List[str]:
        """Detect crisis indicators in text"""
        indicators = []
        
        for pattern in self.crisis_patterns:
            if pattern in text:
                indicators.append(pattern)
        
        return indicators
    
    def _detect_support_needs(self, text: str) -> List[str]:
        """Detect what type of support the user needs"""
        needs = []
        
        for need_type, patterns in self.support_patterns.items():
            for pattern in patterns:
                if pattern in text:
                    needs.append(need_type)
                    break
        
        return list(set(needs))
    
    def _detect_emotional_triggers(self, text: str) -> List[str]:
        """Detect emotional triggers mentioned in text"""
        triggers = []
        
        trigger_patterns = {
            "work_stress": ["work", "job", "boss", "deadline", "meeting", "project"],
            "relationship": ["partner", "boyfriend", "girlfriend", "spouse", "family"],
            "health": ["sick", "pain", "doctor", "hospital", "illness", "injury"],
            "financial": ["money", "debt", "bills", "financial", "broke", "expensive"],
            "social": ["friends", "social", "party", "event", "people", "crowd"],
            "academic": ["school", "exam", "test", "grades", "homework", "study"]
        }
        
        for trigger_type, patterns in trigger_patterns.items():
            for pattern in patterns:
                if pattern in text:
                    triggers.append(trigger_type)
                    break
        
        return triggers
    
    def _calculate_confidence(self, emotions: List[EmotionType], text: str) -> float:
        """Calculate confidence in emotion detection"""
        if not emotions:
            return 0.3
        
        # Base confidence
        confidence = 0.5
        
        # Increase confidence for multiple emotion indicators
        if len(emotions) > 1:
            confidence += 0.2
        
        # Increase confidence for longer text
        if len(text) > 50:
            confidence += 0.1
        
        # Increase confidence for emotional language
        emotional_words = sum(1 for emotion_list in self.emotion_patterns.values() 
                            for word in emotion_list if word in text)
        confidence += min(emotional_words * 0.05, 0.3)
        
        return min(confidence, 1.0)
    
    def _default_emotional_context(self) -> EmotionalContext:
        """Return default emotional context for empty input"""
        return EmotionalContext(
            primary_emotion=EmotionType.CALM,
            secondary_emotions=[],
            intensity=0.3,
            valence=0.0,
            arousal=0.3,
            confidence=0.3,
            emotional_triggers=[],
            support_needs=[],
            crisis_indicators=[]
        )
    
    async def get_emotion_summary(self, text: str) -> Dict[str, Any]:
        """Get detailed emotion analysis summary"""
        context = await self.analyze_emotion(text)
        
        return {
            "primary_emotion": context.primary_emotion.value,
            "secondary_emotions": [e.value for e in context.secondary_emotions],
            "intensity": context.intensity,
            "valence": context.valence,
            "arousal": context.arousal,
            "confidence": context.confidence,
            "emotional_triggers": context.emotional_triggers,
            "support_needs": context.support_needs,
            "crisis_indicators": context.crisis_indicators,
            "analysis_timestamp": datetime.now().isoformat()
        }