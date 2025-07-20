import re
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass

@dataclass
class EmotionResult:
    """Result of emotion detection"""
    primary_emotion: str
    confidence: float
    intensity: int  # 1-10 scale
    secondary_emotions: List[str]
    valence: float  # -1 to 1 (negative to positive)
    arousal: float  # 0 to 1 (calm to excited)
    crisis_indicators: List[str]
    support_needs: List[str]

class EmotionEngine:
    """Emotion detection and analysis engine for SoulSense AI"""
    
    def __init__(self):
        self.emotion_keywords = {
            "anxious": ["anxious", "worried", "nervous", "stressed", "panic", "overwhelmed", "tense"],
            "sad": ["sad", "depressed", "down", "blue", "hopeless", "disappointed", "grief"],
            "angry": ["angry", "mad", "frustrated", "annoyed", "irritated", "furious", "rage"],
            "happy": ["happy", "joy", "excited", "cheerful", "pleased", "content", "elated"],
            "fear": ["afraid", "scared", "terrified", "fearful", "worried", "anxious", "panic"],
            "disgust": ["disgusted", "revolted", "sick", "nauseated", "repulsed"],
            "surprised": ["surprised", "shocked", "amazed", "astonished", "startled"],
            "neutral": ["okay", "fine", "normal", "alright", "stable", "calm"],
            "confused": ["confused", "lost", "uncertain", "unclear", "puzzled", "bewildered"],
            "lonely": ["lonely", "isolated", "alone", "abandoned", "disconnected", "empty"],
            "guilty": ["guilty", "ashamed", "regretful", "remorseful", "sorry", "bad"],
            "proud": ["proud", "accomplished", "successful", "confident", "achieved", "won"],
            "grateful": ["grateful", "thankful", "appreciative", "blessed", "lucky"],
            "hopeful": ["hopeful", "optimistic", "positive", "encouraged", "confident", "bright"],
            "love": ["love", "affection", "caring", "warm", "close", "connected", "bond"]
        }
        
        self.crisis_keywords = [
            "suicide", "kill myself", "end it", "not worth living", "want to die",
            "self harm", "cut myself", "hurt myself", "harm myself",
            "give up", "can't go on", "no point", "better off dead",
            "worthless", "hopeless", "no way out", "can't take it"
        ]
        
        self.intensity_modifiers = {
            "very": 1.5, "extremely": 2.0, "really": 1.3, "so": 1.4, "incredibly": 1.8,
            "completely": 1.7, "totally": 1.6, "utterly": 1.9, "absolutely": 1.8,
            "slightly": 0.7, "somewhat": 0.8, "a bit": 0.6, "a little": 0.6,
            "kind of": 0.7, "sort of": 0.7, "mildly": 0.6
        }
    
    def detect_emotion(self, text: str, context: Optional[Dict] = None) -> EmotionResult:
        """
        Detect emotions in text using keyword matching and pattern recognition
        """
        text_lower = text.lower()
        
        # Check for crisis indicators first
        crisis_indicators = self._detect_crisis_indicators(text_lower)
        
        # Detect emotions with confidence scores
        emotion_scores = {}
        for emotion, keywords in self.emotion_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    # Base score for keyword presence
                    base_score = 0.3
                    
                    # Check for intensity modifiers
                    intensity_multiplier = self._get_intensity_multiplier(text_lower, keyword)
                    score += base_score * intensity_multiplier
            
            if score > 0:
                emotion_scores[emotion] = min(score, 1.0)  # Cap at 1.0
        
        # Determine primary emotion
        if emotion_scores:
            primary_emotion = max(emotion_scores, key=emotion_scores.get)
            confidence = emotion_scores[primary_emotion]
        else:
            primary_emotion = "neutral"
            confidence = 0.5
        
        # Get secondary emotions
        secondary_emotions = [
            emotion for emotion, score in emotion_scores.items()
            if emotion != primary_emotion and score > 0.2
        ]
        
        # Calculate valence and arousal
        valence = self._calculate_valence(primary_emotion, emotion_scores)
        arousal = self._calculate_arousal(primary_emotion, emotion_scores)
        
        # Calculate intensity (1-10 scale)
        intensity = self._calculate_intensity(confidence, text_lower)
        
        # Determine support needs
        support_needs = self._determine_support_needs(primary_emotion, crisis_indicators, intensity)
        
        return EmotionResult(
            primary_emotion=primary_emotion,
            confidence=confidence,
            intensity=intensity,
            secondary_emotions=secondary_emotions,
            valence=valence,
            arousal=arousal,
            crisis_indicators=crisis_indicators,
            support_needs=support_needs
        )
    
    def _detect_crisis_indicators(self, text: str) -> List[str]:
        """Detect crisis indicators in text"""
        indicators = []
        for keyword in self.crisis_keywords:
            if keyword in text:
                indicators.append(keyword)
        return indicators
    
    def _get_intensity_multiplier(self, text: str, keyword: str) -> float:
        """Get intensity multiplier based on modifiers near the keyword"""
        # Find position of keyword
        keyword_pos = text.find(keyword)
        if keyword_pos == -1:
            return 1.0
        
        # Check for modifiers in nearby text (20 characters before/after)
        start = max(0, keyword_pos - 20)
        end = min(len(text), keyword_pos + len(keyword) + 20)
        context = text[start:end]
        
        multiplier = 1.0
        for modifier, mult in self.intensity_modifiers.items():
            if modifier in context:
                multiplier *= mult
        
        return multiplier
    
    def _calculate_valence(self, primary_emotion: str, emotion_scores: Dict[str, float]) -> float:
        """Calculate emotional valence (-1 to 1)"""
        valence_mapping = {
            "happy": 0.8, "joy": 0.9, "excited": 0.7, "proud": 0.8, "grateful": 0.9,
            "hopeful": 0.7, "love": 0.9, "content": 0.6, "pleased": 0.7,
            "sad": -0.7, "depressed": -0.9, "disappointed": -0.6, "grief": -0.8,
            "angry": -0.6, "frustrated": -0.5, "annoyed": -0.4, "furious": -0.8,
            "anxious": -0.5, "worried": -0.4, "stressed": -0.6, "panic": -0.8,
            "fear": -0.7, "afraid": -0.7, "scared": -0.6, "terrified": -0.9,
            "lonely": -0.6, "isolated": -0.7, "guilty": -0.6, "ashamed": -0.7,
            "disgusted": -0.6, "confused": -0.2, "surprised": 0.2, "neutral": 0.0
        }
        
        return valence_mapping.get(primary_emotion, 0.0)
    
    def _calculate_arousal(self, primary_emotion: str, emotion_scores: Dict[str, float]) -> float:
        """Calculate emotional arousal (0 to 1)"""
        arousal_mapping = {
            "excited": 0.9, "panic": 0.9, "furious": 0.8, "terrified": 0.8,
            "elated": 0.8, "rage": 0.9, "surprised": 0.7, "shocked": 0.8,
            "anxious": 0.7, "worried": 0.6, "stressed": 0.7, "angry": 0.6,
            "happy": 0.6, "sad": 0.3, "depressed": 0.2, "content": 0.3,
            "calm": 0.1, "neutral": 0.3, "confused": 0.4, "lonely": 0.3,
            "grateful": 0.4, "hopeful": 0.5, "love": 0.5, "guilty": 0.4
        }
        
        return arousal_mapping.get(primary_emotion, 0.5)
    
    def _calculate_intensity(self, confidence: float, text: str) -> int:
        """Calculate emotion intensity on 1-10 scale"""
        base_intensity = int(confidence * 10)
        
        # Adjust based on text characteristics
        if any(word in text for word in ["very", "extremely", "really", "so", "incredibly"]):
            base_intensity += 2
        elif any(word in text for word in ["completely", "totally", "utterly", "absolutely"]):
            base_intensity += 3
        elif any(word in text for word in ["slightly", "somewhat", "a bit", "a little"]):
            base_intensity -= 2
        
        # Check for exclamation marks and caps
        if "!" in text:
            base_intensity += 1
        if any(word.isupper() for word in text.split() if len(word) > 3):
            base_intensity += 1
        
        return max(1, min(10, base_intensity))
    
    def _determine_support_needs(self, primary_emotion: str, crisis_indicators: List[str], intensity: int) -> List[str]:
        """Determine what type of support the user needs"""
        needs = []
        
        # Crisis support
        if crisis_indicators:
            needs.append("crisis_support")
            needs.append("professional_help")
        
        # Emotion-specific support
        if primary_emotion in ["sad", "depressed", "hopeless"]:
            needs.extend(["emotional_validation", "mood_lifting", "hope_building"])
        elif primary_emotion in ["anxious", "worried", "stressed", "panic"]:
            needs.extend(["calming_techniques", "breathing_exercises", "grounding"])
        elif primary_emotion in ["angry", "frustrated", "furious"]:
            needs.extend(["anger_management", "cooling_down", "perspective_taking"])
        elif primary_emotion in ["lonely", "isolated"]:
            needs.extend(["connection", "social_support", "companionship"])
        elif primary_emotion in ["confused", "uncertain"]:
            needs.extend(["clarification", "guidance", "problem_solving"])
        elif primary_emotion in ["guilty", "ashamed"]:
            needs.extend(["self_compassion", "forgiveness", "perspective_shift"])
        elif primary_emotion in ["happy", "excited", "proud"]:
            needs.extend(["celebration", "encouragement", "goal_building"])
        
        # Intensity-based support
        if intensity >= 8:
            needs.append("immediate_support")
        elif intensity >= 6:
            needs.append("active_coping")
        else:
            needs.append("gentle_support")
        
        return list(set(needs))  # Remove duplicates
    
    def get_emotion_summary(self, emotion_result: EmotionResult) -> Dict[str, Any]:
        """Get a summary of emotion detection results"""
        return {
            "primary_emotion": emotion_result.primary_emotion,
            "confidence": round(emotion_result.confidence, 2),
            "intensity": emotion_result.intensity,
            "secondary_emotions": emotion_result.secondary_emotions,
            "valence": round(emotion_result.valence, 2),
            "arousal": round(emotion_result.arousal, 2),
            "crisis_indicators": emotion_result.crisis_indicators,
            "support_needs": emotion_result.support_needs,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_persona_recommendations(self, emotion_result: EmotionResult) -> List[Dict[str, Any]]:
        """Get persona recommendations based on emotion analysis"""
        recommendations = []
        
        # Sarah (CBT therapist) - good for cognitive issues
        if emotion_result.primary_emotion in ["anxious", "worried", "depressed", "sad", "guilty"]:
            recommendations.append({
                "persona_id": "sarah",
                "confidence": 0.9,
                "reason": "CBT techniques can help with cognitive patterns and emotional processing"
            })
        
        # Alex (peer support) - good for relatability and normalization
        if emotion_result.primary_emotion in ["lonely", "isolated", "confused", "frustrated"]:
            recommendations.append({
                "persona_id": "alex",
                "confidence": 0.8,
                "reason": "Peer support can provide understanding and normalization"
            })
        
        # Marcus (life coach) - good for motivation and goal-setting
        if emotion_result.primary_emotion in ["hopeless", "stuck", "unmotivated"] or "goal" in emotion_result.support_needs:
            recommendations.append({
                "persona_id": "marcus",
                "confidence": 0.85,
                "reason": "Goal-setting and motivation can help build forward momentum"
            })
        
        # Maya (mindfulness) - good for stress, anxiety, and emotional regulation
        if emotion_result.primary_emotion in ["anxious", "stressed", "overwhelmed", "angry"] or emotion_result.arousal > 0.7:
            recommendations.append({
                "persona_id": "maya",
                "confidence": 0.9,
                "reason": "Mindfulness and breathing techniques can help with emotional regulation"
            })
        
        # Sort by confidence
        recommendations.sort(key=lambda x: x["confidence"], reverse=True)
        
        return recommendations[:2]  # Return top 2 recommendations