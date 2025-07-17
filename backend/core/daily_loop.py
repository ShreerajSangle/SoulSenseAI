"""
Daily SoulSense Loop System
Provides personalized morning check-ins and evening reflections
Creates a complete daily wellness routine integrated with personas and pathways
"""

import asyncio
import aiosqlite
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, date, time, timedelta
from dataclasses import dataclass
from enum import Enum
import random

class LoopType(Enum):
    MORNING_CHECKIN = "morning_checkin"
    EVENING_REFLECTION = "evening_reflection"
    MIDDAY_PULSE = "midday_pulse"
    WEEKLY_REVIEW = "weekly_review"

class MoodTrend(Enum):
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"
    MIXED = "mixed"

@dataclass
class DailyLoopActivity:
    id: str
    type: LoopType
    title: str
    description: str
    questions: List[str]
    affirmation: str
    suggested_actions: List[str]
    estimated_minutes: int
    persona_recommendations: List[str]
    follow_up_reminders: List[str]

@dataclass
class UserLoopEntry:
    user_id: str
    date: date
    loop_type: LoopType
    mood_rating: float
    energy_level: float
    stress_level: float
    gratitude_notes: str
    challenges_faced: str
    accomplishments: str
    goals_for_day: str
    reflection_notes: str
    selected_persona: str
    completed_at: datetime

