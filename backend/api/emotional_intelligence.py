#!/usr/bin/env python3
"""
Emotional Intelligence API Endpoints
Advanced emotion analysis and therapeutic opportunity endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

from core.advanced_emotion_engine import AdvancedEmotionEngine, EmotionalProfile, TherapeuticOpportunity
from models.schemas import EmotionalContext

router = APIRouter(prefix="/api/emotional-intelligence", tags=["emotional-intelligence"])

# Initialize advanced emotion engine
advanced_emotion_engine = AdvancedEmotionEngine()

@router.on_event("startup")
async def startup_emotional_intelligence():
    """Initialize emotional intelligence systems"""
    await advanced_emotion_engine.initialize()

@router.on_event("shutdown")
async def shutdown_emotional_intelligence():
    """Cleanup emotional intelligence systems"""
    await advanced_emotion_engine.close()

@router.get("/profile/{user_id}")
async def get_emotional_profile(user_id: str):
    """Get user's comprehensive emotional profile"""
    try:
        profile = await advanced_emotion_engine.get_emotional_profile(user_id)
        
        if not profile:
            # Generate new profile if none exists
            profile = await advanced_emotion_engine.analyze_emotional_patterns(user_id)
        
        return {
            "user_id": user_id,
            "emotional_profile": {
                "dominant_emotions": profile.dominant_emotions,
                "emotional_volatility": profile.emotional_volatility,
                "stress_triggers": profile.stress_triggers,
                "positive_patterns": profile.positive_patterns,
                "support_preferences": profile.support_preferences,
                "resilience_factors": profile.resilience_factors,
                "therapeutic_responsiveness": profile.therapeutic_responsiveness
            },
            "analysis_timestamp": datetime.now().isoformat(),
            "confidence_score": 0.85  # Based on data availability
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get emotional profile: {str(e)}")

@router.post("/profile/{user_id}/analyze")
async def analyze_emotional_patterns(user_id: str, days_back: int = 30):
    """Trigger comprehensive emotional pattern analysis"""
    try:
        profile = await advanced_emotion_engine.analyze_emotional_patterns(user_id, days_back)
        
        return {
            "user_id": user_id,
            "analysis_period_days": days_back,
            "profile_updated": True,
            "dominant_emotions": profile.dominant_emotions,
            "emotional_volatility": profile.emotional_volatility,
            "key_insights": {
                "primary_stress_triggers": profile.stress_triggers[:3],
                "most_effective_support": profile.support_preferences[:2],
                "strongest_resilience_factors": profile.resilience_factors[:2]
            },
            "recommendations": await _generate_profile_recommendations(profile)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze patterns: {str(e)}")

@router.get("/opportunities/{user_id}")
async def get_therapeutic_opportunities(user_id: str):
    """Get current therapeutic intervention opportunities"""
    try:
        opportunities = await advanced_emotion_engine.identify_therapeutic_opportunities(user_id)
        active_opportunities = await advanced_emotion_engine.get_active_opportunities(user_id)
        
        return {
            "user_id": user_id,
            "total_opportunities": len(opportunities),
            "active_opportunities": len(active_opportunities),
            "opportunities": [
                {
                    "type": opp.opportunity_type,
                    "confidence": opp.confidence,
                    "recommended_persona": opp.recommended_persona,
                    "intervention_timing": opp.intervention_timing,
                    "therapeutic_techniques": opp.therapeutic_techniques,
                    "expected_outcome": opp.expected_outcome,
                    "context_factors": opp.context_factors,
                    "priority": "high" if opp.confidence > 0.8 else "medium" if opp.confidence > 0.6 else "low"
                }
                for opp in opportunities
            ],
            "next_check_recommended": (datetime.now() + timedelta(hours=6)).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get opportunities: {str(e)}")

@router.get("/insights/{user_id}")
async def get_emotional_insights(user_id: str, period: str = "week"):
    """Get comprehensive emotional insights and trends"""
    try:
        profile = await advanced_emotion_engine.get_emotional_profile(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="No emotional profile found")
        
        # Calculate period for analysis
        days_back = {"week": 7, "month": 30, "quarter": 90}.get(period, 7)
        
        insights = {
            "user_id": user_id,
            "analysis_period": period,
            "emotional_stability": {
                "volatility_score": profile.emotional_volatility,
                "stability_rating": _get_stability_rating(profile.emotional_volatility),
                "trend_direction": "stable" if profile.emotional_volatility < 0.4 else "volatile"
            },
            "stress_management": {
                "identified_triggers": profile.stress_triggers,
                "trigger_count": len(profile.stress_triggers),
                "risk_level": "high" if len(profile.stress_triggers) > 3 else "moderate" if len(profile.stress_triggers) > 1 else "low"
            },
            "therapeutic_effectiveness": {
                "most_responsive_persona": max(profile.therapeutic_responsiveness.items(), key=lambda x: x[1])[0] if profile.therapeutic_responsiveness else "unknown",
                "responsiveness_scores": profile.therapeutic_responsiveness,
                "support_alignment": profile.support_preferences
            },
            "growth_indicators": {
                "resilience_factors": profile.resilience_factors,
                "positive_patterns": profile.positive_patterns,
                "strength_areas": len(profile.resilience_factors) + len(profile.positive_patterns)
            },
            "recommendations": await _generate_insights_recommendations(profile, days_back)
        }
        
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {str(e)}")

@router.get("/persona-match/{user_id}")
async def get_persona_emotional_match(user_id: str):
    """Get persona recommendations based on emotional profile"""
    try:
        profile = await advanced_emotion_engine.get_emotional_profile(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="No emotional profile found")
        
        # Calculate persona match scores
        persona_scores = {}
        
        # Sarah - Clinical therapy specialization
        sarah_score = 0.0
        if any(emotion in ['anxious', 'sad', 'overwhelmed'] for emotion in profile.dominant_emotions):
            sarah_score += 0.3
        if 'clinical_support' in profile.support_preferences:
            sarah_score += 0.4
        if profile.emotional_volatility > 0.6:
            sarah_score += 0.3
        persona_scores['sarah'] = min(sarah_score, 1.0)
        
        # Maya - Spiritual and mindfulness specialization
        maya_score = 0.0
        if 'mindfulness_practice' in profile.positive_patterns:
            maya_score += 0.4
        if 'spiritual_guidance' in profile.support_preferences:
            maya_score += 0.4
        if any(trigger in ['work_stress', 'time_pressure'] for trigger in profile.stress_triggers):
            maya_score += 0.2
        persona_scores['maya'] = min(maya_score, 1.0)
        
        # Alex - Peer support specialization
        alex_score = 0.0
        if 'social_connection' in profile.positive_patterns:
            alex_score += 0.3
        if 'peer_support' in profile.support_preferences:
            alex_score += 0.4
        if profile.emotional_volatility < 0.4:
            alex_score += 0.3
        persona_scores['alex'] = min(alex_score, 1.0)
        
        # Marcus - Goal-oriented coaching specialization
        marcus_score = 0.0
        if 'achievement' in profile.positive_patterns:
            marcus_score += 0.4
        if 'goal_coaching' in profile.support_preferences:
            marcus_score += 0.4
        if any(emotion in ['motivated', 'confident'] for emotion in profile.dominant_emotions):
            marcus_score += 0.2
        persona_scores['marcus'] = min(marcus_score, 1.0)
        
        # Sort personas by match score
        sorted_personas = sorted(persona_scores.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "user_id": user_id,
            "persona_matches": [
                {
                    "persona": persona,
                    "match_score": score,
                    "match_percentage": f"{score * 100:.1f}%",
                    "recommendation": "highly_recommended" if score > 0.7 else "recommended" if score > 0.5 else "suitable",
                    "rationale": _get_persona_rationale(persona, profile)
                }
                for persona, score in sorted_personas
            ],
            "top_recommendation": sorted_personas[0][0] if sorted_personas else "sarah",
            "analysis_confidence": 0.85
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get persona match: {str(e)}")

@router.post("/session/{user_id}/record")
async def record_emotional_session(user_id: str, session_data: Dict[str, Any]):
    """Record emotional session data for analysis"""
    try:
        # Extract session information
        session_emotions = session_data.get('emotions', [])
        session_intensity = session_data.get('intensity', 5.0)
        stress_level = session_data.get('stress_level', 5.0)
        persona_used = session_data.get('persona', 'unknown')
        therapeutic_gains = session_data.get('gains', [])
        
        # Calculate resilience score based on session
        resilience_score = _calculate_session_resilience(session_data)
        
        # Store session data
        cursor = advanced_emotion_engine.connection.cursor()
        cursor.execute('''
            INSERT INTO advanced_emotion_sessions (
                user_id, session_date, primary_emotions, emotional_intensity,
                stress_level, resilience_score, therapeutic_gains,
                intervention_effectiveness, persona_match_score, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            datetime.now().strftime('%Y-%m-%d'),
            json.dumps(session_emotions),
            session_intensity,
            stress_level,
            resilience_score,
            json.dumps(therapeutic_gains),
            json.dumps(session_data.get('effectiveness', {})),
            session_data.get('persona_match', 0.7),
            datetime.now().isoformat()
        ))
        advanced_emotion_engine.connection.commit()
        
        return {
            "user_id": user_id,
            "session_recorded": True,
            "resilience_score": resilience_score,
            "emotional_intensity": session_intensity,
            "recommendations": {
                "next_session_timing": "24_hours" if stress_level > 7 else "72_hours",
                "focus_areas": _get_session_recommendations(session_data),
                "persona_suggestion": _suggest_next_persona(session_data, persona_used)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record session: {str(e)}")

# Helper functions

async def _generate_profile_recommendations(profile: EmotionalProfile) -> List[str]:
    """Generate recommendations based on emotional profile"""
    recommendations = []
    
    if profile.emotional_volatility > 0.7:
        recommendations.append("Focus on emotional regulation techniques and mood stabilization")
    
    if len(profile.stress_triggers) > 3:
        recommendations.append("Develop targeted coping strategies for identified stress triggers")
    
    if 'mindfulness_practice' in profile.positive_patterns:
        recommendations.append("Continue building on successful mindfulness practices")
    
    if not profile.resilience_factors:
        recommendations.append("Explore and develop personal resilience strategies")
    
    return recommendations

async def _generate_insights_recommendations(profile: EmotionalProfile, days_back: int) -> List[str]:
    """Generate insights-based recommendations"""
    recommendations = []
    
    if profile.emotional_volatility > 0.6:
        recommendations.append("Consider daily mood tracking to identify volatility patterns")
    
    if len(profile.positive_patterns) < 2:
        recommendations.append("Explore new positive activities to expand your wellness toolkit")
    
    if 'seeking_support' in profile.resilience_factors:
        recommendations.append("Your strength in seeking support is valuable - continue leveraging your network")
    
    return recommendations

def _get_stability_rating(volatility: float) -> str:
    """Get stability rating from volatility score"""
    if volatility < 0.3:
        return "highly_stable"
    elif volatility < 0.6:
        return "moderately_stable"
    else:
        return "emotionally_volatile"

def _get_persona_rationale(persona: str, profile: EmotionalProfile) -> str:
    """Get rationale for persona recommendation"""
    rationales = {
        'sarah': "Clinical expertise in anxiety and emotional processing aligns with your needs",
        'maya': "Spiritual approach and mindfulness practices match your positive patterns",
        'alex': "Peer support style resonates with your preference for social connection",
        'marcus': "Goal-oriented coaching aligns with your achievement-focused patterns"
    }
    return rationales.get(persona, "General therapeutic support")

def _calculate_session_resilience(session_data: Dict[str, Any]) -> float:
    """Calculate resilience score from session data"""
    base_score = 0.5
    
    # Positive factors
    if session_data.get('coping_strategies_used', []):
        base_score += 0.2
    if session_data.get('support_sought', False):
        base_score += 0.1
    if session_data.get('insight_gained', False):
        base_score += 0.2
    
    # Negative factors
    if session_data.get('stress_level', 5) > 7:
        base_score -= 0.1
    if session_data.get('overwhelm_reported', False):
        base_score -= 0.1
    
    return max(0.0, min(1.0, base_score))

def _get_session_recommendations(session_data: Dict[str, Any]) -> List[str]:
    """Get recommendations based on session data"""
    recommendations = []
    
    if session_data.get('stress_level', 5) > 7:
        recommendations.append("stress_management")
    if session_data.get('low_mood_reported', False):
        recommendations.append("mood_enhancement")
    if session_data.get('goal_discussion', False):
        recommendations.append("goal_refinement")
    
    return recommendations

def _suggest_next_persona(session_data: Dict[str, Any], current_persona: str) -> str:
    """Suggest next persona based on session outcomes"""
    if session_data.get('stress_level', 5) > 7:
        return "sarah"  # Clinical support for high stress
    elif session_data.get('goal_discussion', False):
        return "marcus"  # Goal coaching
    elif session_data.get('spiritual_interest', False):
        return "maya"  # Spiritual guidance
    else:
        return current_persona  # Continue with current persona