#!/usr/bin/env python3
"""
Personalized Therapeutic Journey Mapping and Goal Tracking for SoulSense AI
Tracks emotional goals, weekly progress, and milestone-based guidance
"""

import json
import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np

class GoalType(Enum):
    EMOTIONAL_REGULATION = "emotional_regulation"
    ANXIETY_MANAGEMENT = "anxiety_management"
    DEPRESSION_RECOVERY = "depression_recovery"
    STRESS_REDUCTION = "stress_reduction"
    RELATIONSHIP_IMPROVEMENT = "relationship_improvement"
    SELF_ESTEEM = "self_esteem"
    SLEEP_IMPROVEMENT = "sleep_improvement"
    MINDFULNESS_PRACTICE = "mindfulness_practice"
    HABIT_FORMATION = "habit_formation"
    CRISIS_PREVENTION = "crisis_prevention"

class GoalStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    ON_TRACK = "on_track"
    STRUGGLING = "struggling"
    ACHIEVED = "achieved"
    PAUSED = "paused"

@dataclass
class TherapeuticGoal:
    goal_id: str
    user_id: str
    goal_type: str
    title: str
    description: str
    target_metrics: Dict[str, Any]
    baseline_values: Dict[str, float]
    current_values: Dict[str, float]
    target_date: str
    created_date: str
    status: str
    milestones: List[Dict[str, Any]]
    interventions_assigned: List[str]
    progress_notes: List[Dict[str, Any]]

@dataclass
class WeeklyProgress:
    user_id: str
    week_start: str
    week_end: str
    goals_worked_on: List[str]
    mood_ratings: List[float]
    activities_completed: List[str]
    challenges_faced: List[str]
    breakthrough_moments: List[str]
    self_assessment_score: float
    therapist_notes: Optional[str] = None

@dataclass
class Milestone:
    milestone_id: str
    goal_id: str
    title: str
    description: str
    target_date: str
    completion_criteria: Dict[str, Any]
    reward_message: str
    achieved: bool
    achievement_date: Optional[str] = None

