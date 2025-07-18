#!/usr/bin/env python3
"""
Persona Emotional Intelligence Integration
Enhances each persona with advanced emotional understanding and response capabilities
"""

import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass

@dataclass
class EmotionalInsight:
    """Emotional insight for persona responses"""
    primary_emotion: str
    intensity: float
    context_factors: List[str]
    recommended_approach: str
    therapeutic_techniques: List[str]
    vulnerability_level: float
    support_needs: List[str]

class PersonaEmotionalIntelligence:
    """Advanced emotional intelligence for persona interactions"""
    
    def __init__(self):
        self.emotion_patterns = {
            # High-intensity emotions requiring careful handling
            'anxious': {
                'intensity_threshold': 7.0,
                'approaches': {
                    'sarah': 'clinical_validation_and_grounding',
                    'maya': 'breathing_and_spiritual_comfort',
                    'alex': 'gentle_normalization_and_support',
                    'marcus': 'structured_anxiety_management'
                },
                'techniques': ['breathing_exercises', 'grounding', 'cognitive_reframing', 'mindfulness'],
                'avoid': ['overwhelming_advice', 'dismissive_tone', 'complex_solutions']
            },
            'overwhelmed': {
                'intensity_threshold': 6.5,
                'approaches': {
                    'sarah': 'step_by_step_processing',
                    'maya': 'energy_clearing_and_simplification',
                    'alex': 'breaking_things_down_together',
                    'marcus': 'priority_setting_and_action_steps'
                },
                'techniques': ['task_breaking', 'priority_setting', 'energy_management', 'support_network'],
                'avoid': ['adding_more_tasks', 'complex_planning', 'pressure']
            },
            'sad': {
                'intensity_threshold': 6.0,
                'approaches': {
                    'sarah': 'compassionate_exploration',
                    'maya': 'heart_opening_and_healing',
                    'alex': 'gentle_companionship',
                    'marcus': 'gentle_forward_movement'
                },
                'techniques': ['emotional_validation', 'self_compassion', 'gentle_activities', 'connection'],
                'avoid': ['forced_positivity', 'immediate_solutions', 'minimizing_feelings']
            },
            'stressed': {
                'intensity_threshold': 7.0,
                'approaches': {
                    'sarah': 'stress_analysis_and_coping',
                    'maya': 'stress_release_rituals',
                    'alex': 'stress_humor_and_perspective',
                    'marcus': 'stress_management_systems'
                },
                'techniques': ['stress_management', 'time_management', 'relaxation', 'perspective_shift'],
                'avoid': ['adding_pressure', 'time_urgency', 'perfectionism']
            },
            'angry': {
                'intensity_threshold': 6.5,
                'approaches': {
                    'sarah': 'anger_exploration_and_processing',
                    'maya': 'anger_transformation_practices',
                    'alex': 'healthy_anger_expression',
                    'marcus': 'constructive_anger_channeling'
                },
                'techniques': ['anger_processing', 'boundary_setting', 'physical_release', 'communication'],
                'avoid': ['suppression_advice', 'judgment', 'immediate_action_pressure']
            },
            'excited': {
                'intensity_threshold': 5.0,
                'approaches': {
                    'sarah': 'excitement_balance_and_planning',
                    'maya': 'grounded_excitement_practices',
                    'alex': 'shared_excitement_and_celebration',
                    'marcus': 'channeling_excitement_into_action'
                },
                'techniques': ['energy_channeling', 'goal_setting', 'celebration', 'momentum_building'],
                'avoid': ['dampening_enthusiasm', 'over_planning', 'perfectionism']
            },
            'confused': {
                'intensity_threshold': 5.5,
                'approaches': {
                    'sarah': 'confusion_exploration_and_clarity',
                    'maya': 'inner_wisdom_access',
                    'alex': 'confusion_normalization_and_sorting',
                    'marcus': 'systematic_clarity_building'
                },
                'techniques': ['clarification_questions', 'perspective_gathering', 'step_by_step_analysis', 'intuition_access'],
                'avoid': ['immediate_answers', 'complexity', 'pressure_for_clarity']
            }
        }
        
        # Emotional combinations requiring special handling
        self.emotion_combinations = {
            ('anxious', 'excited'): {
                'approach': 'balance_nervous_energy',
                'techniques': ['grounding_excitement', 'structured_planning', 'energy_management']
            },
            ('sad', 'angry'): {
                'approach': 'process_complex_grief',
                'techniques': ['emotional_layering', 'safe_expression', 'validation_both_emotions']
            },
            ('overwhelmed', 'motivated'): {
                'approach': 'harness_motivation_carefully',
                'techniques': ['priority_setting', 'energy_pacing', 'sustainable_action']
            }
        }
        
        # Vulnerability indicators requiring extra care
        self.vulnerability_indicators = [
            'crisis_language',
            'self_harm_references',
            'hopelessness_expressions',
            'isolation_mentions',
            'overwhelming_life_events',
            'relationship_trauma',
            'work_burnout',
            'family_stress'
        ]

    async def analyze_emotional_context(self, user_message: str, conversation_history: List[Dict], persona_id: str) -> EmotionalInsight:
        """Analyze emotional context and provide persona-specific insights"""
        
        # Extract emotions from message
        detected_emotions = await self._extract_emotions(user_message)
        primary_emotion = detected_emotions[0] if detected_emotions else 'neutral'
        
        # Calculate emotional intensity
        intensity = await self._calculate_intensity(user_message, conversation_history)
        
        # Identify context factors
        context_factors = await self._identify_context_factors(user_message, conversation_history)
        
        # Assess vulnerability level
        vulnerability_level = await self._assess_vulnerability(user_message, context_factors)
        
        # Get persona-specific approach
        recommended_approach = await self._get_persona_approach(primary_emotion, persona_id, intensity)
        
        # Select therapeutic techniques
        therapeutic_techniques = await self._select_techniques(primary_emotion, persona_id, intensity)
        
        # Identify support needs
        support_needs = await self._identify_support_needs(primary_emotion, intensity, context_factors)
        
        return EmotionalInsight(
            primary_emotion=primary_emotion,
            intensity=intensity,
            context_factors=context_factors,
            recommended_approach=recommended_approach,
            therapeutic_techniques=therapeutic_techniques,
            vulnerability_level=vulnerability_level,
            support_needs=support_needs
        )

    async def _extract_emotions(self, message: str) -> List[str]:
        """Extract emotions from user message using keyword analysis"""
        message_lower = message.lower()
        detected = []
        
        emotion_keywords = {
            'anxious': ['anxious', 'worried', 'nervous', 'panic', 'fear', 'scared', 'stress', 'tension'],
            'sad': ['sad', 'depressed', 'down', 'blue', 'grief', 'loss', 'heartbroken', 'lonely'],
            'angry': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'rage', 'annoyed'],
            'overwhelmed': ['overwhelmed', 'too much', 'can\'t handle', 'drowning', 'buried'],
            'excited': ['excited', 'thrilled', 'pumped', 'energized', 'enthusiastic'],
            'confused': ['confused', 'lost', 'uncertain', 'unclear', 'puzzled', 'mixed up'],
            'hopeful': ['hopeful', 'optimistic', 'positive', 'looking forward', 'encouraged'],
            'grateful': ['grateful', 'thankful', 'appreciative', 'blessed', 'lucky'],
            'motivated': ['motivated', 'determined', 'driven', 'focused', 'ready']
        }
        
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                detected.append(emotion)
        
        return detected if detected else ['neutral']

    async def _calculate_intensity(self, message: str, history: List[Dict]) -> float:
        """Calculate emotional intensity based on language and context"""
        intensity_indicators = {
            'extreme_words': ['extremely', 'completely', 'totally', 'absolutely', 'incredibly'],
            'urgent_language': ['need', 'must', 'have to', 'urgent', 'emergency'],
            'repetition': ['very very', 'so so', 'really really'],
            'emphasis': ['!!!', 'CAPS', 'definitely', 'absolutely']
        }
        
        base_intensity = 5.0
        message_lower = message.lower()
        
        # Check for intensity indicators
        for category, indicators in intensity_indicators.items():
            for indicator in indicators:
                if indicator in message_lower:
                    if category == 'extreme_words':
                        base_intensity += 1.5
                    elif category == 'urgent_language':
                        base_intensity += 1.0
                    elif category == 'repetition':
                        base_intensity += 0.8
                    elif category == 'emphasis':
                        base_intensity += 0.5
        
        # Consider recent conversation patterns
        if len(history) > 0:
            recent_messages = history[-3:]  # Last 3 messages
            for msg in recent_messages:
                if any(urgent in msg.get('content', '').lower() for urgent in ['crisis', 'emergency', 'can\'t']):
                    base_intensity += 0.5
        
        return min(10.0, base_intensity)

    async def _identify_context_factors(self, message: str, history: List[Dict]) -> List[str]:
        """Identify contextual factors affecting emotional state"""
        factors = []
        message_lower = message.lower()
        
        context_patterns = {
            'work_stress': ['work', 'job', 'boss', 'deadline', 'meeting', 'colleague'],
            'relationship_issues': ['partner', 'boyfriend', 'girlfriend', 'spouse', 'relationship', 'family'],
            'health_concerns': ['health', 'sick', 'pain', 'medical', 'doctor', 'hospital'],
            'financial_stress': ['money', 'bills', 'debt', 'financial', 'budget', 'job loss'],
            'life_transitions': ['moving', 'new job', 'graduation', 'marriage', 'divorce', 'change'],
            'social_isolation': ['alone', 'lonely', 'isolated', 'no friends', 'nobody'],
            'academic_pressure': ['school', 'exam', 'grade', 'study', 'homework', 'university'],
            'sleep_issues': ['tired', 'exhausted', 'insomnia', 'sleep', 'can\'t sleep']
        }
        
        for factor, keywords in context_patterns.items():
            if any(keyword in message_lower for keyword in keywords):
                factors.append(factor)
        
        return factors

    async def _assess_vulnerability(self, message: str, context_factors: List[str]) -> float:
        """Assess vulnerability level requiring special care"""
        vulnerability_score = 0.0
        message_lower = message.lower()
        
        high_risk_indicators = [
            'want to die', 'kill myself', 'end it all', 'no point', 'give up',
            'hurt myself', 'self harm', 'suicidal', 'hopeless', 'worthless'
        ]
        
        medium_risk_indicators = [
            'can\'t go on', 'too much', 'breaking point', 'lost', 'trapped',
            'nobody cares', 'alone', 'desperate', 'crisis'
        ]
        
        for indicator in high_risk_indicators:
            if indicator in message_lower:
                vulnerability_score += 3.0
        
        for indicator in medium_risk_indicators:
            if indicator in message_lower:
                vulnerability_score += 1.5
        
        # Context factors that increase vulnerability
        high_risk_contexts = ['social_isolation', 'relationship_issues', 'health_concerns']
        for context in context_factors:
            if context in high_risk_contexts:
                vulnerability_score += 0.5
        
        return min(10.0, vulnerability_score)

    async def _get_persona_approach(self, emotion: str, persona_id: str, intensity: float) -> str:
        """Get persona-specific approach for handling emotion"""
        if emotion in self.emotion_patterns:
            pattern = self.emotion_patterns[emotion]
            base_approach = pattern['approaches'].get(persona_id, 'general_support')
            
            # Modify approach based on intensity
            if intensity > pattern['intensity_threshold']:
                if persona_id == 'sarah':
                    return f"high_intensity_{base_approach}"
                elif persona_id == 'maya':
                    return f"gentle_{base_approach}"
                elif persona_id == 'alex':
                    return f"careful_{base_approach}"
                elif persona_id == 'marcus':
                    return f"supportive_{base_approach}"
            
            return base_approach
        
        return 'general_emotional_support'

    async def _select_techniques(self, emotion: str, persona_id: str, intensity: float) -> List[str]:
        """Select appropriate therapeutic techniques"""
        if emotion in self.emotion_patterns:
            base_techniques = self.emotion_patterns[emotion]['techniques']
            
            # Persona-specific technique preferences
            persona_techniques = {
                'sarah': ['cognitive_reframing', 'thought_challenging', 'emotional_processing'],
                'maya': ['breathing_exercises', 'meditation', 'energy_work', 'mindfulness'],
                'alex': ['peer_support', 'humor_therapy', 'social_connection'],
                'marcus': ['goal_setting', 'action_planning', 'structure_building']
            }
            
            # Combine base techniques with persona preferences
            selected = []
            for technique in base_techniques:
                selected.append(technique)
            
            # Add persona-specific techniques
            for technique in persona_techniques.get(persona_id, []):
                if technique not in selected:
                    selected.append(technique)
            
            return selected[:4]  # Limit to top 4 techniques
        
        return ['emotional_validation', 'active_listening']

    async def _identify_support_needs(self, emotion: str, intensity: float, context_factors: List[str]) -> List[str]:
        """Identify what type of support the user needs"""
        needs = []
        
        if intensity > 7.0:
            needs.extend(['immediate_comfort', 'crisis_support'])
        elif intensity > 5.0:
            needs.extend(['emotional_validation', 'coping_strategies'])
        else:
            needs.extend(['gentle_guidance', 'encouragement'])
        
        # Context-based needs
        context_needs = {
            'work_stress': ['stress_management', 'boundary_setting'],
            'relationship_issues': ['communication_skills', 'relationship_guidance'],
            'social_isolation': ['connection_building', 'social_support'],
            'health_concerns': ['health_advocacy', 'medical_support'],
            'financial_stress': ['practical_planning', 'resource_guidance']
        }
        
        for context in context_factors:
            if context in context_needs:
                needs.extend(context_needs[context])
        
        return list(set(needs))  # Remove duplicates

    def generate_emotional_prompt_context(self, insight: EmotionalInsight, persona_id: str) -> str:
        """Generate emotional context for persona prompts"""
        context = f"""
EMOTIONAL INTELLIGENCE CONTEXT:
- Primary emotion detected: {insight.primary_emotion}
- Emotional intensity: {insight.intensity}/10
- Vulnerability level: {insight.vulnerability_level}/10
- Context factors: {', '.join(insight.context_factors)}
- Recommended approach: {insight.recommended_approach}
- Therapeutic techniques to consider: {', '.join(insight.therapeutic_techniques)}
- Support needs: {', '.join(insight.support_needs)}

PERSONA GUIDANCE:
"""
        
        if persona_id == 'sarah':
            context += """As Dr. Sarah, use your clinical expertise to:
- Provide emotional validation and professional insight
- Apply appropriate therapeutic techniques with care
- Monitor for crisis indicators and respond appropriately
- Use evidence-based approaches while maintaining warmth"""
            
        elif persona_id == 'maya':
            context += """As Maya, use your spiritual wisdom to:
- Offer grounding and centering practices
- Provide holistic healing approaches
- Use breathwork and mindfulness appropriately
- Create a sacred space for emotional processing"""
            
        elif persona_id == 'alex':
            context += """As Alex, use your peer support skills to:
- Normalize emotions and provide relatable support
- Use appropriate humor only when safe and helpful
- Offer friendship and companionship
- Share relatable experiences when appropriate"""
            
        elif persona_id == 'marcus':
            context += """As Marcus, use your coaching expertise to:
- Provide structured support and actionable guidance
- Help channel emotions into positive action when appropriate
- Offer motivation while respecting emotional needs
- Balance goal-orientation with emotional sensitivity"""
        
        if insight.vulnerability_level > 5.0:
            context += f"\n\nSPECIAL CARE NEEDED: High vulnerability detected ({insight.vulnerability_level}/10). Prioritize safety, provide extra emotional support, and avoid overwhelming advice."
        
        return context