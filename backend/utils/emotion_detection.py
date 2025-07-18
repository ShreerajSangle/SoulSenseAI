"""
Emotion detection utilities for SoulSense AI
Simple rule-based emotion classification
"""

import re
from typing import Optional, Dict, List


class EmotionDetector:
    """Simple emotion detection based on keywords and patterns"""
    
    def __init__(self):
        self.emotion_keywords = {
            "anxiety": [
                "anxious", "worried", "nervous", "panic", "overwhelming", "stressed", 
                "scared", "fear", "afraid", "tense", "restless", "uneasy"
            ],
            "sadness": [
                "sad", "depressed", "down", "crying", "tears", "grief", "loss", 
                "lonely", "empty", "hopeless", "devastated", "heartbroken"
            ],
            "anger": [
                "angry", "mad", "furious", "rage", "frustrated", "annoyed", 
                "irritated", "pissed", "livid", "hate", "disgusted"
            ],
            "joy": [
                "happy", "excited", "joy", "thrilled", "amazing", "wonderful", 
                "fantastic", "great", "awesome", "love", "grateful", "blessed"
            ],
            "fear": [
                "terrified", "scared", "frightened", "afraid", "panic", "horror", 
                "dread", "phobia", "nightmare", "paranoid"
            ],
            "confusion": [
                "confused", "lost", "uncertain", "unsure", "mixed up", 
                "don't know", "unclear", "puzzled", "bewildered"
            ],
            "love": [
                "love", "adore", "care", "affection", "romance", "crush", 
                "relationship", "dating", "partner", "boyfriend", "girlfriend"
            ],
            "guilt": [
                "guilty", "shame", "regret", "sorry", "fault", "blame", 
                "mistake", "wrong", "bad person", "disappointed in myself"
            ],
            "hope": [
                "hope", "optimistic", "positive", "better", "improve", 
                "future", "dreams", "goals", "possibilities", "potential"
            ],
            "exhaustion": [
                "tired", "exhausted", "drained", "worn out", "fatigue", 
                "burn out", "overwhelmed", "can't cope", "too much"
            ]
        }
        
        # Crisis keywords that need immediate attention
        self.crisis_keywords = [
            "suicide", "kill myself", "end it all", "not worth living", 
            "self harm", "cut myself", "hurt myself", "die", "death wish"
        ]
    
    def detect_emotion(self, text: str) -> Optional[str]:
        """Detect primary emotion from text"""
        if not text:
            return None
        
        text_lower = text.lower()
        
        # Check for crisis indicators first
        if self._contains_crisis_keywords(text_lower):
            return "crisis"
        
        # Score emotions based on keyword matches
        emotion_scores = {}
        
        for emotion, keywords in self.emotion_keywords.items():
            score = 0
            for keyword in keywords:
                # Count occurrences of each keyword
                count = len(re.findall(r'\b' + re.escape(keyword) + r'\b', text_lower))
                score += count
            
            if score > 0:
                emotion_scores[emotion] = score
        
        # Return emotion with highest score
        if emotion_scores:
            return max(emotion_scores.items(), key=lambda x: x[1])[0]
        
        return None
    
    def detect_intensity(self, text: str) -> int:
        """Detect emotional intensity on scale 1-10"""
        if not text:
            return 1
        
        text_lower = text.lower()
        
        # High intensity indicators
        high_intensity = [
            "extremely", "very", "really", "so", "too", "incredibly", 
            "absolutely", "completely", "totally", "!!!", "omg"
        ]
        
        # Low intensity indicators  
        low_intensity = [
            "a bit", "slightly", "somewhat", "kind of", "sort of", 
            "maybe", "perhaps", "little"
        ]
        
        intensity = 5  # baseline
        
        for indicator in high_intensity:
            if indicator in text_lower:
                intensity += 2
        
        for indicator in low_intensity:
            if indicator in text_lower:
                intensity -= 1
        
        # Check for all caps (high intensity)
        if text.isupper() and len(text) > 10:
            intensity += 2
        
        # Check for excessive punctuation
        if "!!!" in text or "???" in text:
            intensity += 1
        
        return max(1, min(10, intensity))
    
    def get_emotion_context(self, text: str) -> Dict[str, any]:
        """Get comprehensive emotion analysis"""
        emotion = self.detect_emotion(text)
        intensity = self.detect_intensity(text)
        
        context = {
            "primary_emotion": emotion,
            "intensity": intensity,
            "crisis_detected": self._contains_crisis_keywords(text.lower()),
            "needs_support": emotion in ["anxiety", "sadness", "fear", "crisis"],
            "positive_sentiment": emotion in ["joy", "hope", "love"]
        }
        
        return context
    
    def _contains_crisis_keywords(self, text: str) -> bool:
        """Check if text contains crisis indicators"""
        for keyword in self.crisis_keywords:
            if keyword in text:
                return True
        return False
    
    def get_supportive_response_type(self, emotion: str) -> str:
        """Get recommended response type for emotion"""
        response_map = {
            "anxiety": "grounding",
            "sadness": "validation", 
            "anger": "acknowledgment",
            "fear": "reassurance",
            "crisis": "immediate_support",
            "confusion": "clarification",
            "guilt": "self_compassion",
            "exhaustion": "rest_encouragement",
            "joy": "celebration",
            "hope": "encouragement",
            "love": "positive_reinforcement"
        }
        
        return response_map.get(emotion, "general_support")