class GoalTracker:
    def __init__(self):
        self.goals = []
        self.weekly_progress = []
        self.milestones = []
        self.goal_templates = self._initialize_goal_templates()
        self.intervention_mapping = self._initialize_intervention_mapping()
        
    def create_personalized_goal(self, user_id: str, goal_type: str, 
                                user_input: Dict[str, Any]) -> TherapeuticGoal:
        """Create a personalized therapeutic goal based on user input and clinical assessment"""
        
        template = self.goal_templates.get(goal_type, self.goal_templates['emotional_regulation'])
        
        # Customize goal based on user input
        goal = TherapeuticGoal(
            goal_id=f"{user_id}_{goal_type}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}",
            user_id=user_id,
            goal_type=goal_type,
            title=user_input.get('custom_title', template['title']),
            description=self._personalize_description(template['description'], user_input),
            target_metrics=template['target_metrics'],
            baseline_values=user_input.get('baseline_values', {}),
            current_values=user_input.get('baseline_values', {}),
            target_date=user_input.get('target_date', self._calculate_default_target_date(goal_type)),
            created_date=datetime.datetime.now().isoformat(),
            status=GoalStatus.NOT_STARTED.value,
            milestones=self._generate_milestones(goal_type, user_input),
            interventions_assigned=self._assign_interventions(goal_type, user_input),
            progress_notes=[]
        )
        
        self.goals.append(goal)
        return goal
    
    def update_goal_progress(self, goal_id: str, progress_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update goal progress and recalculate status"""
        
        goal = self._find_goal(goal_id)
        if not goal:
            return {"error": "Goal not found"}
        
        # Update current values
        for metric, value in progress_data.get('metric_updates', {}).items():
            if metric in goal.current_values:
                goal.current_values[metric] = value
        
        # Add progress note
        progress_note = {
            "date": datetime.datetime.now().isoformat(),
            "type": progress_data.get('note_type', 'update'),
            "content": progress_data.get('notes', ''),
            "mood_rating": progress_data.get('mood_rating'),
            "achievements": progress_data.get('achievements', []),
            "challenges": progress_data.get('challenges', [])
        }
        goal.progress_notes.append(progress_note)
        
        # Recalculate goal status
        new_status = self._calculate_goal_status(goal)
        goal.status = new_status
        
        # Check for milestone achievements
        milestone_updates = self._check_milestone_achievements(goal)
        
        return {
            "goal_status": new_status,
            "progress_percentage": self._calculate_progress_percentage(goal),
            "milestone_updates": milestone_updates,
            "next_actions": self._suggest_next_actions(goal),
            "encouragement_message": self._generate_encouragement_message(goal, progress_data)
        }
    
    def create_weekly_assessment(self, user_id: str, week_data: Dict[str, Any]) -> WeeklyProgress:
        """Create weekly progress assessment"""
        
        week_start = week_data.get('week_start', self._get_week_start())
        week_end = week_data.get('week_end', self._get_week_end())
        
        progress = WeeklyProgress(
            user_id=user_id,
            week_start=week_start,
            week_end=week_end,
            goals_worked_on=week_data.get('goals_worked_on', []),
            mood_ratings=week_data.get('mood_ratings', []),
            activities_completed=week_data.get('activities_completed', []),
            challenges_faced=week_data.get('challenges_faced', []),
            breakthrough_moments=week_data.get('breakthrough_moments', []),
            self_assessment_score=week_data.get('self_assessment_score', 5.0)
        )
        
        self.weekly_progress.append(progress)
        return progress
    
    def generate_journey_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Generate comprehensive therapeutic journey dashboard"""
        
        user_goals = [g for g in self.goals if g.user_id == user_id]
        user_progress = [p for p in self.weekly_progress if p.user_id == user_id]
        
        dashboard = {
            "overview": self._generate_overview(user_goals, user_progress),
            "active_goals": self._format_active_goals(user_goals),
            "progress_trends": self._analyze_progress_trends(user_progress),
            "recent_achievements": self._get_recent_achievements(user_goals),
            "focus_areas": self._identify_focus_areas(user_goals, user_progress),
            "upcoming_milestones": self._get_upcoming_milestones(user_goals),
            "personalized_insights": self._generate_personalized_insights(user_goals, user_progress),
            "recommended_actions": self._generate_recommended_actions(user_goals, user_progress)
        }
        
        return dashboard
    
    def suggest_new_goals(self, user_id: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Suggest new goals based on user progress and clinical assessment"""
        
        current_goals = [g for g in self.goals if g.user_id == user_id and g.status in ['in_progress', 'on_track']]
        completed_goals = [g for g in self.goals if g.user_id == user_id and g.status == 'achieved']
        
        suggestions = []
        
        # Analyze current goal patterns
        current_types = [g.goal_type for g in current_goals]
        completed_types = [g.goal_type for g in completed_goals]
        
        # Suggest complementary goals
        if 'anxiety_management' in current_types and 'mindfulness_practice' not in current_types:
            suggestions.append(self._create_goal_suggestion('mindfulness_practice', context))
        
        if 'depression_recovery' in current_types and 'habit_formation' not in current_types:
            suggestions.append(self._create_goal_suggestion('habit_formation', context))
        
        # Suggest advanced goals for completed areas
        if 'emotional_regulation' in completed_types and 'relationship_improvement' not in current_types:
            suggestions.append(self._create_goal_suggestion('relationship_improvement', context))
        
        # Suggest goals based on clinical scores
        clinical_scores = context.get('clinical_scores', {})
        if clinical_scores.get('gad7_score', 0) > 10 and 'anxiety_management' not in current_types:
            suggestions.append(self._create_goal_suggestion('anxiety_management', context))
        
        if clinical_scores.get('phq9_score', 0) > 10 and 'depression_recovery' not in current_types:
            suggestions.append(self._create_goal_suggestion('depression_recovery', context))
        
        return suggestions[:3]  # Return top 3 suggestions
    
    def _initialize_goal_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize goal templates for different therapeutic areas"""
        return {
            'emotional_regulation': {
                'title': 'Develop Emotional Regulation Skills',
                'description': 'Learn to recognize, understand, and manage emotions effectively in daily life',
                'target_metrics': {
                    'emotional_awareness_score': 8.0,
                    'regulation_frequency': 5,  # times per week using skills
                    'intensity_reduction': 3.0  # average reduction in emotional intensity
                },
                'typical_duration_weeks': 8,
                'milestones': [
                    {'week': 2, 'title': 'Emotion Recognition', 'description': 'Consistently identify emotions as they arise'},
                    {'week': 4, 'title': 'Basic Regulation', 'description': 'Use regulation techniques 3+ times per week'},
                    {'week': 6, 'title': 'Advanced Skills', 'description': 'Apply skills in challenging situations'},
                    {'week': 8, 'title': 'Mastery', 'description': 'Demonstrate consistent emotional regulation'}
                ]
            },
            'anxiety_management': {
                'title': 'Reduce Anxiety and Build Coping Skills',
                'description': 'Develop practical strategies to manage anxiety symptoms and prevent escalation',
                'target_metrics': {
                    'anxiety_episodes_per_week': 2,
                    'coping_skill_usage': 7,  # times per week
                    'confidence_in_managing': 7.0
                },
                'typical_duration_weeks': 6,
                'milestones': [
                    {'week': 1, 'title': 'Trigger Identification', 'description': 'Identify personal anxiety triggers'},
                    {'week': 3, 'title': 'Coping Toolkit', 'description': 'Master 3 anxiety management techniques'},
                    {'week': 5, 'title': 'Prevention Skills', 'description': 'Use preventive strategies regularly'},
                    {'week': 6, 'title': 'Confidence Building', 'description': 'Feel confident managing anxiety'}
                ]
            },
            'depression_recovery': {
                'title': 'Overcome Depression and Rebuild Joy',
                'description': 'Work towards lifting mood, increasing energy, and rediscovering meaning and pleasure',
                'target_metrics': {
                    'mood_rating_average': 6.0,
                    'meaningful_activities_per_week': 5,
                    'social_connections_per_week': 3
                },
                'typical_duration_weeks': 12,
                'milestones': [
                    {'week': 2, 'title': 'Activity Scheduling', 'description': 'Establish daily structure and activities'},
                    {'week': 4, 'title': 'Social Reconnection', 'description': 'Reconnect with supportive relationships'},
                    {'week': 8, 'title': 'Meaning and Purpose', 'description': 'Identify sources of meaning and purpose'},
                    {'week': 12, 'title': 'Sustained Recovery', 'description': 'Maintain improvements consistently'}
                ]
            },
            'stress_reduction': {
                'title': 'Manage Stress and Build Resilience',
                'description': 'Develop healthy stress management habits and build resilience for future challenges',
                'target_metrics': {
                    'stress_level_rating': 4.0,
                    'relaxation_practices_per_week': 5,
                    'stress_recovery_time_hours': 2.0
                },
                'typical_duration_weeks': 6,
                'milestones': [
                    {'week': 1, 'title': 'Stress Awareness', 'description': 'Recognize early stress signals'},
                    {'week': 3, 'title': 'Relaxation Mastery', 'description': 'Master relaxation techniques'},
                    {'week': 5, 'title': 'Lifestyle Integration', 'description': 'Integrate stress management into daily life'},
                    {'week': 6, 'title': 'Resilience Building', 'description': 'Develop long-term resilience strategies'}
                ]
            },
            'mindfulness_practice': {
                'title': 'Cultivate Mindfulness and Present-Moment Awareness',
                'description': 'Develop a consistent mindfulness practice to enhance well-being and emotional balance',
                'target_metrics': {
                    'meditation_minutes_per_day': 20,
                    'mindful_moments_per_day': 10,
                    'present_moment_awareness': 7.0
                },
                'typical_duration_weeks': 8,
                'milestones': [
                    {'week': 2, 'title': 'Basic Practice', 'description': 'Establish 10-minute daily meditation'},
                    {'week': 4, 'title': 'Mindful Living', 'description': 'Apply mindfulness to daily activities'},
                    {'week': 6, 'title': 'Extended Practice', 'description': 'Maintain 20-minute sessions'},
                    {'week': 8, 'title': 'Integration', 'description': 'Live with mindful awareness throughout the day'}
                ]
            }
        }
    
    def _initialize_intervention_mapping(self) -> Dict[str, List[str]]:
        """Map goal types to relevant interventions"""
        return {
            'emotional_regulation': ['cognitive_restructuring', 'mindfulness_meditation', 'emotion_labeling'],
            'anxiety_management': ['breathing_exercises', 'grounding_techniques', 'progressive_muscle_relaxation'],
            'depression_recovery': ['behavioral_activation', 'gratitude_practice', 'social_connection'],
            'stress_reduction': ['breathing_exercises', 'progressive_muscle_relaxation', 'time_management'],
            'mindfulness_practice': ['mindfulness_meditation', 'body_scan', 'mindful_breathing'],
            'habit_formation': ['habit_stacking', 'implementation_intentions', 'reward_systems']
        }
    
    def _personalize_description(self, template_description: str, user_input: Dict[str, Any]) -> str:
        """Personalize goal description based on user input"""
        
        specific_focus = user_input.get('specific_focus', '')
        personal_motivation = user_input.get('motivation', '')
        
        personalized = template_description
        
        if specific_focus:
            personalized += f" With particular focus on {specific_focus}."
        
        if personal_motivation:
            personalized += f" Personal motivation: {personal_motivation}."
        
        return personalized
    
    def _calculate_default_target_date(self, goal_type: str) -> str:
        """Calculate default target date based on goal type"""
        
        template = self.goal_templates.get(goal_type, {'typical_duration_weeks': 8})
        weeks = template['typical_duration_weeks']
        
        target_date = datetime.datetime.now() + datetime.timedelta(weeks=weeks)
        return target_date.isoformat()
    
    def _generate_milestones(self, goal_type: str, user_input: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized milestones for goal"""
        
        template = self.goal_templates.get(goal_type, self.goal_templates['emotional_regulation'])
        milestones = []
        
        for milestone_template in template['milestones']:
            milestone = {
                'milestone_id': f"{goal_type}_milestone_{milestone_template['week']}",
                'week': milestone_template['week'],
                'title': milestone_template['title'],
                'description': milestone_template['description'],
                'target_date': self._calculate_milestone_date(milestone_template['week']),
                'completion_criteria': self._define_completion_criteria(goal_type, milestone_template),
                'achieved': False
            }
            milestones.append(milestone)
        
        return milestones
    
    def _assign_interventions(self, goal_type: str, user_input: Dict[str, Any]) -> List[str]:
        """Assign relevant interventions to goal"""
        
        base_interventions = self.intervention_mapping.get(goal_type, [])
        user_preferences = user_input.get('preferred_interventions', [])
        
        # Combine base interventions with user preferences
        assigned = list(set(base_interventions + user_preferences))
        
        return assigned[:5]  # Limit to 5 interventions
    
    def _find_goal(self, goal_id: str) -> Optional[TherapeuticGoal]:
        """Find goal by ID"""
        for goal in self.goals:
            if goal.goal_id == goal_id:
                return goal
        return None
    
    def _calculate_goal_status(self, goal: TherapeuticGoal) -> str:
        """Calculate current goal status based on progress"""
        
        progress_percentage = self._calculate_progress_percentage(goal)
        days_since_creation = (datetime.datetime.now() - datetime.datetime.fromisoformat(goal.created_date)).days
        target_days = (datetime.datetime.fromisoformat(goal.target_date) - datetime.datetime.fromisoformat(goal.created_date)).days
        
        if progress_percentage >= 100:
            return GoalStatus.ACHIEVED.value
        elif progress_percentage >= 75:
            return GoalStatus.ON_TRACK.value
        elif days_since_creation / target_days > 0.7 and progress_percentage < 50:
            return GoalStatus.STRUGGLING.value
        elif progress_percentage > 0:
            return GoalStatus.IN_PROGRESS.value
        else:
            return GoalStatus.NOT_STARTED.value
    
    def _calculate_progress_percentage(self, goal: TherapeuticGoal) -> float:
        """Calculate goal progress percentage"""
        
        if not goal.target_metrics or not goal.current_values:
            return 0.0
        
        progress_scores = []
        
        for metric, target_value in goal.target_metrics.items():
            if metric in goal.current_values and metric in goal.baseline_values:
                current = goal.current_values[metric]
                baseline = goal.baseline_values[metric]
                
                # Calculate progress based on improvement direction
                if self._is_improvement_metric(metric):
                    # Higher is better (e.g., confidence, skill usage)
                    if target_value > baseline:
                        progress = (current - baseline) / (target_value - baseline)
                    else:
                        progress = 1.0 if current >= target_value else 0.0
                else:
                    # Lower is better (e.g., anxiety episodes, stress level)
                    if baseline > target_value:
                        progress = (baseline - current) / (baseline - target_value)
                    else:
                        progress = 1.0 if current <= target_value else 0.0
                
                progress_scores.append(max(0.0, min(1.0, progress)))
        
        return float(np.mean(progress_scores) * 100) if progress_scores else 0.0
    
    def _is_improvement_metric(self, metric: str) -> bool:
        """Determine if higher values represent improvement"""
        improvement_metrics = [
            'confidence', 'skill_usage', 'awareness', 'frequency', 'rating',
            'meaningful_activities', 'social_connections', 'meditation_minutes'
        ]
        
        return any(improvement_word in metric.lower() for improvement_word in improvement_metrics)
    
    def _check_milestone_achievements(self, goal: TherapeuticGoal) -> List[Dict[str, Any]]:
        """Check and update milestone achievements"""
        
        milestone_updates = []
        progress_percentage = self._calculate_progress_percentage(goal)
        
        for milestone in goal.milestones:
            if not milestone['achieved']:
                # Simple check: if we're past the milestone week and making progress
                milestone_week = milestone['week']
                weeks_since_start = (datetime.datetime.now() - datetime.datetime.fromisoformat(goal.created_date)).days / 7
                
                if weeks_since_start >= milestone_week and progress_percentage >= (milestone_week / 8) * 100:
                    milestone['achieved'] = True
                    milestone['achievement_date'] = datetime.datetime.now().isoformat()
                    
                    milestone_updates.append({
                        'milestone_id': milestone['milestone_id'],
                        'title': milestone['title'],
                        'achievement_date': milestone['achievement_date'],
                        'celebration_message': f"🎉 Congratulations! You've achieved: {milestone['title']}"
                    })
        
        return milestone_updates
    
    def _suggest_next_actions(self, goal: TherapeuticGoal) -> List[str]:
        """Suggest next actions based on goal progress"""
        
        progress_percentage = self._calculate_progress_percentage(goal)
        goal_type = goal.goal_type
        
        suggestions = []
        
        if progress_percentage < 25:
            suggestions.extend(self._get_getting_started_actions(goal_type))
        elif progress_percentage < 50:
            suggestions.extend(self._get_building_momentum_actions(goal_type))
        elif progress_percentage < 75:
            suggestions.extend(self._get_deepening_practice_actions(goal_type))
        else:
            suggestions.extend(self._get_mastery_actions(goal_type))
        
        return suggestions
    
    def _generate_encouragement_message(self, goal: TherapeuticGoal, progress_data: Dict[str, Any]) -> str:
        """Generate personalized encouragement message"""
        
        progress_percentage = self._calculate_progress_percentage(goal)
        mood_rating = progress_data.get('mood_rating')
        achievements = progress_data.get('achievements', [])
        
        if achievements:
            return f"Great work on {', '.join(achievements)}! You're making real progress towards your goal."
        elif progress_percentage > 50:
            return f"You're {progress_percentage:.0f}% of the way to your goal. Keep up the excellent work!"
        elif mood_rating and mood_rating >= 7:
            return "Your positive mood shows you're on the right track. Consistency is key!"
        else:
            return "Every step forward matters, even the small ones. You're building important skills."
    
    def _generate_overview(self, goals: List[TherapeuticGoal], progress: List[WeeklyProgress]) -> Dict[str, Any]:
        """Generate overview statistics"""
        
        active_goals = [g for g in goals if g.status in ['in_progress', 'on_track']]
        completed_goals = [g for g in goals if g.status == 'achieved']
        
        recent_progress = progress[-4:] if len(progress) >= 4 else progress  # Last 4 weeks
        avg_mood = np.mean([p.self_assessment_score for p in recent_progress]) if recent_progress else 5.0
        
        return {
            'total_goals': len(goals),
            'active_goals': len(active_goals),
            'completed_goals': len(completed_goals),
            'overall_progress': np.mean([self._calculate_progress_percentage(g) for g in goals]) if goals else 0.0,
            'recent_mood_average': float(avg_mood),
            'journey_duration_weeks': len(progress),
            'consistency_score': self._calculate_consistency_score(progress)
        }
    
    def _calculate_consistency_score(self, progress: List[WeeklyProgress]) -> float:
        """Calculate consistency score based on regular engagement"""
        
        if len(progress) < 2:
            return 0.0
        
        # Score based on regular weekly assessments and goal work
        weekly_engagement = []
        for week in progress:
            engagement = len(week.goals_worked_on) + len(week.activities_completed)
            weekly_engagement.append(min(engagement, 10))  # Cap at 10 for normalization
        
        # Calculate consistency as inverse of variance
        if len(weekly_engagement) > 1:
            consistency = 1.0 - (np.std(weekly_engagement) / np.mean(weekly_engagement))
        else:
            consistency = 1.0
        
        return max(0.0, min(1.0, consistency))
    
    def _get_getting_started_actions(self, goal_type: str) -> List[str]:
        """Get actions for early stage of goal"""
        actions_map = {
            'emotional_regulation': [
                "Practice identifying one emotion each day",
                "Keep an emotion diary for one week",
                "Learn about the connection between thoughts and feelings"
            ],
            'anxiety_management': [
                "Practice 5-minute breathing exercises daily",
                "Identify your top 3 anxiety triggers",
                "Create a simple calming toolkit"
            ],
            'depression_recovery': [
                "Schedule one meaningful activity each day",
                "Reach out to one supportive person this week",
                "Establish a basic daily routine"
            ]
        }
        return actions_map.get(goal_type, ["Continue working on your goal consistently"])
    
    def _get_building_momentum_actions(self, goal_type: str) -> List[str]:
        """Get actions for building momentum stage"""
        actions_map = {
            'emotional_regulation': [
                "Practice regulation techniques in low-stress situations",
                "Share your emotional insights with someone you trust",
                "Try different regulation strategies to find what works best"
            ],
            'anxiety_management': [
                "Use coping skills during mildly challenging situations",
                "Practice exposure to small anxiety triggers",
                "Build confidence by celebrating small wins"
            ],
            'depression_recovery': [
                "Increase meaningful activities to 3-4 per week",
                "Plan social activities with supportive people",
                "Explore activities that bring you joy or purpose"
            ]
        }
        return actions_map.get(goal_type, ["Continue building on your progress"])
    
    def _get_deepening_practice_actions(self, goal_type: str) -> List[str]:
        """Get actions for deepening practice stage"""
        actions_map = {
            'emotional_regulation': [
                "Apply skills during moderately challenging situations",
                "Help others with their emotional awareness",
                "Reflect on how your emotional skills have improved relationships"
            ],
            'anxiety_management': [
                "Challenge yourself with previously avoided situations",
                "Teach your coping strategies to someone else",
                "Plan for maintaining progress long-term"
            ],
            'depression_recovery': [
                "Take on leadership roles in meaningful activities",
                "Mentor someone else working on similar goals",
                "Create a relapse prevention plan"
            ]
        }
        return actions_map.get(goal_type, ["Deepen your practice and help others"])
    
    def _get_mastery_actions(self, goal_type: str) -> List[str]:
        """Get actions for mastery stage"""
        actions_map = {
            'emotional_regulation': [
                "Become a mentor for emotional intelligence",
                "Apply skills in high-stress professional situations",
                "Set new goals that build on this foundation"
            ],
            'anxiety_management': [
                "Live fully without anxiety limiting your choices",
                "Share your success story to inspire others",
                "Maintain skills through regular practice"
            ],
            'depression_recovery': [
                "Enjoy sustained well-being and vitality",
                "Contribute to your community in meaningful ways",
                "Celebrate your transformation and continued growth"
            ]
        }
        return actions_map.get(goal_type, ["Celebrate your success and maintain your progress"])
    
    def _calculate_milestone_date(self, week: int) -> str:
        """Calculate target date for milestone"""
        target_date = datetime.datetime.now() + datetime.timedelta(weeks=week)
        return target_date.isoformat()
    
    def _define_completion_criteria(self, goal_type: str, milestone_template: Dict) -> Dict[str, Any]:
        """Define specific completion criteria for milestone"""
        # This would be more sophisticated in a real implementation
        return {
            'description': milestone_template['description'],
            'measurable_outcome': f"Complete {milestone_template['title'].lower()} requirements"
        }
    
    def _get_week_start(self) -> str:
        """Get start of current week"""
        today = datetime.datetime.now()
        week_start = today - datetime.timedelta(days=today.weekday())
        return week_start.isoformat()
    
    def _get_week_end(self) -> str:
        """Get end of current week"""
        today = datetime.datetime.now()
        week_end = today + datetime.timedelta(days=6-today.weekday())
        return week_end.isoformat()
    
    # Additional helper methods for dashboard generation
    def _format_active_goals(self, goals: List[TherapeuticGoal]) -> List[Dict[str, Any]]:
        """Format active goals for dashboard display"""
        active = [g for g in goals if g.status in ['in_progress', 'on_track', 'struggling']]
        return [
            {
                'goal_id': g.goal_id,
                'title': g.title,
                'progress_percentage': self._calculate_progress_percentage(g),
                'status': g.status,
                'next_milestone': self._get_next_milestone(g),
                'days_remaining': self._calculate_days_remaining(g)
            }
            for g in active
        ]
    
    def _analyze_progress_trends(self, progress: List[WeeklyProgress]) -> Dict[str, Any]:
        """Analyze progress trends over time"""
        if len(progress) < 2:
            return {"message": "Need more data for trend analysis"}
        
        mood_scores = [p.self_assessment_score for p in progress]
        activity_counts = [len(p.activities_completed) for p in progress]
        
        return {
            'mood_trend': self._calculate_trend(mood_scores),
            'activity_trend': self._calculate_trend(activity_counts),
            'recent_mood_average': float(np.mean(mood_scores[-4:])) if len(mood_scores) >= 4 else float(np.mean(mood_scores)),
            'improvement_velocity': self._calculate_improvement_velocity(mood_scores)
        }
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction"""
        if len(values) < 2:
            return "stable"
        
        recent_avg = np.mean(values[-3:]) if len(values) >= 3 else values[-1]
        early_avg = np.mean(values[:3]) if len(values) >= 3 else values[0]
        
        difference = recent_avg - early_avg
        
        if difference > 0.5:
            return "improving"
        elif difference < -0.5:
            return "declining"
        else:
            return "stable"
    
    def _calculate_improvement_velocity(self, mood_scores: List[float]) -> float:
        """Calculate rate of improvement"""
        if len(mood_scores) < 2:
            return 0.0
        
        # Simple linear regression slope
        x = list(range(len(mood_scores)))
        slope = np.polyfit(x, mood_scores, 1)[0]
        return float(slope)
    
    def _get_recent_achievements(self, goals: List[TherapeuticGoal]) -> List[Dict[str, Any]]:
        """Get recent achievements and milestones"""
        achievements = []
        
        for goal in goals:
            for milestone in goal.milestones:
                if milestone['achieved'] and milestone.get('achievement_date'):
                    achievement_date = datetime.datetime.fromisoformat(milestone['achievement_date'])
                    if (datetime.datetime.now() - achievement_date).days <= 30:  # Last 30 days
                        achievements.append({
                            'title': milestone['title'],
                            'goal_title': goal.title,
                            'date': milestone['achievement_date'],
                            'type': 'milestone'
                        })
        
        # Sort by date, most recent first
        achievements.sort(key=lambda x: x['date'], reverse=True)
        return achievements[:5]  # Return last 5 achievements
    
    def _identify_focus_areas(self, goals: List[TherapeuticGoal], progress: List[WeeklyProgress]) -> List[str]:
        """Identify current focus areas"""
        focus_areas = []
        
        # Active goal types
        active_goal_types = [g.goal_type for g in goals if g.status in ['in_progress', 'on_track']]
        focus_areas.extend(active_goal_types)
        
        # Areas where user is struggling
        struggling_goals = [g for g in goals if g.status == 'struggling']
        focus_areas.extend([g.goal_type for g in struggling_goals])
        
        # Areas mentioned in recent challenges
        if progress:
            recent_challenges = []
            for p in progress[-2:]:  # Last 2 weeks
                recent_challenges.extend(p.challenges_faced)
            
            # Simple keyword matching for focus areas
            challenge_text = ' '.join(recent_challenges).lower()
            if 'anxiety' in challenge_text:
                focus_areas.append('anxiety_management')
            if 'mood' in challenge_text or 'sad' in challenge_text:
                focus_areas.append('depression_recovery')
            if 'stress' in challenge_text:
                focus_areas.append('stress_reduction')
        
        return list(set(focus_areas))  # Remove duplicates
    
    def _get_upcoming_milestones(self, goals: List[TherapeuticGoal]) -> List[Dict[str, Any]]:
        """Get upcoming milestones"""
        upcoming = []
        
        for goal in goals:
            if goal.status in ['in_progress', 'on_track']:
                for milestone in goal.milestones:
                    if not milestone['achieved']:
                        target_date = datetime.datetime.fromisoformat(milestone['target_date'])
                        days_until = (target_date - datetime.datetime.now()).days
                        
                        if days_until <= 14:  # Next 2 weeks
                            upcoming.append({
                                'title': milestone['title'],
                                'goal_title': goal.title,
                                'target_date': milestone['target_date'],
                                'days_until': days_until,
                                'description': milestone['description']
                            })
        
        # Sort by days until due
        upcoming.sort(key=lambda x: x['days_until'])
        return upcoming[:3]  # Next 3 milestones
    
    def _generate_personalized_insights(self, goals: List[TherapeuticGoal], progress: List[WeeklyProgress]) -> List[str]:
        """Generate personalized insights based on user data"""
        insights = []
        
        # Goal completion insights
        completed_goals = [g for g in goals if g.status == 'achieved']
        if len(completed_goals) > 0:
            insights.append(f"You've successfully completed {len(completed_goals)} therapeutic goals - this shows your commitment to growth!")
        
        # Progress pattern insights
        if len(progress) >= 4:
            recent_mood = np.mean([p.self_assessment_score for p in progress[-4:]])
            early_mood = np.mean([p.self_assessment_score for p in progress[:4]])
            
            if recent_mood > early_mood + 1:
                insights.append("Your mood has improved significantly over time - the work you're doing is paying off!")
            elif recent_mood < early_mood - 1:
                insights.append("Your mood has been more challenging lately - this might be a good time to revisit coping strategies or reach out for additional support.")
        
        # Consistency insights
        consistency = self._calculate_consistency_score(progress)
        if consistency > 0.8:
            insights.append("Your consistency in working on goals is excellent - this steady approach is key to lasting change.")
        elif consistency < 0.4:
            insights.append("Building more consistency in your practice could help accelerate your progress.")
        
        return insights[:3]  # Return top 3 insights
    
    def _generate_recommended_actions(self, goals: List[TherapeuticGoal], progress: List[WeeklyProgress]) -> List[str]:
        """Generate recommended actions for the user"""
        recommendations = []
        
        # Based on goal status
        struggling_goals = [g for g in goals if g.status == 'struggling']
        if struggling_goals:
            recommendations.append(f"Consider adjusting your approach for '{struggling_goals[0].title}' - perhaps breaking it into smaller steps or trying different strategies.")
        
        # Based on progress trends
        if len(progress) >= 3:
            recent_activities = np.mean([len(p.activities_completed) for p in progress[-3:]])
            if recent_activities < 2:
                recommendations.append("Try to engage in at least 2-3 meaningful activities each week to maintain momentum.")
        
        # Based on upcoming milestones
        upcoming_milestones = self._get_upcoming_milestones(goals)
        if upcoming_milestones:
            next_milestone = upcoming_milestones[0]
            recommendations.append(f"Focus on achieving '{next_milestone['title']}' in the next {next_milestone['days_until']} days.")
        
        # General recommendations
        if not recommendations:
            recommendations.extend([
                "Continue your regular practice and celebrate small wins along the way.",
                "Consider setting a new goal that builds on your current progress.",
                "Take time to reflect on how far you've come in your therapeutic journey."
            ])
        
        return recommendations[:3]  # Return top 3 recommendations
    
    def _get_next_milestone(self, goal: TherapeuticGoal) -> Optional[Dict[str, Any]]:
        """Get next unachieved milestone for goal"""
        for milestone in goal.milestones:
            if not milestone['achieved']:
                return milestone
        return None
    
    def _calculate_days_remaining(self, goal: TherapeuticGoal) -> int:
        """Calculate days remaining until goal target date"""
        target_date = datetime.datetime.fromisoformat(goal.target_date)
        return (target_date - datetime.datetime.now()).days
    
    def _create_goal_suggestion(self, goal_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Create a goal suggestion based on context"""
        template = self.goal_templates.get(goal_type, self.goal_templates['emotional_regulation'])
        
        return {
            'goal_type': goal_type,
            'title': template['title'],
            'description': template['description'],
            'estimated_duration_weeks': template['typical_duration_weeks'],
            'rationale': self._generate_suggestion_rationale(goal_type, context),
            'difficulty_level': self._assess_goal_difficulty(goal_type, context)
        }
    
    def _generate_suggestion_rationale(self, goal_type: str, context: Dict[str, Any]) -> str:
        """Generate rationale for goal suggestion"""
        rationales = {
            'mindfulness_practice': "Based on your work with anxiety management, mindfulness practice would complement your existing skills and provide additional emotional regulation tools.",
            'habit_formation': "Since you've made progress with depression recovery, building positive daily habits would help maintain and strengthen your improvements.",
            'relationship_improvement': "With your foundation in emotional regulation, focusing on relationships could help you apply these skills in your interpersonal connections.",
            'anxiety_management': "Your assessment scores suggest that specific anxiety management techniques could provide significant benefit.",
            'depression_recovery': "Your recent assessments indicate that focusing on mood improvement strategies would be valuable for your well-being."
        }
        
        return rationales.get(goal_type, "This goal would complement your current therapeutic work and support continued growth.")
    
    def _assess_goal_difficulty(self, goal_type: str, context: Dict[str, Any]) -> str:
        """Assess difficulty level of suggested goal"""
        # This would consider user's current progress, clinical scores, etc.
        difficulty_mapping = {
            'mindfulness_practice': 'beginner',
            'habit_formation': 'intermediate',
            'relationship_improvement': 'advanced',
            'anxiety_management': 'intermediate',
            'depression_recovery': 'intermediate'
        }
        
        return difficulty_mapping.get(goal_type, 'intermediate')

# Global instance
goal_tracker = GoalTracker()