"""
Emotional Timeline Tracker
Creates visual timelines showing user's emotional journey across sessions
"""

import asyncio
import aiosqlite
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta, date
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class EmotionalDataPoint:
    date: date
    primary_emotion: str
    intensity: float
    session_id: str
    persona_id: str
    key_excerpt: str
    mood_color: str
    session_type: str  # chat, journal, goal, breathing
    
@dataclass
class TimelineMetrics:
    date_range: Tuple[date, date]
    total_sessions: int
    dominant_emotions: List[str]
    emotional_trend: str  # improving, declining, stable
    crisis_moments: int
    breakthrough_moments: int

class EmotionalTimelineTracker:
    """Tracks and visualizes user's emotional journey over time"""
    
    def __init__(self, db_path: str = "soulsense.db"):
        self.db_path = db_path
        self.connection = None
        
        # Emotion color mapping for visualization
        self.emotion_colors = {
            'joy': '#FFD700',
            'happiness': '#FFA500', 
            'excitement': '#FF6B6B',
            'love': '#FF69B4',
            'gratitude': '#90EE90',
            'peace': '#87CEEB',
            'calm': '#B0E0E6',
            'contentment': '#DDA0DD',
            'hope': '#98FB98',
            'confidence': '#F0E68C',
            'neutral': '#D3D3D3',
            'anxiety': '#FFB6C1',
            'stress': '#FFA07A',
            'sadness': '#87CEFA',
            'depression': '#778899',
            'anger': '#DC143C',
            'frustration': '#CD5C5C',
            'fear': '#DDA0DD',
            'overwhelm': '#F4A460',
            'loneliness': '#B19CD9',
            'guilt': '#BC8F8F'
        }
        
    async def initialize(self):
        """Initialize emotional timeline tracker"""
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        await self._create_timeline_tables()
        
    async def _create_timeline_tables(self):
        """Create tables for emotional timeline tracking"""
        
        # Daily emotional summaries
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS daily_emotional_summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date DATE NOT NULL,
                primary_emotion TEXT,
                emotional_intensity REAL,
                secondary_emotions TEXT,
                session_count INTEGER DEFAULT 0,
                journal_entries INTEGER DEFAULT 0,
                goals_worked_on INTEGER DEFAULT 0,
                breathing_sessions INTEGER DEFAULT 0,
                dominant_persona TEXT,
                mood_trend TEXT,
                key_moments TEXT,
                breakthrough_indicator BOOLEAN DEFAULT 0,
                crisis_indicator BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, date)
            )
        ''')
        
        # Emotional timeline points for detailed view
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS emotional_timeline_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                emotion TEXT NOT NULL,
                intensity REAL,
                session_id TEXT,
                persona_id TEXT,
                source_type TEXT,
                context_excerpt TEXT,
                linked_content_id TEXT,
                mood_color TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Weekly emotional patterns
        await self.connection.execute('''
            CREATE TABLE IF NOT EXISTS weekly_emotional_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                week_start DATE NOT NULL,
                week_end DATE NOT NULL,
                dominant_emotions TEXT,
                emotional_trajectory TEXT,
                pattern_insights TEXT,
                growth_indicators TEXT,
                challenge_areas TEXT,
                persona_usage_summary TEXT,
                weekly_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, week_start)
            )
        ''')
        
        await self.connection.commit()
    
    async def log_emotional_point(
        self,
        user_id: str,
        emotion: str,
        intensity: float,
        session_id: str = None,
        persona_id: str = None,
        source_type: str = "chat",
        context_excerpt: str = "",
        linked_content_id: str = None
    ):
        """Log a single emotional data point"""
        
        mood_color = self.emotion_colors.get(emotion.lower(), '#D3D3D3')
        
        await self.connection.execute('''
            INSERT INTO emotional_timeline_points 
            (user_id, timestamp, emotion, intensity, session_id, persona_id, 
             source_type, context_excerpt, linked_content_id, mood_color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, datetime.now(), emotion, intensity, session_id,
            persona_id, source_type, context_excerpt, linked_content_id, mood_color
        ))
        await self.connection.commit()
        
        # Update daily summary
        await self._update_daily_summary(user_id, emotion, intensity, source_type, persona_id)
    
    async def _update_daily_summary(
        self,
        user_id: str,
        emotion: str,
        intensity: float,
        source_type: str,
        persona_id: str
    ):
        """Update or create daily emotional summary"""
        
        today = date.today()
        
        # Get existing summary
        cursor = await self.connection.execute('''
            SELECT * FROM daily_emotional_summaries 
            WHERE user_id = ? AND date = ?
        ''', (user_id, today))
        existing = await cursor.fetchone()
        
        if existing:
            # Update existing summary
            secondary_emotions = json.loads(existing['secondary_emotions'] or '[]')
            if emotion not in secondary_emotions:
                secondary_emotions.append(emotion)
            
            # Update session counts
            update_field = f"{source_type}_sessions" if source_type in ['journal', 'breathing'] else 'session_count'
            
            await self.connection.execute(f'''
                UPDATE daily_emotional_summaries 
                SET primary_emotion = ?,
                    emotional_intensity = ?,
                    secondary_emotions = ?,
                    {update_field} = {update_field} + 1,
                    dominant_persona = ?
                WHERE user_id = ? AND date = ?
            ''', (emotion, intensity, json.dumps(secondary_emotions), persona_id, user_id, today))
        else:
            # Create new summary
            await self.connection.execute('''
                INSERT INTO daily_emotional_summaries 
                (user_id, date, primary_emotion, emotional_intensity, 
                 secondary_emotions, session_count, dominant_persona)
                VALUES (?, ?, ?, ?, ?, 1, ?)
            ''', (user_id, today, emotion, intensity, json.dumps([emotion]), persona_id))
        
        await self.connection.commit()
    
    async def get_emotional_timeline(
        self,
        user_id: str,
        period: str = "week",  # week, month, quarter
        start_date: date = None
    ) -> List[EmotionalDataPoint]:
        """Get emotional timeline data for visualization"""
        
        if not start_date:
            start_date = date.today() - timedelta(days=7 if period == "week" else 30)
        
        end_date = date.today()
        if period == "quarter":
            start_date = date.today() - timedelta(days=90)
        
        # Get daily summaries
        cursor = await self.connection.execute('''
            SELECT * FROM daily_emotional_summaries 
            WHERE user_id = ? AND date BETWEEN ? AND ?
            ORDER BY date ASC
        ''', (user_id, start_date, end_date))
        
        daily_summaries = await cursor.fetchall()
        timeline_points = []
        
        for summary in daily_summaries:
            # Get key excerpt from that day
            excerpt_cursor = await self.connection.execute('''
                SELECT context_excerpt FROM emotional_timeline_points 
                WHERE user_id = ? AND DATE(timestamp) = ?
                AND context_excerpt != ""
                ORDER BY intensity DESC
                LIMIT 1
            ''', (user_id, summary['date']))
            
            excerpt_row = await excerpt_cursor.fetchone()
            key_excerpt = excerpt_row['context_excerpt'] if excerpt_row else ""
            
            point = EmotionalDataPoint(
                date=datetime.strptime(summary['date'], '%Y-%m-%d').date(),
                primary_emotion=summary['primary_emotion'] or 'neutral',
                intensity=summary['emotional_intensity'] or 0.5,
                session_id="daily_summary",
                persona_id=summary['dominant_persona'] or 'general',
                key_excerpt=key_excerpt,
                mood_color=self.emotion_colors.get(summary['primary_emotion'], '#D3D3D3'),
                session_type=f"{summary['session_count']} sessions"
            )
            timeline_points.append(point)
        
        return timeline_points
    
    async def get_timeline_metrics(
        self,
        user_id: str,
        period: str = "week"
    ) -> TimelineMetrics:
        """Get timeline analytics and insights"""
        
        start_date = date.today() - timedelta(days=7 if period == "week" else 30)
        end_date = date.today()
        
        # Get summaries for the period
        cursor = await self.connection.execute('''
            SELECT * FROM daily_emotional_summaries 
            WHERE user_id = ? AND date BETWEEN ? AND ?
            ORDER BY date ASC
        ''', (user_id, start_date, end_date))
        
        summaries = await cursor.fetchall()
        
        # Calculate metrics
        total_sessions = sum(s['session_count'] for s in summaries)
        emotions = [s['primary_emotion'] for s in summaries if s['primary_emotion']]
        
        # Find dominant emotions
        emotion_counts = defaultdict(int)
        for emotion in emotions:
            emotion_counts[emotion] += 1
        
        dominant_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        dominant_emotions = [emotion for emotion, count in dominant_emotions]
        
        # Calculate emotional trend
        if len(summaries) >= 3:
            early_avg = sum(s['emotional_intensity'] or 0.5 for s in summaries[:len(summaries)//2])
            late_avg = sum(s['emotional_intensity'] or 0.5 for s in summaries[len(summaries)//2:])
            
            if late_avg > early_avg + 0.2:
                trend = "improving"
            elif late_avg < early_avg - 0.2:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"
        
        # Count crisis and breakthrough moments
        crisis_moments = sum(1 for s in summaries if s['crisis_indicator'])
        breakthrough_moments = sum(1 for s in summaries if s['breakthrough_indicator'])
        
        return TimelineMetrics(
            date_range=(start_date, end_date),
            total_sessions=total_sessions,
            dominant_emotions=dominant_emotions,
            emotional_trend=trend,
            crisis_moments=crisis_moments,
            breakthrough_moments=breakthrough_moments
        )
    
    async def get_clickable_moments(
        self,
        user_id: str,
        target_date: date
    ) -> List[Dict[str, Any]]:
        """Get detailed moments for a specific date that users can explore"""
        
        cursor = await self.connection.execute('''
            SELECT * FROM emotional_timeline_points 
            WHERE user_id = ? AND DATE(timestamp) = ?
            ORDER BY timestamp ASC
        ''', (user_id, target_date))
        
        points = await cursor.fetchall()
        moments = []
        
        for point in points:
            moment = {
                'timestamp': point['timestamp'],
                'emotion': point['emotion'],
                'intensity': point['intensity'],
                'persona': point['persona_id'],
                'source_type': point['source_type'],
                'excerpt': point['context_excerpt'],
                'session_id': point['session_id'],
                'linked_content_id': point['linked_content_id'],
                'color': point['mood_color']
            }
            moments.append(moment)
        
        return moments
    
    async def generate_weekly_insights(
        self,
        user_id: str,
        week_start: date = None
    ) -> Dict[str, Any]:
        """Generate weekly emotional pattern insights"""
        
        if not week_start:
            week_start = date.today() - timedelta(days=date.today().weekday())
        
        week_end = week_start + timedelta(days=6)
        
        # Get timeline for the week
        timeline = await self.get_emotional_timeline(user_id, "week", week_start)
        metrics = await self.get_timeline_metrics(user_id, "week")
        
        # Generate insights
        insights = {
            'week_range': f"{week_start.strftime('%B %d')} - {week_end.strftime('%B %d')}",
            'dominant_emotions': metrics.dominant_emotions,
            'emotional_trajectory': metrics.emotional_trend,
            'total_sessions': metrics.total_sessions,
            'growth_areas': [],
            'patterns': [],
            'recommendations': []
        }
        
        # Analyze patterns
        if 'anxiety' in metrics.dominant_emotions:
            insights['patterns'].append("Periods of heightened anxiety detected")
            insights['recommendations'].append("Consider consistent breathing exercises with Maya")
        
        if metrics.emotional_trend == "improving":
            insights['growth_areas'].append("Consistent emotional improvement")
            insights['patterns'].append("Positive trajectory maintained throughout week")
        
        if metrics.total_sessions >= 5:
            insights['growth_areas'].append("Strong engagement with wellness practices")
        
        # Store insights
        await self.connection.execute('''
            INSERT OR REPLACE INTO weekly_emotional_patterns 
            (user_id, week_start, week_end, dominant_emotions, emotional_trajectory,
             pattern_insights, growth_indicators, weekly_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, week_start, week_end, 
            json.dumps(metrics.dominant_emotions),
            metrics.emotional_trend,
            json.dumps(insights['patterns']),
            json.dumps(insights['growth_areas']),
            len(insights['growth_areas']) * 2.5  # Simple scoring
        ))
        await self.connection.commit()
        
        return insights
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            await self.connection.close()