"""
Daily Loop Integration System
Connects daily wellness patterns with persona conversations for personalized support
"""

import asyncio
import aiosqlite
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
from dataclasses import dataclass
from enum import Enum

@dataclass
class DailyInsight:
    user_id: str
    date: date
    mood_trend: str
    energy_pattern: str
    stress_indicators: List[str]
    gratitude_themes: List[str]
    challenge_areas: List[str]
    accomplishment_highlights: List[str]
    recommended_personas: List[str]
    conversation_context: str

class PersonaRecommendation(Enum):
    MAYA = "maya"  # For spiritual support, mindfulness, stress relief
    SARAH = "sarah"  # For clinical support, emotional processing, therapy
    ALEX = "alex"  # For peer support, motivation, social connection
    MARCUS = "marcus"  # For goal setting, productivity, achievement focus

class DailyLoopIntegration:
    """Integrates daily loop insights with persona conversations"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self.connection = None
        
    async def initialize(self):
        """Initialize the integration system"""
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        await self._create_integration_tables()
    
    async def _create_integration_tables(self):
        """Create tables for daily loop integration"""
        
        # Daily persona recommendations
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS daily_persona_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date DATE NOT NULL,
                recommended_persona TEXT NOT NULL,
                recommendation_reason TEXT,
                confidence_score REAL,
                user_context TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, date, recommended_persona)
            )
        ''')
        
        # Conversation context from daily loops
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS daily_conversation_context (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date DATE NOT NULL,
                context_type TEXT NOT NULL,
                context_data TEXT,
                persona_relevance TEXT,
                priority_level INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, date, context_type)
            )
        ''')
        
        # Daily wellness insights for personas
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS daily_wellness_for_personas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date DATE NOT NULL,
                mood_summary TEXT,
                energy_summary TEXT,
                stress_summary TEXT,
                gratitude_highlights TEXT,
                challenge_areas TEXT,
                growth_opportunities TEXT,
                persona_guidance TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, date)
            )
        ''')
        
        await self.connection.commit()
    
    async def analyze_daily_patterns(self, user_id: str, date_param: date = None) -> Optional[DailyInsight]:
        """Analyze daily loop patterns to generate insights"""
        if not date_param:
            date_param = date.today()
        
        # Get daily loop entries
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date = ?
            ORDER BY completed_at ASC
        ''', (user_id, date_param))
        
        entries = await cursor.fetchall()
        
        if not entries:
            return None
        
        # Analyze mood trends
        mood_ratings = [e['mood_rating'] for e in entries if e['mood_rating']]
        energy_levels = [e['energy_level'] for e in entries if e['energy_level']]
        stress_levels = [e['stress_level'] for e in entries if e['stress_level']]
        
        # Determine mood trend
        if len(mood_ratings) > 1:
            if mood_ratings[-1] > mood_ratings[0] + 0.5:
                mood_trend = "improving"
            elif mood_ratings[-1] < mood_ratings[0] - 0.5:
                mood_trend = "declining"
            else:
                mood_trend = "stable"
        else:
            mood_trend = "stable"
        
        # Analyze energy patterns
        avg_energy = sum(energy_levels) / len(energy_levels) if energy_levels else 5.0
        if avg_energy >= 7:
            energy_pattern = "high"
        elif avg_energy >= 5:
            energy_pattern = "moderate"
        else:
            energy_pattern = "low"
        
        # Identify stress indicators
        stress_indicators = []
        avg_stress = sum(stress_levels) / len(stress_levels) if stress_levels else 3.0
        if avg_stress >= 7:
            stress_indicators.append("high_stress")
        if any(e['challenges_faced'] for e in entries):
            stress_indicators.append("challenges_reported")
        
        # Extract gratitude themes
        gratitude_themes = []
        for entry in entries:
            if entry['gratitude_notes']:
                gratitude_themes.append(entry['gratitude_notes'])
        
        # Identify challenge areas
        challenge_areas = []
        for entry in entries:
            if entry['challenges_faced']:
                challenge_areas.append(entry['challenges_faced'])
        
        # Extract accomplishments
        accomplishment_highlights = []
        for entry in entries:
            if entry['accomplishments']:
                accomplishment_highlights.append(entry['accomplishments'])
        
        # Recommend personas based on patterns
        recommended_personas = self._recommend_personas(
            mood_trend, energy_pattern, avg_stress, challenge_areas
        )
        
        # Generate conversation context
        conversation_context = self._generate_conversation_context(
            entries, mood_trend, energy_pattern, stress_indicators
        )
        
        return DailyInsight(
            user_id=user_id,
            date=date_param,
            mood_trend=mood_trend,
            energy_pattern=energy_pattern,
            stress_indicators=stress_indicators,
            gratitude_themes=gratitude_themes,
            challenge_areas=challenge_areas,
            accomplishment_highlights=accomplishment_highlights,
            recommended_personas=recommended_personas,
            conversation_context=conversation_context
        )
    
    def _recommend_personas(
        self, 
        mood_trend: str, 
        energy_pattern: str, 
        stress_level: float, 
        challenge_areas: List[str]
    ) -> List[str]:
        """Recommend personas based on daily patterns"""
        recommendations = []
        
        # High stress or challenges -> Sarah (clinical support)
        if stress_level >= 6 or challenge_areas:
            recommendations.append(PersonaRecommendation.SARAH.value)
        
        # Low energy or declining mood -> Maya (spiritual support)
        if energy_pattern == "low" or mood_trend == "declining":
            recommendations.append(PersonaRecommendation.MAYA.value)
        
        # Goal-oriented or high energy -> Marcus (productivity)
        if energy_pattern == "high" or mood_trend == "improving":
            recommendations.append(PersonaRecommendation.MARCUS.value)
        
        # Social connection or moderate patterns -> Alex (peer support)
        if not recommendations or energy_pattern == "moderate":
            recommendations.append(PersonaRecommendation.ALEX.value)
        
        return recommendations[:2]  # Return top 2 recommendations
    
    def _generate_conversation_context(
        self, 
        entries: List[Any], 
        mood_trend: str, 
        energy_pattern: str, 
        stress_indicators: List[str]
    ) -> str:
        """Generate conversation context for personas"""
        context_parts = []
        
        # Mood context
        if mood_trend == "improving":
            context_parts.append("User's mood has been improving throughout the day")
        elif mood_trend == "declining":
            context_parts.append("User's mood has been declining and may need extra support")
        else:
            context_parts.append("User's mood has been stable today")
        
        # Energy context
        if energy_pattern == "low":
            context_parts.append("User reported low energy levels and may need gentle encouragement")
        elif energy_pattern == "high":
            context_parts.append("User has high energy and may be ready for goal-setting activities")
        
        # Stress context
        if "high_stress" in stress_indicators:
            context_parts.append("User is experiencing high stress and could benefit from calming techniques")
        
        # Recent accomplishments
        recent_accomplishments = []
        for entry in entries:
            if entry['accomplishments']:
                recent_accomplishments.append(entry['accomplishments'])
        
        if recent_accomplishments:
            context_parts.append(f"User accomplished: {'; '.join(recent_accomplishments[:2])}")
        
        # Recent challenges
        recent_challenges = []
        for entry in entries:
            if entry['challenges_faced']:
                recent_challenges.append(entry['challenges_faced'])
        
        if recent_challenges:
            context_parts.append(f"User faced challenges: {'; '.join(recent_challenges[:2])}")
        
        return " | ".join(context_parts)
    
    async def get_persona_context(self, user_id: str, persona_id: str, date_param: date = None) -> Optional[Dict[str, Any]]:
        """Get daily loop context for a specific persona"""
        if not date_param:
            date_param = date.today()
        
        # Get daily insight
        daily_insight = await self.analyze_daily_patterns(user_id, date_param)
        
        if not daily_insight:
            return None
        
        # Get recent entries for detailed context
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date >= ? AND date <= ?
            ORDER BY date DESC, completed_at DESC
            LIMIT 10
        ''', (user_id, date_param - timedelta(days=3), date_param))
        
        recent_entries = await cursor.fetchall()
        
        # Generate persona-specific context
        persona_context = self._generate_persona_specific_context(
            persona_id, daily_insight, recent_entries
        )
        
        return {
            "daily_insight": {
                "mood_trend": daily_insight.mood_trend,
                "energy_pattern": daily_insight.energy_pattern,
                "stress_indicators": daily_insight.stress_indicators,
                "conversation_context": daily_insight.conversation_context
            },
            "persona_context": persona_context,
            "recent_patterns": self._analyze_recent_patterns(recent_entries),
            "recommendations": {
                "is_recommended": persona_id in daily_insight.recommended_personas,
                "confidence": self._calculate_persona_confidence(persona_id, daily_insight)
            }
        }
    
    def _generate_persona_specific_context(
        self, 
        persona_id: str, 
        daily_insight: DailyInsight, 
        recent_entries: List[Any]
    ) -> Dict[str, Any]:
        """Generate persona-specific conversation context"""
        
        base_context = {
            "approach": "standard",
            "focus_areas": [],
            "gentle_topics": [],
            "avoid_topics": [],
            "suggested_techniques": []
        }
        
        if persona_id == "maya":
            # Maya - Spiritual and mindfulness support
            base_context["approach"] = "gentle_spiritual"
            
            if daily_insight.mood_trend == "declining":
                base_context["focus_areas"] = ["breath_work", "grounding", "self_compassion"]
                base_context["suggested_techniques"] = ["pranayama", "body_scan", "loving_kindness"]
            
            if "high_stress" in daily_insight.stress_indicators:
                base_context["focus_areas"].append("stress_relief")
                base_context["suggested_techniques"].extend(["meditation", "chakra_balancing"])
            
            if daily_insight.gratitude_themes:
                base_context["gentle_topics"] = ["gratitude_expansion", "appreciation_practice"]
        
        elif persona_id == "sarah":
            # Sarah - Clinical and therapeutic support
            base_context["approach"] = "clinical_therapeutic"
            
            if daily_insight.challenge_areas:
                base_context["focus_areas"] = ["challenge_processing", "coping_strategies"]
                base_context["suggested_techniques"] = ["cognitive_reframing", "emotional_regulation"]
            
            if daily_insight.mood_trend == "declining":
                base_context["focus_areas"].append("mood_support")
                base_context["suggested_techniques"].extend(["thought_records", "behavioral_activation"])
            
            if "high_stress" in daily_insight.stress_indicators:
                base_context["focus_areas"].append("stress_management")
                base_context["suggested_techniques"].extend(["progressive_relaxation", "problem_solving"])
        
        elif persona_id == "alex":
            # Alex - Peer support and social connection
            base_context["approach"] = "peer_supportive"
            
            if daily_insight.energy_pattern == "low":
                base_context["focus_areas"] = ["motivation", "gentle_encouragement"]
                base_context["suggested_techniques"] = ["peer_validation", "shared_experiences"]
            
            if daily_insight.accomplishment_highlights:
                base_context["gentle_topics"] = ["celebration", "acknowledgment"]
            
            base_context["focus_areas"].append("relatability")
            base_context["suggested_techniques"].extend(["normalization", "humor_when_appropriate"])
        
        elif persona_id == "marcus":
            # Marcus - Goal-oriented and productivity support
            base_context["approach"] = "goal_oriented"
            
            if daily_insight.energy_pattern == "high":
                base_context["focus_areas"] = ["goal_setting", "productivity", "achievement"]
                base_context["suggested_techniques"] = ["action_planning", "milestone_tracking"]
            
            if daily_insight.accomplishment_highlights:
                base_context["gentle_topics"] = ["progress_acknowledgment", "next_steps"]
            
            if daily_insight.challenge_areas:
                base_context["focus_areas"].append("problem_solving")
                base_context["suggested_techniques"].extend(["strategic_planning", "resource_identification"])
        
        return base_context
    
    def _analyze_recent_patterns(self, recent_entries: List[Any]) -> Dict[str, Any]:
        """Analyze patterns from recent entries"""
        if not recent_entries:
            return {}
        
        # Calculate averages over recent days
        mood_average = sum(e['mood_rating'] for e in recent_entries if e['mood_rating']) / len([e for e in recent_entries if e['mood_rating']])
        energy_average = sum(e['energy_level'] for e in recent_entries if e['energy_level']) / len([e for e in recent_entries if e['energy_level']])
        stress_average = sum(e['stress_level'] for e in recent_entries if e['stress_level']) / len([e for e in recent_entries if e['stress_level']])
        
        # Identify trending patterns
        mood_trend = "stable"
        if len(recent_entries) > 1:
            recent_moods = [e['mood_rating'] for e in recent_entries if e['mood_rating']][:5]
            if len(recent_moods) > 2:
                if recent_moods[0] > recent_moods[-1] + 0.5:
                    mood_trend = "improving"
                elif recent_moods[0] < recent_moods[-1] - 0.5:
                    mood_trend = "declining"
        
        return {
            "mood_average": round(mood_average, 1),
            "energy_average": round(energy_average, 1),
            "stress_average": round(stress_average, 1),
            "mood_trend": mood_trend,
            "completion_consistency": len(recent_entries) / 7,  # Assuming 7 days max
            "primary_gratitude_themes": list(set([e['gratitude_notes'] for e in recent_entries if e['gratitude_notes']]))[:3],
            "recurring_challenges": list(set([e['challenges_faced'] for e in recent_entries if e['challenges_faced']]))[:3]
        }
    
    def _calculate_persona_confidence(self, persona_id: str, daily_insight: DailyInsight) -> float:
        """Calculate confidence score for persona recommendation"""
        confidence = 0.5  # Base confidence
        
        # Adjust based on persona fit
        if persona_id in daily_insight.recommended_personas:
            confidence += 0.3
        
        # Adjust based on specific patterns
        if persona_id == "maya" and daily_insight.energy_pattern == "low":
            confidence += 0.2
        elif persona_id == "sarah" and daily_insight.challenge_areas:
            confidence += 0.2
        elif persona_id == "alex" and daily_insight.mood_trend == "stable":
            confidence += 0.1
        elif persona_id == "marcus" and daily_insight.energy_pattern == "high":
            confidence += 0.2
        
        return min(confidence, 1.0)
    
    async def save_persona_context(self, user_id: str, persona_id: str, context_data: Dict[str, Any]):
        """Save persona context for future reference"""
        await self.connection.execute('''
            INSERT OR REPLACE INTO daily_conversation_context
            (user_id, date, context_type, context_data, persona_relevance)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id, 
            date.today(), 
            "persona_context", 
            json.dumps(context_data), 
            persona_id
        ))
        
        await self.connection.commit()
    
    async def get_weekly_persona_insights(self, user_id: str) -> Dict[str, Any]:
        """Get weekly insights for persona recommendations"""
        week_start = date.today() - timedelta(days=7)
        
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date >= ?
            ORDER BY date ASC
        ''', (user_id, week_start))
        
        entries = await cursor.fetchall()
        
        if not entries:
            return {}
        
        # Calculate weekly patterns
        daily_moods = {}
        daily_energy = {}
        daily_stress = {}
        
        for entry in entries:
            entry_date = entry['date']
            if entry_date not in daily_moods:
                daily_moods[entry_date] = []
                daily_energy[entry_date] = []
                daily_stress[entry_date] = []
            
            if entry['mood_rating']:
                daily_moods[entry_date].append(entry['mood_rating'])
            if entry['energy_level']:
                daily_energy[entry_date].append(entry['energy_level'])
            if entry['stress_level']:
                daily_stress[entry_date].append(entry['stress_level'])
        
        # Calculate averages per day
        mood_progression = []
        energy_progression = []
        stress_progression = []
        
        for day in sorted(daily_moods.keys()):
            if daily_moods[day]:
                mood_progression.append(sum(daily_moods[day]) / len(daily_moods[day]))
            if daily_energy[day]:
                energy_progression.append(sum(daily_energy[day]) / len(daily_energy[day]))
            if daily_stress[day]:
                stress_progression.append(sum(daily_stress[day]) / len(daily_stress[day]))
        
        # Generate insights
        insights = {
            "mood_trend": self._calculate_trend(mood_progression),
            "energy_trend": self._calculate_trend(energy_progression),
            "stress_trend": self._calculate_trend(stress_progression),
            "recommended_focus": self._recommend_weekly_focus(mood_progression, energy_progression, stress_progression),
            "persona_priority": self._calculate_persona_priority(mood_progression, energy_progression, stress_progression)
        }
        
        return insights
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend from list of values"""
        if len(values) < 2:
            return "stable"
        
        # Simple linear trend
        if values[-1] > values[0] + 0.5:
            return "improving"
        elif values[-1] < values[0] - 0.5:
            return "declining"
        else:
            return "stable"
    
    def _recommend_weekly_focus(self, mood_vals: List[float], energy_vals: List[float], stress_vals: List[float]) -> List[str]:
        """Recommend weekly focus areas"""
        recommendations = []
        
        if mood_vals and sum(mood_vals) / len(mood_vals) < 5:
            recommendations.append("mood_support")
        
        if energy_vals and sum(energy_vals) / len(energy_vals) < 5:
            recommendations.append("energy_building")
        
        if stress_vals and sum(stress_vals) / len(stress_vals) > 6:
            recommendations.append("stress_reduction")
        
        if not recommendations:
            recommendations.append("maintenance")
        
        return recommendations
    
    def _calculate_persona_priority(self, mood_vals: List[float], energy_vals: List[float], stress_vals: List[float]) -> Dict[str, float]:
        """Calculate persona priority scores"""
        priorities = {
            "maya": 0.25,
            "sarah": 0.25,
            "alex": 0.25,
            "marcus": 0.25
        }
        
        # Adjust based on patterns
        if mood_vals and sum(mood_vals) / len(mood_vals) < 5:
            priorities["sarah"] += 0.2
            priorities["maya"] += 0.15
        
        if energy_vals and sum(energy_vals) / len(energy_vals) < 5:
            priorities["maya"] += 0.2
            priorities["alex"] += 0.15
        
        if stress_vals and sum(stress_vals) / len(stress_vals) > 6:
            priorities["sarah"] += 0.2
            priorities["maya"] += 0.15
        
        if energy_vals and sum(energy_vals) / len(energy_vals) > 7:
            priorities["marcus"] += 0.2
        
        # Normalize to sum to 1
        total = sum(priorities.values())
        for persona in priorities:
            priorities[persona] = priorities[persona] / total
        
        return priorities
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            await self.connection.close()