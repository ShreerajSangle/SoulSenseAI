"""
Persona-Guided Pathways System
Creates therapeutic journeys like "Healing from Burnout" or "Building Confidence"
Each persona offers themed 7-day or 21-day tracks with tailored prompts, meditations, and reflections
"""

import asyncio
import aiosqlite
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
from dataclasses import dataclass
from enum import Enum

class PathwayStatus(Enum):
    NOT_STARTED = "not_started"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

@dataclass
class DayActivity:
    day: int
    title: str
    description: str
    prompt: str
    meditation_type: str
    reflection_questions: List[str]
    estimated_duration: int  # minutes
    activity_type: str  # reflection, meditation, journaling, breathing
    completion_criteria: str

@dataclass
class PathwayTrack:
    id: str
    title: str
    description: str
    duration_days: int
    persona_id: str
    theme: str
    difficulty_level: str  # beginner, intermediate, advanced
    tags: List[str]
    daily_activities: List[DayActivity]
    progress_visualization: str  # path, bloom, chakra, tree
    completion_reward: str

@dataclass
class UserPathwayProgress:
    pathway_id: str
    user_id: str
    started_date: date
    current_day: int
    status: PathwayStatus
    completed_days: List[int]
    notes: Dict[int, str]  # Day -> user notes
    mood_ratings: Dict[int, float]  # Day -> mood rating
    last_activity_date: date
    estimated_completion: date

