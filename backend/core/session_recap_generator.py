#!/usr/bin/env python3
"""
Intelligent Session Recap Generator
Creates meaningful conversation summaries based on actual chat content
"""

import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass

@dataclass
class SessionRecap:
    """Session recap data structure"""
    session_id: str
    persona_id: str
    conversation_summary: str
    key_topics: List[str]
    emotional_journey: str
    insights_gained: List[str]
    therapeutic_techniques_used: List[str]
    progress_notes: str
    next_session_suggestions: List[str]
    mood_change: str
    session_rating: float
    duration_minutes: int
    message_count: int

class SessionRecapGenerator:
    """Generates intelligent session recaps from conversation data"""
    
    def __init__(self):
        self.persona_styles = {
            'maya': {
                'summary_style': 'spiritual_reflective',
                'techniques': ['breathwork', 'meditation', 'chakra_work', 'mindfulness', 'energy_healing'],
                'insights_focus': 'inner_wisdom_and_spiritual_growth'
            },
            'sarah': {
                'summary_style': 'clinical_therapeutic',
                'techniques': ['cognitive_reframing', 'emotional_processing', 'cbt_techniques', 'mindfulness', 'grounding'],
                'insights_focus': 'therapeutic_progress_and_coping_strategies'
            },
            'alex': {
                'summary_style': 'friendly_supportive',
                'techniques': ['peer_support', 'humor_therapy', 'encouragement', 'validation', 'social_connection'],
                'insights_focus': 'personal_growth_and_peer_connection'
            },
            'marcus': {
                'summary_style': 'goal_oriented_coaching',
                'techniques': ['goal_setting', 'action_planning', 'motivation_building', 'habit_formation', 'accountability'],
                'insights_focus': 'achievement_progress_and_life_coaching'
            }
        }

    async def generate_session_recap(
        self, 
        conversation_history: List[Dict[str, Any]], 
        persona_id: str,
        session_id: str,
        user_id: str
    ) -> SessionRecap:
        """Generate comprehensive session recap from conversation"""
        
        if not conversation_history or len(conversation_history) < 2:
            return self._create_minimal_recap(session_id, persona_id)
        
        # Extract conversation data
        user_messages = [msg for msg in conversation_history if msg.get('role') == 'user']
        assistant_messages = [msg for msg in conversation_history if msg.get('role') == 'assistant']
        
        # Calculate session metrics
        message_count = len(conversation_history)
        duration_minutes = self._estimate_duration(message_count)
        
        # Analyze conversation content
        key_topics = await self._extract_key_topics(user_messages)
        emotional_journey = await self._analyze_emotional_journey(user_messages, persona_id)
        insights_gained = await self._identify_insights(conversation_history, persona_id)
        techniques_used = await self._identify_techniques_used(assistant_messages, persona_id)
        
        # Generate persona-specific summary
        conversation_summary = await self._generate_conversation_summary(
            conversation_history, persona_id
        )
        
        # Create progress notes
        progress_notes = await self._generate_progress_notes(
            user_messages, assistant_messages, persona_id
        )
        
        # Generate next session suggestions
        next_suggestions = await self._generate_next_session_suggestions(
            key_topics, emotional_journey, persona_id
        )
        
        # Analyze mood change
        mood_change = await self._analyze_mood_change(user_messages)
        
        # Calculate session rating
        session_rating = await self._calculate_session_rating(
            conversation_history, insights_gained, techniques_used
        )
        
        return SessionRecap(
            session_id=session_id,
            persona_id=persona_id,
            conversation_summary=conversation_summary,
            key_topics=key_topics,
            emotional_journey=emotional_journey,
            insights_gained=insights_gained,
            therapeutic_techniques_used=techniques_used,
            progress_notes=progress_notes,
            next_session_suggestions=next_suggestions,
            mood_change=mood_change,
            session_rating=session_rating,
            duration_minutes=duration_minutes,
            message_count=message_count
        )

    async def _extract_key_topics(self, user_messages: List[Dict]) -> List[str]:
        """Extract key topics from user messages"""
        topics = []
        
        # Topic keywords mapping
        topic_keywords = {
            'work_stress': ['work', 'job', 'boss', 'deadline', 'colleague', 'workplace', 'career'],
            'relationships': ['partner', 'family', 'friend', 'relationship', 'dating', 'marriage', 'divorce'],
            'anxiety': ['anxious', 'worry', 'nervous', 'panic', 'fear', 'stress', 'overwhelmed'],
            'depression': ['sad', 'depressed', 'hopeless', 'empty', 'lonely', 'worthless'],
            'self_esteem': ['confidence', 'self-worth', 'insecurity', 'comparison', 'validation'],
            'life_changes': ['moving', 'transition', 'change', 'new', 'different', 'uncertainty'],
            'goals': ['goal', 'ambition', 'dream', 'achieve', 'success', 'motivation'],
            'health': ['health', 'sleep', 'tired', 'energy', 'exercise', 'medical'],
            'financial': ['money', 'financial', 'debt', 'budget', 'expenses', 'income'],
            'spiritual': ['spiritual', 'meaning', 'purpose', 'meditation', 'peace', 'soul']
        }
        
        # Combine all user messages
        all_text = ' '.join([msg.get('content', '') for msg in user_messages]).lower()
        
        # Check for topic keywords
        for topic, keywords in topic_keywords.items():
            if any(keyword in all_text for keyword in keywords):
                topics.append(topic.replace('_', ' '))
        
        return topics[:5]  # Return top 5 topics

    async def _analyze_emotional_journey(self, user_messages: List[Dict], persona_id: str) -> str:
        """Analyze emotional progression through the conversation"""
        if len(user_messages) < 2:
            return "Brief emotional check-in"
        
        # Analyze emotional indicators in messages
        first_message = user_messages[0].get('content', '').lower()
        last_messages = ' '.join([msg.get('content', '') for msg in user_messages[-2:]]).lower()
        
        # Emotional progression patterns
        if any(word in first_message for word in ['anxious', 'worried', 'stressed', 'overwhelmed']):
            if any(word in last_messages for word in ['better', 'calmer', 'relieved', 'clearer']):
                return "Started feeling anxious and found some relief and clarity"
            else:
                return "Explored anxiety and stress with supportive guidance"
        
        elif any(word in first_message for word in ['sad', 'depressed', 'down', 'empty']):
            if any(word in last_messages for word in ['hopeful', 'better', 'understood', 'validated']):
                return "Processed sadness and gained emotional validation and hope"
            else:
                return "Shared feelings of sadness and received compassionate support"
        
        elif any(word in first_message for word in ['confused', 'lost', 'uncertain']):
            if any(word in last_messages for word in ['clear', 'direction', 'plan', 'steps']):
                return "Moved from confusion to clarity with actionable direction"
            else:
                return "Explored uncertainty and gained supportive perspective"
        
        elif any(word in first_message for word in ['excited', 'happy', 'good']):
            return "Shared positive emotions and celebrated growth"
        
        else:
            return "Engaged in meaningful emotional processing and self-reflection"

    async def _identify_insights(self, conversation_history: List[Dict], persona_id: str) -> List[str]:
        """Identify key insights from the conversation"""
        insights = []
        
        # Look for insight patterns in assistant responses
        assistant_messages = [msg for msg in conversation_history if msg.get('role') == 'assistant']
        
        # Common insight patterns
        insight_patterns = {
            'self_awareness': ['notice', 'aware', 'recognize', 'realize', 'understand yourself'],
            'coping_strategies': ['cope', 'manage', 'handle', 'deal with', 'strategy'],
            'perspective_shift': ['perspective', 'view', 'see differently', 'reframe', 'look at'],
            'emotional_validation': ['valid', 'normal', 'understandable', 'makes sense'],
            'strength_recognition': ['strength', 'capable', 'resilient', 'strong', 'able'],
            'goal_clarity': ['goal', 'direction', 'focus', 'priority', 'step'],
            'mindfulness': ['present', 'moment', 'breathe', 'mindful', 'aware'],
            'connection': ['support', 'not alone', 'together', 'connection', 'relationship']
        }
        
        all_assistant_text = ' '.join([msg.get('content', '') for msg in assistant_messages]).lower()
        
        for insight_type, keywords in insight_patterns.items():
            if any(keyword in all_assistant_text for keyword in keywords):
                persona_insight = self._format_persona_insight(insight_type, persona_id)
                if persona_insight:
                    insights.append(persona_insight)
        
        return insights[:4]  # Return top 4 insights

    def _format_persona_insight(self, insight_type: str, persona_id: str) -> str:
        """Format insights based on persona style"""
        insight_formats = {
            'maya': {
                'self_awareness': 'Deepened connection with your inner wisdom',
                'coping_strategies': 'Discovered spiritual practices for emotional balance',
                'perspective_shift': 'Gained new perspective through mindful reflection',
                'emotional_validation': 'Honored and validated your emotional experience',
                'strength_recognition': 'Recognized your inner resilience and spiritual strength',
                'goal_clarity': 'Aligned with your authentic path and purpose',
                'mindfulness': 'Cultivated present-moment awareness and breath connection',
                'connection': 'Strengthened your connection to inner peace and support'
            },
            'sarah': {
                'self_awareness': 'Increased self-awareness of thoughts and feelings',
                'coping_strategies': 'Developed healthy coping mechanisms and tools',
                'perspective_shift': 'Learned cognitive reframing techniques',
                'emotional_validation': 'Received validation for your emotional experience',
                'strength_recognition': 'Identified personal strengths and resilience',
                'goal_clarity': 'Set clear therapeutic goals and direction',
                'mindfulness': 'Practiced grounding and mindfulness techniques',
                'connection': 'Built therapeutic rapport and trust'
            },
            'alex': {
                'self_awareness': 'Gained insight into your experiences and feelings',
                'coping_strategies': 'Found relatable ways to handle challenges',
                'perspective_shift': 'Discovered new ways to look at situations',
                'emotional_validation': 'Felt heard and understood by a supportive friend',
                'strength_recognition': 'Recognized how capable and strong you really are',
                'goal_clarity': 'Got clarity on what you want to focus on',
                'mindfulness': 'Learned to be present and kind to yourself',
                'connection': 'Felt less alone and more connected'
            },
            'marcus': {
                'self_awareness': 'Gained clarity on your current situation and goals',
                'coping_strategies': 'Developed actionable strategies for challenges',
                'perspective_shift': 'Reframed obstacles as growth opportunities',
                'emotional_validation': 'Acknowledged your efforts and progress',
                'strength_recognition': 'Identified your capabilities and potential',
                'goal_clarity': 'Established clear, achievable objectives',
                'mindfulness': 'Learned to focus on what you can control',
                'connection': 'Built accountability and coaching partnership'
            }
        }
        
        return insight_formats.get(persona_id, {}).get(insight_type, '')

    async def _identify_techniques_used(self, assistant_messages: List[Dict], persona_id: str) -> List[str]:
        """Identify therapeutic techniques used in the session"""
        techniques = []
        persona_techniques = self.persona_styles.get(persona_id, {}).get('techniques', [])
        
        all_text = ' '.join([msg.get('content', '') for msg in assistant_messages]).lower()
        
        # Technique keywords
        technique_keywords = {
            'breathing_exercises': ['breath', 'breathing', 'inhale', 'exhale'],
            'cognitive_reframing': ['think', 'thoughts', 'perspective', 'reframe'],
            'mindfulness': ['mindful', 'present', 'moment', 'awareness'],
            'grounding': ['ground', 'feet', 'senses', 'here', 'now'],
            'goal_setting': ['goal', 'plan', 'step', 'action'],
            'emotional_validation': ['understand', 'valid', 'makes sense', 'normal'],
            'peer_support': ['relate', 'similar', 'experience', 'friend'],
            'meditation': ['meditat', 'quiet', 'peace', 'center'],
            'encouragement': ['believe', 'capable', 'strong', 'can do'],
            'problem_solving': ['solution', 'option', 'choice', 'consider']
        }
        
        for technique, keywords in technique_keywords.items():
            if any(keyword in all_text for keyword in keywords):
                if technique in persona_techniques or len(persona_techniques) == 0:
                    techniques.append(technique.replace('_', ' ').title())
        
        return techniques[:4]

    async def _generate_conversation_summary(self, conversation_history: List[Dict], persona_id: str) -> str:
        """Generate a conversational summary based on persona style"""
        if len(conversation_history) < 2:
            return "Brief introduction and connection."
        
        user_messages = [msg for msg in conversation_history if msg.get('role') == 'user']
        first_user_msg = user_messages[0].get('content', '') if user_messages else ''
        
        # Extract main themes
        main_theme = self._extract_main_theme(first_user_msg)
        
        # Generate persona-specific summary
        summaries = {
            'maya': f"We created a sacred space to explore {main_theme}. Through breathwork and spiritual guidance, you connected with your inner wisdom and found a sense of peace and grounding.",
            
            'sarah': f"We worked together to process your experiences with {main_theme}. Using therapeutic techniques, we explored your feelings and developed healthy coping strategies.",
            
            'alex': f"We had an authentic conversation about {main_theme}. I provided peer support and validation, helping you feel less alone and more understood.",
            
            'marcus': f"We focused on {main_theme} from a goal-oriented perspective. Together, we developed actionable strategies and a clear path forward."
        }
        
        return summaries.get(persona_id, f"We had a meaningful conversation about {main_theme} and explored ways to support your wellbeing.")

    def _extract_main_theme(self, first_message: str) -> str:
        """Extract main theme from first user message"""
        message_lower = first_message.lower()
        
        themes = {
            'work stress and career challenges': ['work', 'job', 'career', 'boss', 'workplace'],
            'anxiety and worry': ['anxious', 'worried', 'nervous', 'panic', 'fear'],
            'relationship concerns': ['relationship', 'partner', 'family', 'friend'],
            'sadness and depression': ['sad', 'depressed', 'down', 'hopeless'],
            'life transitions and changes': ['change', 'transition', 'moving', 'new'],
            'self-esteem and confidence': ['confidence', 'self-worth', 'insecurity'],
            'overwhelm and stress': ['overwhelmed', 'stressed', 'too much'],
            'goals and motivation': ['goal', 'motivation', 'achieve', 'success'],
            'general wellbeing and growth': ['feeling', 'better', 'improve', 'help']
        }
        
        for theme, keywords in themes.items():
            if any(keyword in message_lower for keyword in keywords):
                return theme
        
        return 'personal growth and wellbeing'

    async def _generate_progress_notes(self, user_messages: List[Dict], assistant_messages: List[Dict], persona_id: str) -> str:
        """Generate progress notes for the session"""
        if len(user_messages) < 2:
            return "Initial session focused on building rapport and understanding current concerns."
        
        # Analyze user engagement and openness
        total_user_words = sum(len(msg.get('content', '').split()) for msg in user_messages)
        avg_message_length = total_user_words / len(user_messages) if user_messages else 0
        
        engagement_level = "high" if avg_message_length > 15 else "moderate" if avg_message_length > 8 else "initial"
        
        progress_templates = {
            'maya': f"Client showed {engagement_level} engagement in spiritual exploration. Responded well to mindfulness techniques and breath-focused practices. Demonstrated openness to inner wisdom and self-reflection.",
            
            'sarah': f"Client displayed {engagement_level} therapeutic engagement. Demonstrated insight into emotional patterns and receptiveness to cognitive techniques. Progress made in emotional awareness and coping skill development.",
            
            'alex': f"Client showed {engagement_level} connection and openness in peer support setting. Demonstrated willingness to share and receive validation. Good rapport established with authentic communication.",
            
            'marcus': f"Client exhibited {engagement_level} motivation for goal-oriented work. Showed readiness for action planning and accountability. Good potential for implementing structured approaches."
        }
        
        return progress_templates.get(persona_id, f"Client showed {engagement_level} engagement and willingness to explore personal growth.")

    async def _generate_next_session_suggestions(self, key_topics: List[str], emotional_journey: str, persona_id: str) -> List[str]:
        """Generate suggestions for next session"""
        suggestions = []
        
        # Base suggestions on key topics and persona
        if 'anxiety' in key_topics or 'anxious' in emotional_journey.lower():
            suggestions_map = {
                'maya': 'Continue anxiety-focused breathwork and grounding practices',
                'sarah': 'Explore anxiety triggers and develop coping strategies',
                'alex': 'Share more anxiety management techniques and peer support',
                'marcus': 'Create an anxiety management action plan'
            }
            suggestions.append(suggestions_map.get(persona_id, 'Continue anxiety support'))
        
        if 'work' in key_topics or 'career' in key_topics:
            suggestions_map = {
                'maya': 'Explore work-life balance through spiritual practices',
                'sarah': 'Process work-related stress and boundary setting',
                'alex': 'Discuss work challenges and peer perspectives',
                'marcus': 'Develop career goals and workplace strategies'
            }
            suggestions.append(suggestions_map.get(persona_id, 'Continue work-related support'))
        
        if 'relationships' in key_topics:
            suggestions_map = {
                'maya': 'Deepen connection practices and heart-centered healing',
                'sarah': 'Explore relationship patterns and communication skills',
                'alex': 'Share relationship experiences and peer insights',
                'marcus': 'Develop relationship goals and action steps'
            }
            suggestions.append(suggestions_map.get(persona_id, 'Continue relationship exploration'))
        
        # Add general follow-up suggestion
        general_suggestions = {
            'maya': 'Continue spiritual practices and daily mindfulness',
            'sarah': 'Practice therapeutic techniques discussed today',
            'alex': 'Check in on how you\'re feeling and any updates',
            'marcus': 'Review progress on goals and action items'
        }
        suggestions.append(general_suggestions.get(persona_id, 'Continue personal growth work'))
        
        return suggestions[:3]

    async def _analyze_mood_change(self, user_messages: List[Dict]) -> str:
        """Analyze mood change throughout conversation"""
        if len(user_messages) < 2:
            return "Mood exploration and initial assessment"
        
        first_msg = user_messages[0].get('content', '').lower()
        last_msgs = ' '.join([msg.get('content', '') for msg in user_messages[-2:]]).lower()
        
        # Mood indicators
        negative_words = ['anxious', 'worried', 'sad', 'depressed', 'overwhelmed', 'stressed', 'angry', 'frustrated', 'hopeless']
        positive_words = ['better', 'good', 'clear', 'hopeful', 'relieved', 'calm', 'peaceful', 'grateful', 'confident']
        
        first_negative = any(word in first_msg for word in negative_words)
        last_positive = any(word in last_msgs for word in positive_words)
        
        if first_negative and last_positive:
            return "Mood improved from initial distress to feeling more positive and hopeful"
        elif first_negative:
            return "Processed difficult emotions with support and validation"
        elif last_positive:
            return "Maintained positive mood and gained additional insights"
        else:
            return "Stable mood with increased self-awareness and understanding"

    async def _calculate_session_rating(self, conversation_history: List[Dict], insights: List[str], techniques: List[str]) -> float:
        """Calculate session effectiveness rating"""
        base_rating = 7.0
        
        # Factors that increase rating
        if len(conversation_history) >= 6:  # Good engagement
            base_rating += 0.5
        
        if len(insights) >= 2:  # Meaningful insights
            base_rating += 0.8
        
        if len(techniques) >= 2:  # Multiple techniques used
            base_rating += 0.5
        
        # Quality indicators in conversation
        all_text = ' '.join([msg.get('content', '') for msg in conversation_history]).lower()
        
        positive_indicators = ['understand', 'helpful', 'better', 'clear', 'grateful', 'thank']
        if any(indicator in all_text for indicator in positive_indicators):
            base_rating += 0.4
        
        return min(10.0, base_rating)

    def _estimate_duration(self, message_count: int) -> int:
        """Estimate session duration based on message count"""
        # Estimate 1-2 minutes per message exchange
        return max(5, min(60, message_count * 1.5))

    def _create_minimal_recap(self, session_id: str, persona_id: str) -> SessionRecap:
        """Create minimal recap for very short sessions"""
        return SessionRecap(
            session_id=session_id,
            persona_id=persona_id,
            conversation_summary="Brief initial connection and introduction.",
            key_topics=["initial_contact"],
            emotional_journey="Beginning to establish trust and rapport",
            insights_gained=["Started building therapeutic relationship"],
            therapeutic_techniques_used=["Active listening"],
            progress_notes="Initial session focused on connection and basic assessment.",
            next_session_suggestions=["Continue building rapport", "Explore main concerns"],
            mood_change="Initial contact and assessment",
            session_rating=6.5,
            duration_minutes=5,
            message_count=1
        )