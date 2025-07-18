"""
Emotion detection and analysis engine for SoulSense AI
Provides emotional intelligence capabilities for better therapeutic responses
"""

import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class EmotionResult:
    """Result of emotion analysis"""
    primary_emotion: str
    confidence: float
    intensity: float  # 0.0 to 1.0
    secondary_emotions: List[str]
    crisis_indicators: List[str]
    support_needs: List[str]
    emotional_complexity: float


class EmotionEngine:
    """Advanced emotion detection and analysis system"""
    
    def __init__(self):
        # Primary emotion categories with keywords
        self.emotion_patterns = {
            "anxiety": [
                r"\b(anxious|worried|nervous|panic|stress|overwhelmed|scared)\b",
                r"\b(can't (cope|handle)|too much|breaking down)\b",
                r"\b(heart racing|sweating|shaking|dizzy)\b"
            ],
            "depression": [
                r"\b(sad|depressed|down|empty|hopeless|worthless)\b",
                r"\b(can't sleep|tired|exhausted|drained)\b",
                r"\b(nothing matters|give up|pointless)\b"
            ],
            "anger": [
                r"\b(angry|furious|mad|irritated|frustrated|rage)\b",
                r"\b(can't stand|hate|disgusted|fed up)\b",
                r"\b(want to scream|punch|break)\b"
            ],
            "joy": [
                r"\b(happy|excited|joyful|elated|thrilled|grateful)\b",
                r"\b(amazing|wonderful|fantastic|great|awesome)\b",
                r"\b(love|blessed|lucky|thankful)\b"
            ],
            "fear": [
                r"\b(afraid|terrified|scared|frightened|fearful)\b",
                r"\b(nightmare|phobia|panic|dread)\b",
                r"\b(can't breathe|frozen|paralyzed)\b"
            ],
            "grief": [
                r"\b(loss|grief|mourning|bereaved|devastated)\b",
                r"\b(miss|gone|died|death|funeral)\b",
                r"\b(crying|tears|heartbroken|aching)\b"
            ],
            "confusion": [
                r"\b(confused|lost|don't know|uncertain|unclear)\b",
                r"\b(can't decide|mixed up|don't understand)\b",
                r"\b(what should I|how do I|why)\b"
            ],
            "shame": [
                r"\b(ashamed|embarrassed|guilty|humiliated)\b",
                r"\b(my fault|I'm terrible|I messed up)\b",
                r"\b(hide|can't face|disappointed)\b"
            ],
            "loneliness": [
                r"\b(lonely|alone|isolated|disconnected)\b",
                r"\b(no one|nobody|by myself|abandoned)\b",
                r"\b(miss (having|being)|wish I had)\b"
            ],
            "hope": [
                r"\b(hope|hopeful|optimistic|positive|better)\b",
                r"\b(looking forward|excited about|can't wait)\b",
                r"\b(things will|getting better|improving)\b"
            ]
        }
        
        # Crisis indicator patterns
        self.crisis_patterns = [
            r"\b(want to die|suicide|kill myself|end it all)\b",
            r"\b(hurt myself|self-harm|cutting|worthless)\b",
            r"\b(can't go on|give up|no point|better off dead)\b",
            r"\b(plan to|thinking about (dying|suicide))\b"
        ]
        
        # Support need indicators
        self.support_patterns = {
            "immediate_help": [
                r"\b(crisis|emergency|urgent|desperate|can't cope)\b",
                r"\b(right now|immediately|need help)\b"
            ],
            "listening_ear": [
                r"\b(need to talk|someone to listen|hear me out)\b",
                r"\b(understand|get it|relate)\b"
            ],
            "practical_advice": [
                r"\b(what should I|how do I|help me figure)\b",
                r"\b(steps|plan|strategy|solution)\b"
            ],
            "emotional_validation": [
                r"\b(normal|okay to feel|valid|makes sense)\b",
                r"\b(not alone|others feel|common)\b"
            ],
            "coping_strategies": [
                r"\b(cope|manage|deal with|handle|get through)\b",
                r"\b(techniques|methods|strategies|tools)\b"
            ]
        }
    
    def analyze_emotion(self, text: str, context: Dict[str, Any] = None) -> EmotionResult:
        """
        Analyze emotion in text with context awareness
        
        Args:
            text: User's message text
            context: Additional context (previous messages, persona, etc.)
        
        Returns:
            EmotionResult with comprehensive analysis
        """
        text_lower = text.lower()
        
        # Detect emotions with confidence scores
        emotion_scores = {}
        for emotion, patterns in self.emotion_patterns.items():
            score = 0.0
            matches = 0
            
            for pattern in patterns:
                pattern_matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
                if pattern_matches > 0:
                    score += pattern_matches * 0.3
                    matches += pattern_matches
            
            if score > 0:
                # Adjust score based on text length and context
                normalized_score = min(score / max(len(text.split()) * 0.1, 1), 1.0)
                emotion_scores[emotion] = normalized_score
        
        # Determine primary emotion
        if emotion_scores:
            primary_emotion = max(emotion_scores, key=emotion_scores.get)
            confidence = emotion_scores[primary_emotion]
        else:
            primary_emotion = "neutral"
            confidence = 0.8
        
        # Get secondary emotions (scores > 0.2)
        secondary_emotions = [
            emotion for emotion, score in emotion_scores.items() 
            if score > 0.2 and emotion != primary_emotion
        ]
        
        # Detect crisis indicators
        crisis_indicators = []
        for pattern in self.crisis_patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                crisis_indicators.append("suicide_risk")
                break
        
        # Detect support needs
        support_needs = []
        for support_type, patterns in self.support_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    support_needs.append(support_type)
                    break
        
        # Calculate emotional intensity based on language intensity
        intensity_indicators = [
            r"\b(very|extremely|incredibly|absolutely|totally)\b",
            r"\b(!!|!!!)\b",
            r"\b(SO|REALLY|SUPER)\b",
            r"\b(can't|won't|don't)\b"
        ]
        
        intensity = 0.5  # baseline
        for pattern in intensity_indicators:
            matches = len(re.findall(pattern, text, re.IGNORECASE))
            intensity += matches * 0.1
        
        intensity = min(intensity, 1.0)
        
        # Calculate emotional complexity
        complexity = len(emotion_scores) * 0.2 + len(secondary_emotions) * 0.1
        complexity = min(complexity, 1.0)
        
        return EmotionResult(
            primary_emotion=primary_emotion,
            confidence=confidence,
            intensity=intensity,
            secondary_emotions=secondary_emotions,
            crisis_indicators=crisis_indicators,
            support_needs=support_needs,
            emotional_complexity=complexity
        )
    
    def get_emotion_summary(self, emotion_result: EmotionResult) -> Dict[str, Any]:
        """Generate a summary of emotion analysis for storage"""
        return {
            "primary_emotion": emotion_result.primary_emotion,
            "confidence": emotion_result.confidence,
            "intensity": emotion_result.intensity,
            "secondary_emotions": emotion_result.secondary_emotions,
            "crisis_indicators": emotion_result.crisis_indicators,
            "support_needs": emotion_result.support_needs,
            "emotional_complexity": emotion_result.emotional_complexity,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_persona_recommendations(self, emotion_result: EmotionResult) -> Dict[str, float]:
        """
        Recommend which personas would be most helpful based on emotion analysis
        
        Returns:
            Dict mapping persona_id to suitability score (0.0 to 1.0)
        """
        recommendations = {
            "sarah": 0.5,  # Clinical therapist baseline
            "maya": 0.5,   # Mindfulness expert baseline
            "alex": 0.5,   # Peer counselor baseline
            "marcus": 0.5  # Life coach baseline
        }
        
        emotion = emotion_result.primary_emotion
        
        # Adjust recommendations based on primary emotion
        if emotion in ["anxiety", "panic", "stress"]:
            recommendations["maya"] += 0.3  # Mindfulness for anxiety
            recommendations["sarah"] += 0.2  # Clinical support
        elif emotion in ["depression", "hopelessness", "grief"]:
            recommendations["sarah"] += 0.3  # Clinical expertise
            recommendations["alex"] += 0.2   # Peer support
        elif emotion in ["anger", "frustration"]:
            recommendations["sarah"] += 0.2  # Professional guidance
            recommendations["marcus"] += 0.2  # Structured approach
        elif emotion in ["confusion", "lost"]:
            recommendations["marcus"] += 0.3  # Goal-setting and clarity
            recommendations["sarah"] += 0.1
        elif emotion in ["loneliness", "isolated"]:
            recommendations["alex"] += 0.3   # Peer connection
            recommendations["maya"] += 0.1   # Self-compassion
        elif emotion in ["joy", "excited", "hope"]:
            recommendations["alex"] += 0.2   # Celebration and encouragement
            recommendations["marcus"] += 0.2  # Goal reinforcement
        
        # Crisis situations favor clinical support
        if emotion_result.crisis_indicators:
            recommendations["sarah"] += 0.4
            recommendations["maya"] += 0.2
        
        # Normalize scores to 0.0-1.0 range
        for persona_id in recommendations:
            recommendations[persona_id] = min(recommendations[persona_id], 1.0)
        
        return recommendations
    
    def generate_emotion_context(self, emotion_result: EmotionResult, recent_emotions: List[str] = None) -> str:
        """
        Generate contextual information about the user's emotional state
        for inclusion in persona prompts
        """
        context_parts = []
        
        # Primary emotion context
        emotion = emotion_result.primary_emotion
        intensity_desc = "mildly" if emotion_result.intensity < 0.4 else "moderately" if emotion_result.intensity < 0.7 else "strongly"
        
        context_parts.append(f"User is currently feeling {intensity_desc} {emotion}")
        
        # Secondary emotions
        if emotion_result.secondary_emotions:
            context_parts.append(f"Also experiencing: {', '.join(emotion_result.secondary_emotions)}")
        
        # Support needs
        if emotion_result.support_needs:
            needs_desc = {
                "immediate_help": "needs immediate emotional support",
                "listening_ear": "wants someone to listen and understand",
                "practical_advice": "seeking practical guidance and solutions",
                "emotional_validation": "needs emotional validation and reassurance",
                "coping_strategies": "looking for coping techniques and tools"
            }
            
            need_descriptions = [needs_desc.get(need, need) for need in emotion_result.support_needs[:2]]
            context_parts.append(f"Support needs: {', '.join(need_descriptions)}")
        
        # Crisis indicators
        if emotion_result.crisis_indicators:
            context_parts.append("⚠️ CRISIS INDICATORS DETECTED - Provide immediate compassionate support and consider professional resources")
        
        return ". ".join(context_parts) + "."