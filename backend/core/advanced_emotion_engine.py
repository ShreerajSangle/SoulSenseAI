#!/usr/bin/env python3
"""
Advanced Emotion Engine for SoulSense
Enhanced emotion detection with daily pattern integration and therapeutic context
"""

import asyncio
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict
import re

@dataclass
class EmotionalProfile:
    """User's emotional profile based on patterns"""
    dominant_emotions: List[str]
    emotional_volatility: float  # 0.0 to 1.0
    stress_triggers: List[str]
    positive_patterns: List[str]
    support_preferences: List[str]
    resilience_factors: List[str]
    therapeutic_responsiveness: Dict[str, float]

@dataclass
class EmotionalTrend:
    """Emotional trend analysis"""
    trend_direction: str  # improving, declining, stable, volatile
    intensity_change: float
    dominant_shift: str
    trigger_patterns: List[str]
    recovery_indicators: List[str]
    concern_level: str  # low, moderate, high, critical

@dataclass
class TherapeuticOpportunity:
    """Identified therapeutic intervention opportunity"""
    opportunity_type: str
    confidence: float
    recommended_persona: str
    intervention_timing: str
    therapeutic_techniques: List[str]
    expected_outcome: str
    context_factors: List[str]

class AdvancedEmotionEngine:
    """Enhanced emotion analysis with therapeutic intelligence"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self.connection = None
        
        # Emotional taxonomy with therapeutic relevance
        self.emotion_categories = {
            "anxiety_cluster": ["anxious", "worried", "fearful", "nervous", "overwhelmed"],
            "depression_cluster": ["sad", "hopeless", "empty", "numb", "worthless"],
            "anger_cluster": ["angry", "frustrated", "irritated", "resentful", "rage"],
            "joy_cluster": ["happy", "excited", "elated", "content", "grateful"],
            "fear_cluster": ["scared", "terrified", "panic", "dread", "apprehensive"],
            "shame_cluster": ["ashamed", "guilty", "embarrassed", "humiliated", "inadequate"],
            "love_cluster": ["loving", "compassionate", "connected", "warm", "caring"]
        }
        
        # Stress indicators and triggers
        self.stress_indicators = {
            "physical": ["tension", "headache", "fatigue", "insomnia", "appetite"],
            "cognitive": ["racing thoughts", "confusion", "memory", "concentration", "worry"],
            "emotional": ["irritability", "anxiety", "mood swings", "overwhelm", "numbness"],
            "behavioral": ["isolation", "procrastination", "substance use", "aggression", "withdrawal"]
        }
        
        # Therapeutic technique mapping
        self.therapeutic_techniques = {
            "anxiety_cluster": ["breathing_exercises", "grounding_techniques", "cognitive_reframing", "exposure_therapy"],
            "depression_cluster": ["behavioral_activation", "thought_records", "self_compassion", "meaning_making"],
            "anger_cluster": ["anger_management", "assertiveness_training", "stress_reduction", "communication_skills"],
            "joy_cluster": ["gratitude_practices", "savoring_exercises", "positive_psychology", "celebration_rituals"],
            "fear_cluster": ["gradual_exposure", "safety_planning", "courage_building", "support_mobilization"],
            "shame_cluster": ["self_compassion", "shame_resilience", "vulnerability_practice", "self_worth_building"],
            "love_cluster": ["connection_practices", "empathy_building", "relationship_skills", "loving_kindness"]
        }
        
        # Persona specializations
        self.persona_expertise = {
            "sarah": ["anxiety_cluster", "depression_cluster", "shame_cluster"],
            "maya": ["stress_management", "fear_cluster", "love_cluster"],
            "alex": ["social_anxiety", "shame_cluster", "joy_cluster"],
            "marcus": ["goal_anxiety", "anger_cluster", "achievement_stress"]
        }
    
    async def initialize(self):
        """Initialize the advanced emotion engine"""
        self.connection = sqlite3.connect(self.db_path)
        self.connection.row_factory = sqlite3.Row
        await self.create_tables()
    
    async def create_tables(self):
        """Create tables for advanced emotion tracking"""
        cursor = self.connection.cursor()
        
        # Enable WAL mode to prevent database locks
        cursor.execute("PRAGMA journal_mode=WAL")
        
        # Emotional profiles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS emotional_profiles (
                user_id TEXT PRIMARY KEY,
                dominant_emotions TEXT,
                emotional_volatility REAL,
                stress_triggers TEXT,
                positive_patterns TEXT,
                support_preferences TEXT,
                resilience_factors TEXT,
                therapeutic_responsiveness TEXT,
                last_updated TEXT,
                profile_confidence REAL
            )
        ''')
        
        # Emotional trends table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS emotional_trends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                date TEXT,
                trend_direction TEXT,
                intensity_change REAL,
                dominant_shift TEXT,
                trigger_patterns TEXT,
                recovery_indicators TEXT,
                concern_level TEXT,
                created_at TEXT
            )
        ''')
        
        # Therapeutic opportunities table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS therapeutic_opportunities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                opportunity_type TEXT,
                confidence REAL,
                recommended_persona TEXT,
                intervention_timing TEXT,
                therapeutic_techniques TEXT,
                expected_outcome TEXT,
                context_factors TEXT,
                status TEXT,
                created_at TEXT,
                expires_at TEXT
            )
        ''')
        
        # Advanced emotion sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS advanced_emotion_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                session_date TEXT,
                primary_emotions TEXT,
                emotional_intensity REAL,
                stress_level REAL,
                resilience_score REAL,
                therapeutic_gains TEXT,
                intervention_effectiveness TEXT,
                persona_match_score REAL,
                next_session_recommendations TEXT,
                created_at TEXT
            )
        ''')
        
        self.connection.commit()
    
    async def analyze_emotional_patterns(self, user_id: str, days_back: int = 30) -> EmotionalProfile:
        """Analyze user's emotional patterns over time"""
        cursor = self.connection.cursor()
        
        # Get recent emotional data from daily loop and conversations
        start_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        # Query daily loop data
        cursor.execute('''
            SELECT mood_rating, energy_level, stress_level, reflection_notes, 
                   challenges_faced, accomplishments, selected_persona, date
            FROM daily_loop_entries 
            WHERE user_id = ? AND date >= ?
            ORDER BY date DESC
        ''', (user_id, start_date))
        
        daily_entries = cursor.fetchall()
        
        # Query conversation emotions (if table exists)
        try:
            cursor.execute('''
                SELECT emotional_context, persona_id
                FROM conversation_logs 
                WHERE user_id = ? 
                ORDER BY rowid DESC
                LIMIT 50
            ''', (user_id,))
        except sqlite3.OperationalError:
            # Table doesn't exist, use empty data
            cursor.execute("SELECT NULL as emotional_context, NULL as persona_id WHERE 0")
        
        conversation_data = cursor.fetchall()
        
        # Analyze patterns
        dominant_emotions = self._identify_dominant_emotions(daily_entries, conversation_data)
        emotional_volatility = self._calculate_emotional_volatility(daily_entries)
        stress_triggers = self._identify_stress_triggers(daily_entries)
        positive_patterns = self._identify_positive_patterns(daily_entries)
        support_preferences = self._analyze_support_preferences(daily_entries, conversation_data)
        resilience_factors = self._identify_resilience_factors(daily_entries)
        therapeutic_responsiveness = self._analyze_therapeutic_responsiveness(conversation_data)
        
        profile = EmotionalProfile(
            dominant_emotions=dominant_emotions,
            emotional_volatility=emotional_volatility,
            stress_triggers=stress_triggers,
            positive_patterns=positive_patterns,
            support_preferences=support_preferences,
            resilience_factors=resilience_factors,
            therapeutic_responsiveness=therapeutic_responsiveness
        )
        
        # Save profile
        await self._save_emotional_profile(user_id, profile)
        
        return profile
    
    def _identify_dominant_emotions(self, daily_entries: List, conversation_data: List) -> List[str]:
        """Identify user's most frequent emotional states"""
        emotion_counts = defaultdict(int)
        
        # Analyze daily entries
        for entry in daily_entries:
            if entry['reflection_notes']:
                emotions = self._extract_emotions_from_text(entry['reflection_notes'])
                for emotion in emotions:
                    emotion_counts[emotion] += 1
            
            # Mood rating analysis
            mood = entry['mood_rating']
            if mood <= 3:
                emotion_counts['low_mood'] += 1
            elif mood >= 7:
                emotion_counts['positive_mood'] += 1
            
            # Stress level analysis
            stress = entry['stress_level']
            if stress >= 7:
                emotion_counts['high_stress'] += 1
        
        # Analyze conversation data
        for conv in conversation_data:
            if conv['emotional_context']:
                try:
                    context = json.loads(conv['emotional_context'])
                    if 'primary_emotion' in context:
                        emotion_counts[context['primary_emotion']] += 1
                except (json.JSONDecodeError, KeyError):
                    continue
        
        # Return top 5 emotions
        return [emotion for emotion, _ in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    def _calculate_emotional_volatility(self, daily_entries: List) -> float:
        """Calculate emotional volatility (mood swings)"""
        if len(daily_entries) < 2:
            return 0.0
        
        mood_changes = []
        for i in range(1, len(daily_entries)):
            current_mood = daily_entries[i]['mood_rating']
            previous_mood = daily_entries[i-1]['mood_rating']
            change = abs(current_mood - previous_mood)
            mood_changes.append(change)
        
        # Calculate average change magnitude
        avg_change = sum(mood_changes) / len(mood_changes)
        
        # Normalize to 0-1 scale (max change is 10 points)
        return min(avg_change / 10.0, 1.0)
    
    def _identify_stress_triggers(self, daily_entries: List) -> List[str]:
        """Identify patterns that trigger stress"""
        triggers = defaultdict(int)
        
        for entry in daily_entries:
            if entry['stress_level'] >= 7:  # High stress
                if entry['challenges_faced']:
                    # Extract key themes from challenges
                    challenges = entry['challenges_faced'].lower()
                    
                    # Common stress triggers
                    if 'work' in challenges or 'job' in challenges:
                        triggers['work_stress'] += 1
                    if 'relationship' in challenges or 'family' in challenges:
                        triggers['relationship_stress'] += 1
                    if 'money' in challenges or 'financial' in challenges:
                        triggers['financial_stress'] += 1
                    if 'health' in challenges or 'sick' in challenges:
                        triggers['health_stress'] += 1
                    if 'presentation' in challenges or 'public' in challenges:
                        triggers['performance_anxiety'] += 1
                    if 'time' in challenges or 'deadline' in challenges:
                        triggers['time_pressure'] += 1
        
        return [trigger for trigger, count in triggers.items() if count >= 2]
    
    def _identify_positive_patterns(self, daily_entries: List) -> List[str]:
        """Identify what helps the user feel better"""
        positive_patterns = defaultdict(int)
        
        for entry in daily_entries:
            if entry['mood_rating'] >= 7:  # Good mood
                if entry['accomplishments']:
                    accomplishments = entry['accomplishments'].lower()
                    
                    # Common positive activities
                    if 'exercise' in accomplishments or 'workout' in accomplishments:
                        positive_patterns['physical_activity'] += 1
                    if 'meditation' in accomplishments or 'mindfulness' in accomplishments:
                        positive_patterns['mindfulness_practice'] += 1
                    if 'friend' in accomplishments or 'social' in accomplishments:
                        positive_patterns['social_connection'] += 1
                    if 'creative' in accomplishments or 'art' in accomplishments:
                        positive_patterns['creative_expression'] += 1
                    if 'nature' in accomplishments or 'outside' in accomplishments:
                        positive_patterns['nature_connection'] += 1
                    if 'goal' in accomplishments or 'completed' in accomplishments:
                        positive_patterns['achievement'] += 1
        
        return [pattern for pattern, count in positive_patterns.items() if count >= 2]
    
    def _analyze_support_preferences(self, daily_entries: List, conversation_data: List) -> List[str]:
        """Analyze what types of support the user responds to best"""
        preferences = defaultdict(int)
        
        # Analyze persona preferences from daily entries
        persona_usage = defaultdict(int)
        for entry in daily_entries:
            if entry['selected_persona']:
                persona_usage[entry['selected_persona']] += 1
        
        # Most used persona indicates preference
        if persona_usage:
            top_persona = max(persona_usage, key=persona_usage.get)
            if top_persona == 'sarah':
                preferences['clinical_support'] += 3
            elif top_persona == 'maya':
                preferences['spiritual_guidance'] += 3
            elif top_persona == 'alex':
                preferences['peer_support'] += 3
            elif top_persona == 'marcus':
                preferences['goal_coaching'] += 3
        
        # Analyze conversation patterns
        for conv in conversation_data:
            try:
                context = json.loads(conv['emotional_context'])
                if 'support_needs' in context:
                    for need in context['support_needs']:
                        preferences[need] += 1
            except (json.JSONDecodeError, KeyError):
                continue
        
        return [pref for pref, count in preferences.items() if count >= 2]
    
    def _identify_resilience_factors(self, daily_entries: List) -> List[str]:
        """Identify what helps the user bounce back from difficulties"""
        resilience_factors = []
        
        # Look for recovery patterns
        recovery_entries = []
        for i in range(1, len(daily_entries)):
            current_mood = daily_entries[i]['mood_rating']
            previous_mood = daily_entries[i-1]['mood_rating']
            
            # Found improvement after low mood
            if previous_mood <= 4 and current_mood >= 6:
                recovery_entries.append(daily_entries[i])
        
        # Analyze what helped in recovery
        recovery_themes = defaultdict(int)
        for entry in recovery_entries:
            if entry['accomplishments']:
                accomplishments = entry['accomplishments'].lower()
                
                if 'support' in accomplishments or 'help' in accomplishments:
                    recovery_themes['seeking_support'] += 1
                if 'rest' in accomplishments or 'sleep' in accomplishments:
                    recovery_themes['self_care'] += 1
                if 'perspective' in accomplishments or 'reframe' in accomplishments:
                    recovery_themes['cognitive_reframing'] += 1
                if 'small' in accomplishments or 'step' in accomplishments:
                    recovery_themes['incremental_progress'] += 1
        
        return [theme for theme, count in recovery_themes.items() if count >= 1]
    
    def _analyze_therapeutic_responsiveness(self, conversation_data: List) -> Dict[str, float]:
        """Analyze how well user responds to different therapeutic approaches"""
        responsiveness = defaultdict(list)
        
        for conv in conversation_data:
            persona_id = conv['persona_id']
            # This would be enhanced with actual response quality metrics
            # For now, we'll use a placeholder based on persona usage patterns
            responsiveness[persona_id].append(0.7)  # Placeholder score
        
        # Calculate average responsiveness per persona
        avg_responsiveness = {}
        for persona, scores in responsiveness.items():
            avg_responsiveness[persona] = sum(scores) / len(scores) if scores else 0.5
        
        return avg_responsiveness
    
    def _extract_emotions_from_text(self, text: str) -> List[str]:
        """Extract emotions from text using keyword matching"""
        emotions = []
        text_lower = text.lower()
        
        for category, emotion_words in self.emotion_categories.items():
            for emotion in emotion_words:
                if emotion in text_lower:
                    emotions.append(emotion)
        
        return emotions
    
    async def _save_emotional_profile(self, user_id: str, profile: EmotionalProfile):
        """Save emotional profile to database"""
        cursor = self.connection.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO emotional_profiles (
                user_id, dominant_emotions, emotional_volatility, stress_triggers,
                positive_patterns, support_preferences, resilience_factors,
                therapeutic_responsiveness, last_updated, profile_confidence
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            json.dumps(profile.dominant_emotions),
            profile.emotional_volatility,
            json.dumps(profile.stress_triggers),
            json.dumps(profile.positive_patterns),
            json.dumps(profile.support_preferences),
            json.dumps(profile.resilience_factors),
            json.dumps(profile.therapeutic_responsiveness),
            datetime.now().isoformat(),
            0.8  # Default confidence
        ))
        
        self.connection.commit()
    
    async def identify_therapeutic_opportunities(self, user_id: str) -> List[TherapeuticOpportunity]:
        """Identify current therapeutic intervention opportunities"""
        profile = await self.get_emotional_profile(user_id)
        if not profile:
            return []
        
        opportunities = []
        
        # Check for high stress patterns
        if 'high_stress' in profile.dominant_emotions:
            opportunities.append(TherapeuticOpportunity(
                opportunity_type="stress_management",
                confidence=0.8,
                recommended_persona="sarah" if "clinical_support" in profile.support_preferences else "maya",
                intervention_timing="immediate",
                therapeutic_techniques=["breathing_exercises", "stress_reduction", "grounding_techniques"],
                expected_outcome="reduced_stress_levels",
                context_factors=profile.stress_triggers
            ))
        
        # Check for mood volatility
        if profile.emotional_volatility > 0.6:
            opportunities.append(TherapeuticOpportunity(
                opportunity_type="mood_stabilization",
                confidence=0.7,
                recommended_persona="sarah",
                intervention_timing="within_24_hours",
                therapeutic_techniques=["mood_tracking", "emotional_regulation", "routine_building"],
                expected_outcome="improved_emotional_stability",
                context_factors=["high_volatility"]
            ))
        
        # Check for positive momentum
        if 'positive_mood' in profile.dominant_emotions:
            opportunities.append(TherapeuticOpportunity(
                opportunity_type="momentum_building",
                confidence=0.9,
                recommended_persona="marcus",
                intervention_timing="current_session",
                therapeutic_techniques=["goal_setting", "achievement_planning", "success_building"],
                expected_outcome="sustained_positive_trajectory",
                context_factors=profile.positive_patterns
            ))
        
        # Save opportunities
        for opportunity in opportunities:
            await self._save_therapeutic_opportunity(user_id, opportunity)
        
        return opportunities
    
    async def _save_therapeutic_opportunity(self, user_id: str, opportunity: TherapeuticOpportunity):
        """Save therapeutic opportunity to database"""
        cursor = self.connection.cursor()
        
        expires_at = datetime.now() + timedelta(hours=24)  # Opportunities expire after 24 hours
        
        cursor.execute('''
            INSERT INTO therapeutic_opportunities (
                user_id, opportunity_type, confidence, recommended_persona,
                intervention_timing, therapeutic_techniques, expected_outcome,
                context_factors, status, created_at, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            opportunity.opportunity_type,
            opportunity.confidence,
            opportunity.recommended_persona,
            opportunity.intervention_timing,
            json.dumps(opportunity.therapeutic_techniques),
            opportunity.expected_outcome,
            json.dumps(opportunity.context_factors),
            "active",
            datetime.now().isoformat(),
            expires_at.isoformat()
        ))
        
        self.connection.commit()
    
    async def get_emotional_profile(self, user_id: str) -> Optional[EmotionalProfile]:
        """Get user's emotional profile"""
        cursor = self.connection.cursor()
        
        cursor.execute('''
            SELECT * FROM emotional_profiles WHERE user_id = ?
        ''', (user_id,))
        
        row = cursor.fetchone()
        if not row:
            # Generate new profile if none exists
            return await self.analyze_emotional_patterns(user_id)
        
        return EmotionalProfile(
            dominant_emotions=json.loads(row['dominant_emotions']),
            emotional_volatility=row['emotional_volatility'],
            stress_triggers=json.loads(row['stress_triggers']),
            positive_patterns=json.loads(row['positive_patterns']),
            support_preferences=json.loads(row['support_preferences']),
            resilience_factors=json.loads(row['resilience_factors']),
            therapeutic_responsiveness=json.loads(row['therapeutic_responsiveness'])
        )
    
    async def get_active_opportunities(self, user_id: str) -> List[TherapeuticOpportunity]:
        """Get active therapeutic opportunities for user"""
        cursor = self.connection.cursor()
        
        cursor.execute('''
            SELECT * FROM therapeutic_opportunities 
            WHERE user_id = ? AND status = 'active' AND expires_at > ?
            ORDER BY confidence DESC
        ''', (user_id, datetime.now().isoformat()))
        
        rows = cursor.fetchall()
        opportunities = []
        
        for row in rows:
            opportunities.append(TherapeuticOpportunity(
                opportunity_type=row['opportunity_type'],
                confidence=row['confidence'],
                recommended_persona=row['recommended_persona'],
                intervention_timing=row['intervention_timing'],
                therapeutic_techniques=json.loads(row['therapeutic_techniques']),
                expected_outcome=row['expected_outcome'],
                context_factors=json.loads(row['context_factors'])
            ))
        
        return opportunities
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()