class DailySoulSenseLoop:
    """Manages daily wellness check-ins and reflections"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self.connection = None
        self.morning_activities = {}
        self.evening_activities = {}
        self.midday_activities = {}
        self._initialize_loop_library()
    
    def _initialize_loop_library(self):
        """Initialize comprehensive daily loop activity library"""
        
        # MORNING CHECK-IN ACTIVITIES
        self.morning_activities = {
            "gentle_awakening": DailyLoopActivity(
                id="gentle_awakening",
                type=LoopType.MORNING_CHECKIN,
                title="Gentle Awakening",
                description="Start your day with mindful awareness and intention setting",
                questions=[
                    "How are you feeling as you wake up today?",
                    "What is one thing you're grateful for this morning?",
                    "What would make today feel meaningful for you?",
                    "How is your energy level right now?",
                    "What support do you need to have a good day?"
                ],
                affirmation="I am exactly where I need to be, and today holds beautiful possibilities.",
                suggested_actions=[
                    "Take 5 deep breaths",
                    "Set a gentle intention for the day",
                    "Practice gratitude meditation",
                    "Connect with your chosen persona"
                ],
                estimated_minutes=7,
                persona_recommendations=["maya", "sarah"],
                follow_up_reminders=[
                    "Check in with yourself at lunch",
                    "Remember your morning intention",
                    "Notice moments of gratitude"
                ]
            ),
            
            "energy_assessment": DailyLoopActivity(
                id="energy_assessment",
                type=LoopType.MORNING_CHECKIN,
                title="Energy & Mood Assessment",
                description="Tune into your mental and physical state to guide your day",
                questions=[
                    "On a scale of 1-10, how is your energy this morning?",
                    "What emotions are present for you right now?",
                    "How did you sleep last night?",
                    "What does your body need today?",
                    "What kind of support would be most helpful?"
                ],
                affirmation="I honor my current state and choose to move through today with self-compassion.",
                suggested_actions=[
                    "Body scan meditation",
                    "Gentle movement or stretching",
                    "Hydrate mindfully",
                    "Plan recovery time if needed"
                ],
                estimated_minutes=8,
                persona_recommendations=["sarah", "maya"],
                follow_up_reminders=[
                    "Notice energy changes throughout the day",
                    "Take breaks when needed",
                    "Practice self-compassion"
                ]
            ),
            
            "intention_setting": DailyLoopActivity(
                id="intention_setting",
                type=LoopType.MORNING_CHECKIN,
                title="Daily Intention Setting",
                description="Create a purposeful direction for your day ahead",
                questions=[
                    "What matters most to you today?",
                    "How do you want to show up in the world?",
                    "What would make you proud of today?",
                    "What challenge might you face and how can you prepare?",
                    "What joy can you create or notice today?"
                ],
                affirmation="I set clear intentions and trust in my ability to navigate this day with grace.",
                suggested_actions=[
                    "Write down your main intention",
                    "Visualize your ideal day",
                    "Choose a word/theme for the day",
                    "Share your intention with someone"
                ],
                estimated_minutes=10,
                persona_recommendations=["marcus", "alex"],
                follow_up_reminders=[
                    "Remember your daily intention",
                    "Check alignment with your values",
                    "Celebrate small wins"
                ]
            )
        }
        
        # EVENING REFLECTION ACTIVITIES
        self.evening_activities = {
            "day_appreciation": DailyLoopActivity(
                id="day_appreciation",
                type=LoopType.EVENING_REFLECTION,
                title="Day Appreciation",
                description="Honor your journey through today with gratitude and acknowledgment",
                questions=[
                    "What went well today that you can appreciate?",
                    "What did you learn about yourself?",
                    "What are you most grateful for from today?",
                    "How did you show up for yourself or others?",
                    "What small victory can you celebrate?"
                ],
                affirmation="I appreciate the fullness of this day and all that I experienced and learned.",
                suggested_actions=[
                    "Write three things you're grateful for",
                    "Acknowledge one thing you did well",
                    "Forgive yourself for any mistakes",
                    "Set tomorrow's gentle intention"
                ],
                estimated_minutes=8,
                persona_recommendations=["maya", "sarah"],
                follow_up_reminders=[
                    "Carry gratitude into tomorrow",
                    "Remember your resilience",
                    "Practice self-compassion"
                ]
            ),
            
            "emotional_processing": DailyLoopActivity(
                id="emotional_processing",
                type=LoopType.EVENING_REFLECTION,
                title="Emotional Processing",
                description="Process the emotions and experiences of your day",
                questions=[
                    "What emotions did you experience most today?",
                    "What triggered strong feelings for you?",
                    "How did you handle challenging moments?",
                    "What support did you give or receive?",
                    "What would you do differently if you could?"
                ],
                affirmation="I honor all of my emotions and trust in my ability to process and grow from them.",
                suggested_actions=[
                    "Journal about your emotions",
                    "Practice loving-kindness meditation",
                    "Release tension through breathing",
                    "Connect with a supportive person"
                ],
                estimated_minutes=12,
                persona_recommendations=["sarah", "alex"],
                follow_up_reminders=[
                    "Emotions are temporary and valid",
                    "You handled today with courage",
                    "Tomorrow is a fresh start"
                ]
            ),
            
            "growth_reflection": DailyLoopActivity(
                id="growth_reflection",
                type=LoopType.EVENING_REFLECTION,
                title="Growth & Learning",
                description="Reflect on personal growth and insights from the day",
                questions=[
                    "What did you discover about yourself today?",
                    "What challenge helped you grow?",
                    "What pattern did you notice in your thoughts or behavior?",
                    "What would you tell your morning self?",
                    "How can you apply today's lessons tomorrow?"
                ],
                affirmation="Every day offers opportunities for growth, and I am continuously evolving.",
                suggested_actions=[
                    "Write a letter to your future self",
                    "Identify one lesson learned",
                    "Practice self-forgiveness",
                    "Plan one small change for tomorrow"
                ],
                estimated_minutes=10,
                persona_recommendations=["marcus", "sarah"],
                follow_up_reminders=[
                    "Growth happens gradually",
                    "Celebrate your progress",
                    "Be patient with yourself"
                ]
            )
        }
        
        # MIDDAY PULSE CHECK ACTIVITIES
        self.midday_activities = {
            "energy_reset": DailyLoopActivity(
                id="energy_reset",
                type=LoopType.MIDDAY_PULSE,
                title="Midday Energy Reset",
                description="Quick check-in to recalibrate and refresh",
                questions=[
                    "How is your energy right now?",
                    "What do you need to feel more balanced?",
                    "Are you staying true to your morning intention?",
                    "What can you appreciate about your morning?"
                ],
                affirmation="I pause to reconnect with myself and reset my energy for the rest of the day.",
                suggested_actions=[
                    "Take 10 deep breaths",
                    "Stretch or move your body",
                    "Drink water mindfully",
                    "Step outside if possible"
                ],
                estimated_minutes=5,
                persona_recommendations=["maya", "alex"],
                follow_up_reminders=[
                    "Regular check-ins support well-being",
                    "Small resets make a big difference",
                    "Trust your inner wisdom"
                ]
            )
        }
    
    async def initialize(self):
        """Initialize the daily loop system"""
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        await self._create_loop_tables()
    
    async def _create_loop_tables(self):
        """Create database tables for daily loop tracking"""
        
        # Daily loop entries
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS daily_loop_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date DATE NOT NULL,
                loop_type TEXT NOT NULL,
                mood_rating REAL,
                energy_level REAL,
                stress_level REAL,
                gratitude_notes TEXT,
                challenges_faced TEXT,
                accomplishments TEXT,
                goals_for_day TEXT,
                reflection_notes TEXT,
                selected_persona TEXT,
                completed_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, date, loop_type)
            )
        ''')
        
        # Daily loop streaks
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS daily_loop_streaks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_completion_date DATE,
                streak_type TEXT DEFAULT 'daily',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, streak_type)
            )
        ''')
        
        # Daily wellness insights
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS daily_wellness_insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date DATE NOT NULL,
                mood_trend TEXT,
                energy_trend TEXT,
                stress_pattern TEXT,
                gratitude_themes TEXT,
                challenge_categories TEXT,
                growth_areas TEXT,
                recommended_actions TEXT,
                persona_interactions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, date)
            )
        ''')
        
        await self.connection.commit()
    
    async def get_morning_activity(self, user_id: str, date_param: date = None) -> Optional[Dict[str, Any]]:
        """Get personalized morning check-in activity"""
        if not date_param:
            date_param = date.today()
        
        # Check if user already completed morning check-in
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date = ? AND loop_type = 'morning_checkin'
        ''', (user_id, date_param))
        
        existing_entry = await cursor.fetchone()
        if existing_entry:
            return {"already_completed": True, "entry": dict(existing_entry)}
        
        # Get user's recent mood trends to personalize activity
        mood_trend = await self._get_mood_trend(user_id)
        
        # Select appropriate morning activity
        if mood_trend == MoodTrend.DECLINING:
            activity = self.morning_activities["gentle_awakening"]
        elif mood_trend == MoodTrend.MIXED:
            activity = self.morning_activities["energy_assessment"]
        else:
            activity = self.morning_activities["intention_setting"]
        
        return {
            "activity": {
                "id": activity.id,
                "title": activity.title,
                "description": activity.description,
                "questions": activity.questions,
                "affirmation": activity.affirmation,
                "suggested_actions": activity.suggested_actions,
                "estimated_minutes": activity.estimated_minutes,
                "persona_recommendations": activity.persona_recommendations,
                "follow_up_reminders": activity.follow_up_reminders
            },
            "user_context": {
                "mood_trend": mood_trend.value,
                "date": date_param.isoformat(),
                "is_new_user": await self._is_new_user(user_id)
            }
        }
    
    async def get_evening_activity(self, user_id: str, date_param: date = None) -> Optional[Dict[str, Any]]:
        """Get personalized evening reflection activity"""
        if not date_param:
            date_param = date.today()
        
        # Check if user already completed evening reflection
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date = ? AND loop_type = 'evening_reflection'
        ''', (user_id, date_param))
        
        existing_entry = await cursor.fetchone()
        if existing_entry:
            return {"already_completed": True, "entry": dict(existing_entry)}
        
        # Get user's day activity to personalize reflection
        day_activity = await self._get_day_activity_summary(user_id, date_param)
        
        # Select appropriate evening activity
        if day_activity.get("high_stress", False):
            activity = self.evening_activities["emotional_processing"]
        elif day_activity.get("learning_focus", False):
            activity = self.evening_activities["growth_reflection"]
        else:
            activity = self.evening_activities["day_appreciation"]
        
        return {
            "activity": {
                "id": activity.id,
                "title": activity.title,
                "description": activity.description,
                "questions": activity.questions,
                "affirmation": activity.affirmation,
                "suggested_actions": activity.suggested_actions,
                "estimated_minutes": activity.estimated_minutes,
                "persona_recommendations": activity.persona_recommendations,
                "follow_up_reminders": activity.follow_up_reminders
            },
            "user_context": {
                "day_summary": day_activity,
                "date": date_param.isoformat(),
                "morning_completed": await self._check_morning_completion(user_id, date_param)
            }
        }
    
    async def get_midday_pulse(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get midday pulse check activity"""
        today = date.today()
        
        # Check if user already completed midday pulse
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date = ? AND loop_type = 'midday_pulse'
        ''', (user_id, today))
        
        existing_entry = await cursor.fetchone()
        if existing_entry:
            return {"already_completed": True, "entry": dict(existing_entry)}
        
        activity = self.midday_activities["energy_reset"]
        
        return {
            "activity": {
                "id": activity.id,
                "title": activity.title,
                "description": activity.description,
                "questions": activity.questions,
                "affirmation": activity.affirmation,
                "suggested_actions": activity.suggested_actions,
                "estimated_minutes": activity.estimated_minutes,
                "persona_recommendations": activity.persona_recommendations,
                "follow_up_reminders": activity.follow_up_reminders
            },
            "user_context": {
                "date": today.isoformat(),
                "morning_completed": await self._check_morning_completion(user_id, today)
            }
        }
    
    async def complete_loop_activity(
        self,
        user_id: str,
        loop_type: str,
        mood_rating: float,
        energy_level: float,
        stress_level: float,
        gratitude_notes: str = "",
        challenges_faced: str = "",
        accomplishments: str = "",
        goals_for_day: str = "",
        reflection_notes: str = "",
        selected_persona: str = "",
        date_param: date = None
    ) -> bool:
        """Complete a daily loop activity"""
        
        if not date_param:
            date_param = date.today()
        
        try:
            await self.connection.execute('''
                INSERT OR REPLACE INTO daily_loop_entries 
                (user_id, date, loop_type, mood_rating, energy_level, stress_level,
                 gratitude_notes, challenges_faced, accomplishments, goals_for_day,
                 reflection_notes, selected_persona, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, date_param, loop_type, mood_rating, energy_level, stress_level,
                gratitude_notes, challenges_faced, accomplishments, goals_for_day,
                reflection_notes, selected_persona, datetime.now()
            ))
            
            # Update streak
            await self._update_daily_streak(user_id, date_param)
            
            # Generate insights if both morning and evening are completed
            if loop_type == "evening_reflection":
                await self._generate_daily_insights(user_id, date_param)
            
            await self.connection.commit()
            return True
            
        except Exception as e:
            print(f"Error completing loop activity: {e}")
            return False
    
    async def get_user_daily_summary(self, user_id: str, date_param: date = None) -> Dict[str, Any]:
        """Get comprehensive daily summary for user"""
        if not date_param:
            date_param = date.today()
        
        # Get all loop entries for the date
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date = ?
            ORDER BY completed_at ASC
        ''', (user_id, date_param))
        
        entries = await cursor.fetchall()
        
        # Get streak info
        streak_cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_streaks 
            WHERE user_id = ? AND streak_type = 'daily'
        ''', (user_id,))
        
        streak_info = await streak_cursor.fetchone()
        
        # Get insights
        insights_cursor = await self.connection.execute('''
            SELECT * FROM daily_wellness_insights 
            WHERE user_id = ? AND date = ?
        ''', (user_id, date_param))
        
        insights = await insights_cursor.fetchone()
        
        return {
            "date": date_param.isoformat(),
            "entries": [dict(entry) for entry in entries],
            "completion_status": {
                "morning_completed": any(e['loop_type'] == 'morning_checkin' for e in entries),
                "evening_completed": any(e['loop_type'] == 'evening_reflection' for e in entries),
                "midday_completed": any(e['loop_type'] == 'midday_pulse' for e in entries)
            },
            "streak": {
                "current": streak_info['current_streak'] if streak_info else 0,
                "longest": streak_info['longest_streak'] if streak_info else 0,
                "last_completion": streak_info['last_completion_date'] if streak_info else None
            },
            "insights": dict(insights) if insights else None,
            "next_suggested_activity": await self._get_next_suggested_activity(user_id, entries)
        }
    
    async def get_weekly_loop_summary(self, user_id: str, week_start: date = None) -> Dict[str, Any]:
        """Get weekly summary of daily loop activities"""
        if not week_start:
            # Get current week start (Monday)
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        week_end = week_start + timedelta(days=6)
        
        # Get all entries for the week
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date >= ? AND date <= ?
            ORDER BY date ASC, completed_at ASC
        ''', (user_id, week_start, week_end))
        
        entries = await cursor.fetchall()
        
        # Calculate weekly statistics
        daily_completion = {}
        mood_trends = []
        energy_trends = []
        stress_trends = []
        
        for entry in entries:
            entry_date = entry['date']
            if entry_date not in daily_completion:
                daily_completion[entry_date] = {
                    'morning': False,
                    'evening': False,
                    'midday': False
                }
            
            daily_completion[entry_date][entry['loop_type'].split('_')[0]] = True
            
            if entry['mood_rating']:
                mood_trends.append(entry['mood_rating'])
            if entry['energy_level']:
                energy_trends.append(entry['energy_level'])
            if entry['stress_level']:
                stress_trends.append(entry['stress_level'])
        
        return {
            "week_start": week_start.isoformat(),
            "week_end": week_end.isoformat(),
            "daily_completion": daily_completion,
            "completion_rate": len(daily_completion) / 7,
            "mood_average": sum(mood_trends) / len(mood_trends) if mood_trends else 0,
            "energy_average": sum(energy_trends) / len(energy_trends) if energy_trends else 0,
            "stress_average": sum(stress_trends) / len(stress_trends) if stress_trends else 0,
            "total_entries": len(entries),
            "insights": await self._generate_weekly_insights(user_id, week_start, entries)
        }
    
    async def _get_mood_trend(self, user_id: str) -> MoodTrend:
        """Analyze recent mood trends"""
        cursor = await self.connection.execute('''
            SELECT mood_rating FROM daily_loop_entries 
            WHERE user_id = ? AND mood_rating IS NOT NULL
            ORDER BY completed_at DESC LIMIT 7
        ''', (user_id,))
        
        recent_moods = await cursor.fetchall()
        
        if len(recent_moods) < 3:
            return MoodTrend.STABLE
        
        moods = [r['mood_rating'] for r in recent_moods]
        
        # Simple trend analysis
        if moods[0] > moods[-1] + 1:
            return MoodTrend.IMPROVING
        elif moods[0] < moods[-1] - 1:
            return MoodTrend.DECLINING
        else:
            return MoodTrend.STABLE
    
    async def _get_day_activity_summary(self, user_id: str, date_param: date) -> Dict[str, Any]:
        """Get summary of user's day activities"""
        # This would integrate with other systems like pathways, conversations, etc.
        return {
            "high_stress": False,
            "learning_focus": False,
            "social_interactions": 0,
            "productivity_level": "medium"
        }
    
    async def _check_morning_completion(self, user_id: str, date_param: date) -> bool:
        """Check if user completed morning check-in"""
        cursor = await self.connection.execute('''
            SELECT id FROM daily_loop_entries 
            WHERE user_id = ? AND date = ? AND loop_type = 'morning_checkin'
        ''', (user_id, date_param))
        
        result = await cursor.fetchone()
        return result is not None
    
    async def _is_new_user(self, user_id: str) -> bool:
        """Check if user is new to the system"""
        cursor = await self.connection.execute('''
            SELECT COUNT(*) as count FROM daily_loop_entries 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = await cursor.fetchone()
        return result['count'] < 3
    
    async def _update_daily_streak(self, user_id: str, date_param: date):
        """Update user's daily loop streak"""
        # Get current streak
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_streaks 
            WHERE user_id = ? AND streak_type = 'daily'
        ''', (user_id,))
        
        streak_info = await cursor.fetchone()
        
        if not streak_info:
            # Create new streak
            await self.connection.execute('''
                INSERT INTO daily_loop_streaks 
                (user_id, current_streak, longest_streak, last_completion_date)
                VALUES (?, 1, 1, ?)
            ''', (user_id, date_param))
        else:
            # Update existing streak
            last_date = datetime.strptime(streak_info['last_completion_date'], '%Y-%m-%d').date()
            
            if date_param == last_date + timedelta(days=1):
                # Consecutive day
                new_streak = streak_info['current_streak'] + 1
                new_longest = max(new_streak, streak_info['longest_streak'])
                
                await self.connection.execute('''
                    UPDATE daily_loop_streaks 
                    SET current_streak = ?, longest_streak = ?, last_completion_date = ?
                    WHERE user_id = ? AND streak_type = 'daily'
                ''', (new_streak, new_longest, date_param, user_id))
            elif date_param > last_date + timedelta(days=1):
                # Streak broken
                await self.connection.execute('''
                    UPDATE daily_loop_streaks 
                    SET current_streak = 1, last_completion_date = ?
                    WHERE user_id = ? AND streak_type = 'daily'
                ''', (date_param, user_id))
    
    async def _generate_daily_insights(self, user_id: str, date_param: date):
        """Generate insights for the day"""
        # Get morning and evening entries
        cursor = await self.connection.execute('''
            SELECT * FROM daily_loop_entries 
            WHERE user_id = ? AND date = ? AND loop_type IN ('morning_checkin', 'evening_reflection')
        ''', (user_id, date_param))
        
        entries = await cursor.fetchall()
        
        if len(entries) < 2:
            return
        
        # Simple insights generation
        mood_change = "stable"
        energy_change = "stable"
        
        morning_entry = next((e for e in entries if e['loop_type'] == 'morning_checkin'), None)
        evening_entry = next((e for e in entries if e['loop_type'] == 'evening_reflection'), None)
        
        if morning_entry and evening_entry:
            if evening_entry['mood_rating'] > morning_entry['mood_rating'] + 0.5:
                mood_change = "improved"
            elif evening_entry['mood_rating'] < morning_entry['mood_rating'] - 0.5:
                mood_change = "declined"
        
        await self.connection.execute('''
            INSERT OR REPLACE INTO daily_wellness_insights 
            (user_id, date, mood_trend, energy_trend, stress_pattern)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, date_param, mood_change, energy_change, "normal"))
    
    async def _get_next_suggested_activity(self, user_id: str, entries: List[Any]) -> Optional[str]:
        """Get next suggested activity based on completed entries"""
        completed_types = [e['loop_type'] for e in entries]
        
        current_hour = datetime.now().hour
        
        if current_hour < 12 and 'morning_checkin' not in completed_types:
            return "morning_checkin"
        elif 12 <= current_hour < 15 and 'midday_pulse' not in completed_types:
            return "midday_pulse"
        elif current_hour >= 18 and 'evening_reflection' not in completed_types:
            return "evening_reflection"
        
        return None
    
    async def _generate_weekly_insights(self, user_id: str, week_start: date, entries: List[Any]) -> Dict[str, Any]:
        """Generate weekly insights"""
        if not entries:
            return {"message": "No data available for this week"}
        
        # Calculate patterns
        completion_rate = len(set(e['date'] for e in entries)) / 7
        
        return {
            "completion_rate": completion_rate,
            "consistency_level": "high" if completion_rate > 0.7 else "medium" if completion_rate > 0.4 else "low",
            "recommended_focus": "Continue building consistent daily habits",
            "celebration": "You've taken important steps toward daily wellness awareness!"
        }
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            await self.connection.close()