class PersonaPathwaySystem:
    """Manages guided therapeutic pathways for each persona"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self.connection = None
        self.pathway_tracks = {}
        self._initialize_pathway_library()
    
    def _initialize_pathway_library(self):
        """Initialize the comprehensive pathway library for all personas"""
        
        # DR. SARAH - Clinical Therapy Pathways
        self.pathway_tracks.update({
            "sarah_healing_burnout": PathwayTrack(
                id="sarah_healing_burnout",
                title="Healing from Burnout",
                description="A gentle 21-day journey to restore energy and find balance through evidence-based techniques.",
                duration_days=21,
                persona_id="sarah",
                theme="burnout_recovery",
                difficulty_level="intermediate",
                tags=["burnout", "stress", "recovery", "energy", "balance"],
                progress_visualization="path",
                completion_reward="Burnout Recovery Certificate & Personalized Maintenance Plan",
                daily_activities=[
                    DayActivity(
                        day=1,
                        title="Recognizing the Signs",
                        description="Understanding your burnout symptoms and creating awareness",
                        prompt="Let's explore what burnout feels like in your body and mind. What symptoms have you noticed?",
                        meditation_type="body_scan",
                        reflection_questions=[
                            "What were the first signs of burnout you noticed?",
                            "How has burnout affected your daily life?",
                            "What would feeling 'restored' look like for you?"
                        ],
                        estimated_duration=20,
                        activity_type="reflection",
                        completion_criteria="Complete reflection questions and mood rating"
                    ),
                    DayActivity(
                        day=2,
                        title="Setting Boundaries",
                        description="Learning to say no and protect your energy",
                        prompt="Today we'll practice boundary-setting. What situations drain your energy most?",
                        meditation_type="loving_kindness",
                        reflection_questions=[
                            "Where do you struggle to set boundaries?",
                            "What would you say no to if you felt comfortable?",
                            "How can you protect your energy this week?"
                        ],
                        estimated_duration=25,
                        activity_type="journaling",
                        completion_criteria="Write boundary action plan"
                    ),
                    # Add more days...
                ]
            ),
            
            "sarah_anxiety_toolkit": PathwayTrack(
                id="sarah_anxiety_toolkit",
                title="Anxiety Toolkit",
                description="7-day intensive program to build practical anxiety management skills.",
                duration_days=7,
                persona_id="sarah",
                theme="anxiety_management",
                difficulty_level="beginner",
                tags=["anxiety", "coping", "skills", "tools", "calm"],
                progress_visualization="bloom",
                completion_reward="Personal Anxiety Action Plan",
                daily_activities=[
                    DayActivity(
                        day=1,
                        title="Understanding Your Anxiety",
                        description="Mapping your anxiety patterns and triggers",
                        prompt="Let's identify your anxiety patterns. When do you feel most anxious?",
                        meditation_type="breathing",
                        reflection_questions=[
                            "What triggers your anxiety most often?",
                            "How does anxiety feel in your body?",
                            "What thoughts typically accompany your anxiety?"
                        ],
                        estimated_duration=15,
                        activity_type="reflection",
                        completion_criteria="Complete anxiety mapping exercise"
                    )
                ]
            )
        })
        
        # MAYA - Spiritual Growth Pathways  
        self.pathway_tracks.update({
            "maya_chakra_journey": PathwayTrack(
                id="maya_chakra_journey",
                title="Chakra Alignment Journey",
                description="21-day spiritual journey through the seven chakras for balance and healing.",
                duration_days=21,
                persona_id="maya",
                theme="chakra_healing",
                difficulty_level="intermediate",
                tags=["chakras", "energy", "spiritual", "balance", "healing"],
                progress_visualization="chakra",
                completion_reward="Personalized Chakra Meditation Guide",
                daily_activities=[
                    DayActivity(
                        day=1,
                        title="Root Chakra - Grounding",
                        description="Connecting with your foundation and sense of safety",
                        prompt="Let's ground into your root chakra. How do you feel about your foundation and security?",
                        meditation_type="grounding",
                        reflection_questions=[
                            "What makes you feel most grounded and secure?",
                            "Where do you feel instability in your life?",
                            "How can you strengthen your foundation?"
                        ],
                        estimated_duration=30,
                        activity_type="meditation",
                        completion_criteria="Complete grounding meditation"
                    )
                ]
            ),
            
            "maya_mindful_mornings": PathwayTrack(
                id="maya_mindful_mornings",
                title="Mindful Morning Ritual",
                description="7-day practice to create sacred morning moments and set peaceful intentions.",
                duration_days=7,
                persona_id="maya",
                theme="mindful_rituals",
                difficulty_level="beginner",
                tags=["morning", "ritual", "mindfulness", "peace", "intention"],
                progress_visualization="bloom",
                completion_reward="Personalized Morning Ritual Guide",
                daily_activities=[
                    DayActivity(
                        day=1,
                        title="Creating Sacred Space",
                        description="Setting up your morning sanctuary",
                        prompt="Let's create a sacred space for your mornings. What would make you feel peaceful?",
                        meditation_type="gratitude",
                        reflection_questions=[
                            "What does your ideal morning feel like?",
                            "How can you create more peace in your mornings?",
                            "What intentions do you want to set for your day?"
                        ],
                        estimated_duration=20,
                        activity_type="reflection",
                        completion_criteria="Create morning space and set intentions"
                    )
                ]
            )
        })
        
        # ALEX - Peer Support Pathways
        self.pathway_tracks.update({
            "alex_confidence_boost": PathwayTrack(
                id="alex_confidence_boost",
                title="Building Unshakeable Confidence",
                description="7-day confidence-building bootcamp with daily challenges and celebrations.",
                duration_days=7,
                persona_id="alex",
                theme="confidence_building",
                difficulty_level="beginner",
                tags=["confidence", "self-esteem", "courage", "growth", "success"],
                progress_visualization="tree",
                completion_reward="Confidence Champion Certificate",
                daily_activities=[
                    DayActivity(
                        day=1,
                        title="Confidence Baseline",
                        description="Discovering your current confidence level and celebrating your strengths",
                        prompt="Hey! Let's figure out where you're at with confidence. What makes you feel most confident?",
                        meditation_type="self_appreciation",
                        reflection_questions=[
                            "What's one thing you're genuinely proud of?",
                            "When do you feel most confident?",
                            "What confidence goal excites you most?"
                        ],
                        estimated_duration=15,
                        activity_type="reflection",
                        completion_criteria="Complete confidence assessment"
                    )
                ]
            ),
            
            "alex_social_anxiety": PathwayTrack(
                id="alex_social_anxiety",
                title="Social Confidence Mastery",
                description="14-day program to overcome social anxiety with real-world practice and support.",
                duration_days=14,
                persona_id="alex",
                theme="social_confidence",
                difficulty_level="intermediate",
                tags=["social", "anxiety", "confidence", "friends", "communication"],
                progress_visualization="path",
                completion_reward="Social Confidence Toolkit",
                daily_activities=[
                    DayActivity(
                        day=1,
                        title="Social Comfort Zone",
                        description="Understanding your social anxiety and comfort zones",
                        prompt="Let's talk about social stuff! What social situations make you most nervous?",
                        meditation_type="calming",
                        reflection_questions=[
                            "What social situations trigger your anxiety?",
                            "What would social confidence look like for you?",
                            "Who in your life makes you feel most comfortable?"
                        ],
                        estimated_duration=20,
                        activity_type="reflection",
                        completion_criteria="Map social comfort zones"
                    )
                ]
            )
        })
        
        # MARCUS - Life Coaching Pathways
        self.pathway_tracks.update({
            "marcus_goal_mastery": PathwayTrack(
                id="marcus_goal_mastery",
                title="Goal Achievement Mastery",
                description="21-day systematic approach to setting and achieving meaningful goals.",
                duration_days=21,
                persona_id="marcus",
                theme="goal_achievement",
                difficulty_level="advanced",
                tags=["goals", "achievement", "success", "planning", "execution"],
                progress_visualization="path",
                completion_reward="Personal Goal Achievement System",
                daily_activities=[
                    DayActivity(
                        day=1,
                        title="Vision Clarity",
                        description="Defining your ultimate vision and breaking it into actionable goals",
                        prompt="Let's get crystal clear on what you want to achieve. What's your biggest goal right now?",
                        meditation_type="visualization",
                        reflection_questions=[
                            "What would success look like in 6 months?",
                            "What's most important to you right now?",
                            "What obstacles might you face?"
                        ],
                        estimated_duration=25,
                        activity_type="planning",
                        completion_criteria="Complete goal clarity worksheet"
                    )
                ]
            ),
            
            "marcus_productivity_power": PathwayTrack(
                id="marcus_productivity_power",
                title="Productivity Powerhouse",
                description="7-day intensive to optimize your productivity and time management.",
                duration_days=7,
                persona_id="marcus",
                theme="productivity",
                difficulty_level="intermediate",
                tags=["productivity", "time", "efficiency", "focus", "systems"],
                progress_visualization="tree",
                completion_reward="Personal Productivity System",
                daily_activities=[
                    DayActivity(
                        day=1,
                        title="Time Audit",
                        description="Understanding how you currently spend your time",
                        prompt="Let's analyze your time usage. Where do you feel like you're wasting time?",
                        meditation_type="focus",
                        reflection_questions=[
                            "What tasks consume most of your time?",
                            "When are you most productive?",
                            "What distractions derail you most?"
                        ],
                        estimated_duration=30,
                        activity_type="planning",
                        completion_criteria="Complete time audit and analysis"
                    )
                ]
            )
        })
    
    async def initialize(self):
        """Initialize the pathway system"""
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        await self._create_pathway_tables()
    
    async def _create_pathway_tables(self):
        """Create database tables for pathway tracking"""
        
        # User pathway enrollments
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS user_pathway_enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                pathway_id TEXT NOT NULL,
                persona_id TEXT NOT NULL,
                started_date DATE NOT NULL,
                current_day INTEGER DEFAULT 1,
                status TEXT DEFAULT 'active',
                estimated_completion DATE,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, pathway_id)
            )
        ''')
        
        # Daily activity completions
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS pathway_daily_completions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                pathway_id TEXT NOT NULL,
                day_number INTEGER NOT NULL,
                completed_date DATE NOT NULL,
                mood_rating REAL,
                completion_notes TEXT,
                time_spent_minutes INTEGER,
                activity_type TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, pathway_id, day_number)
            )
        ''')
        
        # Pathway progress tracking
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS pathway_progress_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                pathway_id TEXT NOT NULL,
                snapshot_date DATE NOT NULL,
                progress_percentage REAL,
                days_completed INTEGER,
                consecutive_days INTEGER,
                mood_trend TEXT,
                key_insights TEXT,
                challenges_faced TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await self.connection.commit()
    
    async def get_available_pathways(self, persona_id: str = None) -> List[Dict[str, Any]]:
        """Get available pathways, optionally filtered by persona"""
        pathways = []
        
        for pathway_id, pathway in self.pathway_tracks.items():
            if persona_id and pathway.persona_id != persona_id:
                continue
                
            pathways.append({
                "id": pathway.id,
                "title": pathway.title,
                "description": pathway.description,
                "duration_days": pathway.duration_days,
                "persona_id": pathway.persona_id,
                "theme": pathway.theme,
                "difficulty_level": pathway.difficulty_level,
                "tags": pathway.tags,
                "progress_visualization": pathway.progress_visualization,
                "completion_reward": pathway.completion_reward,
                "estimated_time_per_day": sum(day.estimated_duration for day in pathway.daily_activities[:3]) // 3  # Average of first 3 days
            })
        
        return pathways
    
    async def enroll_user_in_pathway(self, user_id: str, pathway_id: str) -> bool:
        """Enroll a user in a pathway"""
        if pathway_id not in self.pathway_tracks:
            return False
        
        pathway = self.pathway_tracks[pathway_id]
        estimated_completion = date.today() + timedelta(days=pathway.duration_days)
        
        try:
            await self.connection.execute('''
                INSERT OR REPLACE INTO user_pathway_enrollments 
                (user_id, pathway_id, persona_id, started_date, estimated_completion)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, pathway_id, pathway.persona_id, date.today(), estimated_completion))
            await self.connection.commit()
            return True
        except Exception as e:
            print(f"Error enrolling user in pathway: {e}")
            return False
    
    async def get_user_pathways(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all pathways for a user"""
        cursor = await self.connection.execute('''
            SELECT * FROM user_pathway_enrollments 
            WHERE user_id = ? 
            ORDER BY started_date DESC
        ''', (user_id,))
        
        enrollments = await cursor.fetchall()
        user_pathways = []
        
        for enrollment in enrollments:
            pathway = self.pathway_tracks.get(enrollment['pathway_id'])
            if not pathway:
                continue
            
            # Get completion count
            completion_cursor = await self.connection.execute('''
                SELECT COUNT(*) as completed_count FROM pathway_daily_completions 
                WHERE user_id = ? AND pathway_id = ?
            ''', (user_id, enrollment['pathway_id']))
            
            completion_count = await completion_cursor.fetchone()
            completed_days = completion_count['completed_count'] if completion_count else 0
            
            user_pathways.append({
                "id": pathway.id,
                "title": pathway.title,
                "description": pathway.description,
                "persona_id": pathway.persona_id,
                "duration_days": pathway.duration_days,
                "current_day": enrollment['current_day'],
                "status": enrollment['status'],
                "started_date": enrollment['started_date'],
                "estimated_completion": enrollment['estimated_completion'],
                "progress_percentage": (completed_days / pathway.duration_days) * 100,
                "days_completed": completed_days,
                "progress_visualization": pathway.progress_visualization
            })
        
        return user_pathways
    
    async def get_daily_activity(self, pathway_id: str, day_number: int) -> Optional[Dict[str, Any]]:
        """Get the daily activity for a specific pathway and day"""
        if pathway_id not in self.pathway_tracks:
            return None
        
        pathway = self.pathway_tracks[pathway_id]
        
        # Find the activity for the specific day
        for activity in pathway.daily_activities:
            if activity.day == day_number:
                return {
                    "day": activity.day,
                    "title": activity.title,
                    "description": activity.description,
                    "prompt": activity.prompt,
                    "meditation_type": activity.meditation_type,
                    "reflection_questions": activity.reflection_questions,
                    "estimated_duration": activity.estimated_duration,
                    "activity_type": activity.activity_type,
                    "completion_criteria": activity.completion_criteria
                }
        
        return None
    
    async def complete_daily_activity(
        self, 
        user_id: str, 
        pathway_id: str, 
        day_number: int,
        mood_rating: float = None,
        completion_notes: str = "",
        time_spent_minutes: int = None
    ) -> bool:
        """Mark a daily activity as completed"""
        
        if pathway_id not in self.pathway_tracks:
            return False
        
        pathway = self.pathway_tracks[pathway_id]
        activity = next((a for a in pathway.daily_activities if a.day == day_number), None)
        
        if not activity:
            return False
        
        try:
            await self.connection.execute('''
                INSERT OR REPLACE INTO pathway_daily_completions 
                (user_id, pathway_id, day_number, completed_date, mood_rating, 
                 completion_notes, time_spent_minutes, activity_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, pathway_id, day_number, date.today(), mood_rating,
                completion_notes, time_spent_minutes, activity.activity_type
            ))
            
            # Update current day in enrollment
            await self.connection.execute('''
                UPDATE user_pathway_enrollments 
                SET current_day = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND pathway_id = ?
            ''', (day_number + 1, user_id, pathway_id))
            
            await self.connection.commit()
            return True
            
        except Exception as e:
            print(f"Error completing daily activity: {e}")
            return False
    
    async def get_user_progress(self, user_id: str, pathway_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed progress for a user's pathway"""
        
        # Get enrollment info
        cursor = await self.connection.execute('''
            SELECT * FROM user_pathway_enrollments 
            WHERE user_id = ? AND pathway_id = ?
        ''', (user_id, pathway_id))
        
        enrollment = await cursor.fetchone()
        if not enrollment:
            return None
        
        # Get completed activities
        completion_cursor = await self.connection.execute('''
            SELECT * FROM pathway_daily_completions 
            WHERE user_id = ? AND pathway_id = ?
            ORDER BY day_number ASC
        ''', (user_id, pathway_id))
        
        completions = await completion_cursor.fetchall()
        
        pathway = self.pathway_tracks.get(pathway_id)
        if not pathway:
            return None
        
        # Calculate progress metrics
        completed_days = len(completions)
        progress_percentage = (completed_days / pathway.duration_days) * 100
        
        # Calculate mood trend
        recent_moods = [c['mood_rating'] for c in completions[-7:] if c['mood_rating']]
        mood_trend = "stable"
        if len(recent_moods) >= 3:
            if recent_moods[-1] > recent_moods[0] + 0.5:
                mood_trend = "improving"
            elif recent_moods[-1] < recent_moods[0] - 0.5:
                mood_trend = "declining"
        
        return {
            "pathway_id": pathway_id,
            "title": pathway.title,
            "current_day": enrollment['current_day'],
            "status": enrollment['status'],
            "progress_percentage": progress_percentage,
            "days_completed": completed_days,
            "total_days": pathway.duration_days,
            "mood_trend": mood_trend,
            "average_mood": sum(recent_moods) / len(recent_moods) if recent_moods else None,
            "consecutive_days": self._calculate_consecutive_days(completions),
            "estimated_completion": enrollment['estimated_completion'],
            "started_date": enrollment['started_date'],
            "recent_completions": [
                {
                    "day": c['day_number'],
                    "date": c['completed_date'],
                    "mood_rating": c['mood_rating'],
                    "notes": c['completion_notes'],
                    "time_spent": c['time_spent_minutes']
                }
                for c in completions[-5:]  # Last 5 completions
            ]
        }
    
    def _calculate_consecutive_days(self, completions: List[Any]) -> int:
        """Calculate consecutive days completed"""
        if not completions:
            return 0
        
        # Sort by day number
        sorted_completions = sorted(completions, key=lambda x: x['day_number'])
        
        consecutive = 1
        for i in range(1, len(sorted_completions)):
            if sorted_completions[i]['day_number'] == sorted_completions[i-1]['day_number'] + 1:
                consecutive += 1
            else:
                consecutive = 1
        
        return consecutive
    
    async def get_pathway_recommendations(self, user_id: str, emotional_state: str = None) -> List[Dict[str, Any]]:
        """Get personalized pathway recommendations based on user's emotional state"""
        
        # Get user's current pathways
        user_pathways = await self.get_user_pathways(user_id)
        enrolled_pathway_ids = [p['id'] for p in user_pathways]
        
        # Get all available pathways
        available_pathways = await self.get_available_pathways()
        
        # Filter out already enrolled pathways
        recommendations = [p for p in available_pathways if p['id'] not in enrolled_pathway_ids]
        
        # Simple emotional state matching
        if emotional_state:
            emotion_pathway_mapping = {
                'anxiety': ['anxiety_toolkit', 'mindful_mornings'],
                'stress': ['healing_burnout', 'mindful_mornings'],
                'sadness': ['chakra_journey', 'confidence_boost'],
                'overwhelm': ['healing_burnout', 'productivity_power'],
                'lonely': ['social_anxiety', 'confidence_boost'],
                'unmotivated': ['goal_mastery', 'productivity_power']
            }
            
            relevant_pathways = emotion_pathway_mapping.get(emotional_state.lower(), [])
            
            # Prioritize relevant pathways
            recommendations.sort(key=lambda x: (
                -2 if any(pathway in x['id'] for pathway in relevant_pathways) else 0,
                -1 if x['difficulty_level'] == 'beginner' else 0
            ))
        
        return recommendations[:3]  # Return top 3 recommendations
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            await self.connection.close()